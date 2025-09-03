// Package auth provides services for user authentication
package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthService struct {
	db                *db.Queries
	GoogleOAuthConfig *oauth2.Config
}

func New(db *db.Queries) *AuthService {
	return &AuthService{
		db: db,
		GoogleOAuthConfig: &oauth2.Config{
			RedirectURL:  "http://localhost:8080/api/auth/google/callback",
			ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
			ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (a *AuthService) GenerateGoogleAuthURL() (string, string, error) {
	// Generate random state
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	state := base64.URLEncoding.EncodeToString(b)

	// Generate the OAuth2 URL
	url := a.GoogleOAuthConfig.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline, // request refresh token
		oauth2.ApprovalForce,     // force approval (optional)
	)

	return url, state, nil
}

func (a *AuthService) HandleGoogleCallback(ctx context.Context, code string) (*db.User, error) {
	token, err := a.GoogleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("could not get token: %w", err)
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("could not get user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("could not read user info body: %w", err)
	}

	var userInfo struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("could not unmarshal user info: %w", err)
	}

	fmt.Printf("%+v\n", userInfo)

	user, err := a.db.GetUserByEmail(ctx, userInfo.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			// User does not exist, create a new one
			newUser, err := a.db.CreateUser(ctx, db.CreateUserParams{
				Email: userInfo.Email,
				PasswordHash: sql.NullString{
					String: "",
					Valid:  false,
				},
				Name: sql.NullString{
					String: userInfo.Name,
					Valid:  userInfo.Name != "",
				},
				AvatarUrl: sql.NullString{
					String: userInfo.Picture,
					Valid:  userInfo.Picture != "",
				},
			})
			if err != nil {
				return nil, fmt.Errorf("could not create user: %w", err)
			}

			// Link OAuth account
			_, err = a.db.LinkOAuthAccount(ctx, db.LinkOAuthAccountParams{
				UserID:         newUser.ID,
				Provider:       "google",
				ProviderUserID: userInfo.ID,
				AccessToken:    sql.NullString{String: token.AccessToken, Valid: true},
				RefreshToken:   sql.NullString{String: token.RefreshToken, Valid: true},
				ExpiresAt:      sql.NullTime{Time: token.Expiry, Valid: true},
			})
			if err != nil {
				return nil, fmt.Errorf("could not link OAuth account: %w", err)
			}

			return &newUser, nil
		}

		return nil, fmt.Errorf("could not get user: %w", err)
	}

	// User exists, update / link OAuth account if needed
	_, err = a.db.LinkOAuthAccount(ctx, db.LinkOAuthAccountParams{
		UserID:         user.ID,
		Provider:       "google",
		ProviderUserID: userInfo.ID,
		AccessToken:    sql.NullString{String: token.AccessToken, Valid: true},
		RefreshToken:   sql.NullString{String: token.RefreshToken, Valid: true},
		ExpiresAt:      sql.NullTime{Time: token.Expiry, Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("could not link OAuth account: %w", err)
	}

	return &user, nil
}

func (a *AuthService) Register(
	ctx context.Context,
	email string,
	password string,
	name string,
	file multipart.File,
	handler *multipart.FileHeader,
) (*db.User, error) {
	emails, err := a.db.SelectByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if len(emails) > 0 {
		return nil, fmt.Errorf("email already exists")
	}

	var filepath string

	if file != nil && handler != nil {
		filepath = fmt.Sprintf("uploads/%d_%s", time.Now().Unix(), handler.Filename)
		dst, err := os.Create(filepath)
		if err != nil {
			return nil, fmt.Errorf("failed to save profile picture: %w", err)
		}
		defer dst.Close()

		if _, err := io.Copy(dst, file); err != nil {
			return nil, fmt.Errorf("failed to save profile picture: %w", err)
		}
	} 

	avatarUrl := filepath[len("uploads/"):]

	// TODO: hash password before storing
	student, err := a.db.CreateUser(ctx, db.CreateUserParams{
		Email: email,
		PasswordHash: sql.NullString{
			String: password,
			Valid:  true,
		},
		Name: sql.NullString{
			String: name,
			Valid:  true,
		},
		AvatarUrl: sql.NullString{
			String: avatarUrl,
			Valid:  avatarUrl != "",
		},
	})
	if err != nil {
		return nil, err
	}

	return &student, nil
}

func (a *AuthService) Login(ctx context.Context, email, password string) (*db.User, error) {
	user, err := a.db.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	// TODO: Handle password hash
	if password != user.PasswordHash.String {
		return nil, fmt.Errorf("invalid credentials")
	}

	return &user, nil
}
