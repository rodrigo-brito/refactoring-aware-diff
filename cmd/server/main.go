package main

import (
	"net/http"
	"refdiff/pkg/action"
	"refdiff/pkg/service"

	"github.com/go-chi/cors"

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

	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	router := chi.NewRouter()
	router.Use(cors.Handler)
	router.Use(middleware.DefaultLogger)
	router.Get("/{user}/{project}/{pr}", handler.Get)
	router.Post("/{user}/{project}/{pr}", handler.Save)

	log.Info("Listen at localhost:8080")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
