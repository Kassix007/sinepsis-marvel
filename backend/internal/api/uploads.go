package api

import (
	"net/http"
	"path/filepath"
	"strings"
)

func (s *Server) registerUploadsRoutes() {
	s.router.HandleFunc("GET /uploads/", s.handleServeFile)
}

func (s *Server) handleServeFile(w http.ResponseWriter, r *http.Request) {
	filePath := strings.TrimPrefix(r.URL.Path, "/uploads/")
	if filePath == "" {
		http.NotFound(w, r)
		return
	}

	fullPath := filepath.Join("uploads", filepath.Clean(filePath))

	http.ServeFile(w, r, fullPath)
}
