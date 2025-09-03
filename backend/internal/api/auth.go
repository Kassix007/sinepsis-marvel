package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ieeemumsb/Sinepsis/backend/internal/middleware"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) registerAuthRoutes() {
	s.router.HandleFunc("POST /api/auth/register", s.handleRegister)
	s.router.HandleFunc("POST /api/auth/login", s.handleLogin)
	s.router.HandleFunc("GET /api/auth/google/login", s.handleGoogleLogin)
	s.router.HandleFunc("GET /api/auth/google/callback", s.handleGoogleCallback)
	s.router.HandleFunc("GET /api/profile", middleware.JwtAuthMiddleware(s.handleProfile))
}

func (s *Server) handleProfile(w http.ResponseWriter, r *http.Request) {
	response.RespondWithSuccess(w, "This is a protected route", nil)
}

func (s *Server) handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	url, state, err := s.authService.GenerateGoogleAuthURL()
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to generate login URL")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "oauthstate",
		Value:    state,
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		Path:     "/",
	})

	// Redirect the user directly to Google
	http.Redirect(w, r, url, http.StatusFound)
}

func (s *Server) handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	oauthState, err := r.Cookie("oauthstate")
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Missing oauth state cookie")
		return
	}

	if r.FormValue("state") != oauthState.Value {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid oauth state")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Missing code parameter")
		return
	}

	user, err := s.authService.HandleGoogleCallback(r.Context(), code)
	if err != nil {
		log.Println("Google callback error:", err)
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to handle google callback")
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString([]byte("secret"))
	if err != nil {
		log.Println("JWT signing error:", err)
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenString,
		HttpOnly: true,
		Secure:   true, // set to true in production
		Path:     "/",
	})

	http.Redirect(w, r, "http://localhost:3000/landingpage", http.StatusSeeOther)
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(5 << 20) // 5 MB
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	name := r.FormValue("name")
	email := r.FormValue("email")
	password := r.FormValue("password")

	// Validation checks
	if name == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}
	if email == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Email is required")
		return
	}
	if !strings.Contains(email, "@") {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid email format")
		return
	}
	if len(password) < 8 {
		response.RespondWithError(w, http.StatusBadRequest, "Password must be at least 8 characters long")
		return
	}

	file, handler, _ := r.FormFile("profile_picture") // optional
	defer func() {
		if file != nil {
			file.Close()
		}
	}()

	user, err := s.authService.Register(
		r.Context(),
		email,
		password,
		name,
		file,
		handler,
	)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.RespondWithSuccess(w, "Successfully registered", user)
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Authenticate user
	user, err := s.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(24 * time.Hour).Unix(), // expires in 24h
	})

	tokenString, err := token.SignedString([]byte("secret"))
	if err != nil {
		log.Println(err.Error())
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenString,
		HttpOnly: true,
		Secure:   true, // set to true in production
		Path:     "/",
	})

	response.RespondWithSuccess(w, "Login successful", map[string]string{
		"token": tokenString,
	})
}
