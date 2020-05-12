package service

import (
	"context"
	"refdiff/pkg/model"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
)

type Refactoring interface {
	Fetch(ctx context.Context, id string) (*model.Job, error)
	Save(ctx context.Context, payload Payload) error
}

type Payload struct {
	ID            string                      `json:"id"`
	PullRequest   int                         `json:"pr"`
	CreatedAt     time.Time                   `json:"created_at"`
	ExecutionTime int                         `json:"execution_time"`
	Refactorings  model.RefactoringCollection `json:"refactorings"`
}

type refactoring struct {
	firestore *firestore.Client
}

func NewRefactoring(ctx context.Context, app *firebase.App) (Refactoring, error) {
	firestore, err := app.Firestore(ctx)
	if err != nil {
		return nil, err
	}

	return &refactoring{
		firestore,
	}, nil
}

func (r *refactoring) Fetch(ctx context.Context, id string) (*model.Job, error) {
	doc, err := r.firestore.Doc(id).Get(ctx)
	if err != nil {
		return nil, err
	}

	if doc.Exists() {
		var job model.Job
		err = doc.DataTo(&job)
		return &job, err
	}

	return nil, nil
}

func (r *refactoring) Save(ctx context.Context, payload Payload) error {
	_, err := r.firestore.Doc(payload.ID).Set(ctx, &model.Job{
		PR:            payload.PullRequest,
		CreatedAt:     time.Now(),
		Refactorings:  payload.Refactorings,
		ExecutionTime: payload.ExecutionTime,
	})
	return err
}
