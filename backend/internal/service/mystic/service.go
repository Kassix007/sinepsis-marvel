package mystic

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"

	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
	_ "github.com/lib/pq"
	"github.com/sqlc-dev/pqtype"
	"google.golang.org/genai"
)

type SearchService struct {
	db *db.Queries
}

func New(db *db.Queries) *SearchService {
	return &SearchService{
		db: db,
	}
}

type SearchResult struct {
	Title      string   `json:"title"`
	Summary    string   `json:"summary"`
	URL        string   `json:"url"`
	Categories []string `json:"categories"`
}

type RAGResponse struct {
	Answer  string         `json:"answer"`
	Results []SearchResult `json:"results"`
}

func (s *SearchService) QuerySpells(ctx context.Context, query string, limit int) (*RAGResponse, error) {
	// Initialize DB connection inside the method
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("missing DATABASE_URL")
	}
	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open DB: %w", err)
	}
	defer sqlDB.Close()

	queries := db.New(sqlDB)

	// Create Gemini client
	client, err := genai.NewClient(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	// Embed query
	contents := []*genai.Content{
		genai.NewContentFromText(query, genai.RoleUser),
	}
	embedResp, err := client.Models.EmbedContent(ctx, "gemini-embedding-001", contents, nil)
	if err != nil {
		return nil, fmt.Errorf("embedding failed: %w", err)
	}

	if len(embedResp.Embeddings) == 0 || len(embedResp.Embeddings[0].Values) == 0 {
		return nil, fmt.Errorf("empty embedding result")
	}

	// Convert embedding to []float64
	vec := embedResp.Embeddings[0].Values
	vector32 := make([]float32, len(vec))
	for i, v := range vec {
		vector32[i] = float32(v)
	}

	var b strings.Builder
	b.WriteString("[")
	for i, v := range vector32 {
		if i > 0 {
			b.WriteString(",")
		}
		b.WriteString(fmt.Sprintf("%f", v))
	}
	b.WriteString("]")
	vectorString := b.String()

	// Use the existing sqlc-generated query
	rows, err := queries.SearchSpells(ctx, db.SearchSpellsParams{
		Embedding: vectorString,
		Limit:     int32(limit),
	})
	if err != nil {
		return nil, fmt.Errorf("db query failed: %w", err)
	}

	results := make([]SearchResult, len(rows))
	for i, r := range rows {
		results[i] = SearchResult{
			Title:      r.Title,
			Summary:    r.Summary.String,
			URL:        r.Url,
			Categories: r.Categories,
		}
	}

	if len(results) == 0 {
		return &RAGResponse{Answer: "No relevant spells found.", Results: results}, nil
	}

	// Build context for LLM
	contextStr := "You are a magical librarian. Use the following retrieved spells:"
	for _, r := range results {
		contextStr += fmt.Sprintf("Title: %sSummary: %sURL: %sCategories: %v",
			r.Title, r.Summary, r.URL, r.Categories)
	}

	// Generate answer
	prompt := fmt.Sprintf("User query: %s Relevant spells: %s Answer the question clearly, cite the relevant spells when appropriate.",
		query, contextStr,
	)

	genResp, err := client.Models.GenerateContent(ctx, "gemini-1.5-flash", []*genai.Content{
		genai.NewContentFromText(prompt, genai.RoleUser),
	}, nil)
	if err != nil {
		return nil, fmt.Errorf("LLM generation failed: %w", err)
	}

	answer := ""
	for _, cand := range genResp.Candidates {
		for _, part := range cand.Content.Parts {
			answer += part.Text
		}
	}

	return &RAGResponse{
		Answer:  answer,
		Results: results,
	}, nil
}

type Spell struct {
	Pageid      int32                 `json:"pageid"`
	Title       string                `json:"title"`
	Url         string                `json:"url"`
	Summary     string                `json:"summary"`
	Categories  []string              `json:"categories"`
	Realities   []string              `json:"realities"`
	Origin      string                `json:"origin"`
	PowerClass  string                `json:"power_class"`
	AccessLevel int16                 `json:"access_level"`
	Aliases     []string              `json:"aliases"`
	Infobox     pqtype.NullRawMessage `json:"infobox"`
}

func (s *SearchService) ListSpells(ctx context.Context) ([]Spell, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("missing DATABASE_URL")
	}
	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open DB: %w", err)
	}
	defer sqlDB.Close()

	queries := db.New(sqlDB)

	rows, err := queries.GetSpells(ctx)
	if err != nil {
		return nil, fmt.Errorf("db query failed: %w", err)
	}

	spells := make([]Spell, len(rows))
	for i, r := range rows {
		spells[i] = Spell{
			Pageid:      r.Pageid,
			Title:       r.Title,
			Url:         r.Url,
			Summary:     r.Summary.String,
			Categories:  r.Categories,
			Realities:   r.Realities,
			Origin:      r.Origin.String,
			PowerClass:  r.PowerClass.String,
			AccessLevel: r.AccessLevel.Int16,
			Aliases:     r.Aliases,
			Infobox:     r.Infobox,
		}
	}

	return spells, nil
}
