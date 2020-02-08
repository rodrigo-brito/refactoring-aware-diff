package action

import (
	"encoding/json"
	"fmt"
	"net/http"
	"refdiff/pkg/model"
	"refdiff/pkg/service"
	"strconv"

	"github.com/go-chi/chi"
	log "github.com/sirupsen/logrus"
)

type Handler struct {
	service service.Refactoring
}

func NewHandler(service service.Refactoring) *Handler {
	return &Handler{
		service,
	}
}

func (h *Handler) Save(w http.ResponseWriter, r *http.Request) {
	user := chi.URLParam(r, "user")
	project := chi.URLParam(r, "project")
	pr := chi.URLParam(r, "pr")
	prNumber, err := strconv.Atoi(pr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var refactorings model.RefactoringCollection
	err = json.NewDecoder(r.Body).Decode(&refactorings)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	err = h.service.Save(r.Context(), fmt.Sprintf("%s/%s", user, project), prNumber, refactorings)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	user := chi.URLParam(r, "user")
	project := chi.URLParam(r, "project")
	pr := chi.URLParam(r, "pr")
	prNumber, err := strconv.Atoi(pr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	refactorings, err := h.service.FetchByPullRequest(r.Context(), fmt.Sprintf("%s/%s", user, project), prNumber)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(refactorings)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
}
