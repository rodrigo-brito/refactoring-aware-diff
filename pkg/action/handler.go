package action

import (
	"encoding/json"
	"net/http"
	"refdiff/pkg/service"

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
	var payload service.Payload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	err = h.service.Save(r.Context(), payload)
	if err != nil {
		log.Error(err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	refactorings, err := h.service.Fetch(r.Context(), id)
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
