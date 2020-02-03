package main

import (
	"net/http"
	"refdiff/pkg/action"
	"refdiff/pkg/service"

	firebase "firebase.google.com/go"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	log "github.com/sirupsen/logrus"
	"golang.org/x/net/context"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()
	app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsFile("firebase.json"))
	if err != nil {
		log.Fatal(err)
	}

	refactoring, err := service.NewRefactoring(ctx, app)
	if err != nil {
		log.Fatal(err)
	}

	handler := action.NewHandler(refactoring)

	router := chi.NewRouter()
	router.Use(middleware.DefaultLogger)
	router.Get("/{user}/{project}/{pr}", handler.Get)
	router.Post("/{user}/{project}/{pr}", handler.Save)

	log.Info("Listen at localhost:8080")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
