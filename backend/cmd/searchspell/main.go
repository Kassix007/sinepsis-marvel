package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib" // pgx driver for database/sql
	"google.golang.org/genai"
)

type server struct {
	db               *sql.DB
	geminiKey        string
	modelGen         string
	modelEmbed       string
	httpClient       *http.Client
	listenAddr       string
	dbQueryTimeout   time.Duration
	llmCallTimeout   time.Duration
	embedCallTimeout time.Duration
}

func getenv(name, def string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return def
}

func main() {
	// --- config
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("set DATABASE_URL")
	}
	geminiKey := os.Getenv("GOOGLE_API_KEY")
	if geminiKey == "" {
		log.Fatal("set GOOGLE_API_KEY")
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(30 * time.Minute)

	s := &server{
		db:               db,
		geminiKey:        geminiKey,
		modelGen:         getenv("GEMINI_MODEL", "gemini-2.5-flash"),
		modelEmbed:       getenv("GEMINI_EMBED_MODEL", "text-embedding-004"),
		httpClient:       &http.Client{Timeout: 60 * time.Second},
		listenAddr:       getenv("LISTEN_ADDR", ":8080"),
		dbQueryTimeout:   15 * time.Second,
		llmCallTimeout:   30 * time.Second,
		embedCallTimeout: 20 * time.Second,
	}

	http.HandleFunc("/healthz", s.handleHealth)
	http.HandleFunc("/ask", s.handleAsk)

	log.Println("searchspell listening on", s.listenAddr)
	log.Fatal(http.ListenAndServe(s.listenAddr, nil))
}

// ---------- handlers ----------

func (s *server) handleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.db.PingContext(ctx); err != nil {
		http.Error(w, "db not ok: "+err.Error(), http.StatusServiceUnavailable)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

type askRequest struct {
	Query       string   `json:"query"`
	TopK        int      `json:"top_k"`
	OnlyStrange *bool    `json:"only_strange,omitempty"`
	Realities   []string `json:"realities,omitempty"` // matches any
}

type hit struct {
	PageID      int64    `json:"pageid"`
	Title       string   `json:"title"`
	Summary     string   `json:"summary"`
	URL         string   `json:"url"`
	ImageURL    *string  `json:"image_url,omitempty"`
	Realities   []string `json:"realities"`
	Categories  []string `json:"categories"`
	UsedStrange bool     `json:"used_by_doctor_strange"`
	Distance    float64  `json:"distance"`
}

type askResponse struct {
	Answer  string `json:"answer"`
	Results []hit  `json:"results"`
}

func (s *server) handleAsk(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST only", http.StatusMethodNotAllowed)
		return
	}
	var req askRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Query) == "" {
		http.Error(w, "invalid body; need {query}", http.StatusBadRequest)
		return
	}
	if req.TopK <= 0 || req.TopK > 50 {
		req.TopK = 6
	}

	// 1) server-side query embedding (Gemini)
	ctxEmb, cancelEmb := context.WithTimeout(r.Context(), s.embedCallTimeout)
	defer cancelEmb()
	vec, err := s.embedGemini(ctxEmb, req.Query)
	if err != nil {
		http.Error(w, "embed error: "+err.Error(), http.StatusBadGateway)
		return
	}

	// 2) pgvector similarity search (with optional filters)
	ctxDB, cancelDB := context.WithTimeout(r.Context(), s.dbQueryTimeout)
	defer cancelDB()
	hits, err := s.searchByVector(ctxDB, vec, req)
	if err != nil {
		http.Error(w, "db query error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3) natural answer with Gemini using only DB hits as context
	ctxLLM, cancelLLM := context.WithTimeout(r.Context(), s.llmCallTimeout)
	defer cancelLLM()
	answer, err := s.answerWithGemini(ctxLLM, req.Query, hits)
	if err != nil {
		http.Error(w, "gemini error: "+err.Error(), http.StatusBadGateway)
		return
	}

	writeJSON(w, http.StatusOK, askResponse{Answer: answer, Results: hits})
}

// ---------- embeddings (Gemini) ----------

func (s *server) embedGemini(ctx context.Context, text string) ([]float64, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil, errors.New("empty text")
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  s.geminiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("genai client: %w", err)
	}
	defer client.Close()

	resp, err := client.Models.BatchEmbedContents(ctx, s.modelEmbed, []*genai.EmbedContentRequest{
		{Content: &genai.Content{Parts: []*genai.Part{{Text: text}}}},
	})
	if err != nil {
		return nil, err
	}
	if len(resp.Embeddings) == 0 || len(resp.Embeddings[0].Values) == 0 {
		return nil, errors.New("gemini empty embedding")
	}

	vals := resp.Embeddings[0].Values
	out := make([]float64, len(vals))
	for i, v := range vals {
		out[i] = float64(v)
	}
	return out, nil
}

// ---------- search (pgvector) ----------

func (s *server) searchByVector(ctx context.Context, vec []float64, req askRequest) ([]hit, error) {
	const q = `
SELECT
  pageid, title, summary, url, image_url, realities, categories,
  used_by_doctor_strange,
  (embedding <-> $1::vector) AS distance
FROM spells
WHERE
  ($2::boolean IS NULL OR used_by_doctor_strange = $2)
  AND (
    $3::text[] IS NULL OR $3::text[] = '{}'::text[] OR (realities && $3::text[])
  )
ORDER BY embedding <-> $1::vector
LIMIT $4;
`
	var only any = nil
	if req.OnlyStrange != nil {
		only = *req.OnlyStrange
	}
	var realms any = nil
	if n := len(req.Realities); n > 0 {
		realms = "{" + strings.Join(req.Realities, ",") + "}"
	}

	rows, err := s.db.QueryContext(ctx, q, vectorLiteral(vec), only, realms, req.TopK)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []hit
	for rows.Next() {
		var h hit
		var imageURL sql.NullString
		var realities, categories []byte
		if err := rows.Scan(
			&h.PageID, &h.Title, &h.Summary, &h.URL, &imageURL,
			&realities, &categories, &h.UsedStrange, &h.Distance,
		); err != nil {
			return nil, err
		}
		if imageURL.Valid {
			u := imageURL.String
			h.ImageURL = &u
		}
		h.Realities = parsePGTextArray(realities)
		h.Categories = parsePGTextArray(categories)
		out = append(out, h)
	}
	return out, rows.Err()
}

// ---------- Gemini answer ----------

func (s *server) answerWithGemini(ctx context.Context, userQuery string, hits []hit) (string, error) {
	if strings.TrimSpace(userQuery) == "" {
		return "", errors.New("empty query")
	}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  s.geminiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return "", fmt.Errorf("genai client: %w", err)
	}
	defer client.Close()

	// compact, grounded context
	type brief struct {
		Title       string   `json:"title"`
		URL         string   `json:"url"`
		Summary     string   `json:"summary"`
		Realities   []string `json:"realities"`
		UsedStrange bool     `json:"used_by_doctor_strange"`
	}
	var briefs []brief
	for _, h := range hits {
		briefs = append(briefs, brief{
			Title:       h.Title,
			URL:         h.URL,
			Summary:     h.Summary,
			Realities:   h.Realities,
			UsedStrange: h.UsedStrange,
		})
	}
	ctxJSON, _ := json.Marshal(briefs)

	sys := "You are a precise Marvel wiki assistant. Answer using ONLY the provided context. " +
		"Prefer concise bullets. Include spell names as markdown links to their URL when helpful. " +
		"If uncertain, say so briefly."

	prompt := fmt.Sprintf("%s\n\nUser question: %s\n\nContext JSON (top matches):\n%s",
		sys, userQuery, string(ctxJSON))

	resp, err := client.Models.GenerateContent(
		ctx,
		s.modelGen,
		[]*genai.Content{{Parts: []*genai.Part{{Text: prompt}}}},
		nil,
	)
	if err != nil {
		return "", err
	}

	var sb strings.Builder
	for _, c := range resp.Candidates {
		for _, p := range c.Content.Parts {
			if p.Text != "" {
				sb.WriteString(p.Text)
			}
		}
	}
	out := strings.TrimSpace(sb.String())
	if out == "" {
		out = "I couldn't compose an answer from the current context."
	}
	return out, nil
}

// ---------- utils ----------

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func parsePGTextArray(b []byte) []string {
	if len(b) == 0 {
		return nil
	}
	s := string(b) // e.g. {Earth-616,Magic Spells}
	s = strings.TrimPrefix(s, "{")
	s = strings.TrimSuffix(s, "}")
	if strings.TrimSpace(s) == "" {
		return []string{}
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(strings.Trim(p, `"`))
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func vectorLiteral(vec []float64) string {
	var b strings.Builder
	b.WriteByte('[')
	for i, x := range vec {
		if i > 0 {
			b.WriteByte(',')
		}
		b.WriteString(trimFloat(x))
	}
	b.WriteByte(']')
	return b.String()
}

func trimFloat(f float64) string {
	s := fmt.Sprintf("%.6f", f)
	s = strings.TrimRight(s, "0")
	s = strings.TrimRight(s, ".")
	if s == "" || s == "-0" || math.IsNaN(f) || math.IsInf(f, 0) {
		return "0"
	}
	return s
}
