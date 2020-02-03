package service

import (
	"context"
	"fmt"
	"refdiff/pkg/model"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
)

const collectionName = "refactoring"

type Refactoring interface {
	FetchByPullRequest(ctx context.Context, project string, ID int) (*model.Job, error)
	Save(ctx context.Context, project string, pr int, refactorings []*model.Refactoring) error
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

func (r *refactoring) FetchByPullRequest(ctx context.Context, project string, pr int) (*model.Job, error) {
	doc, err := r.firestore.Collection(collectionName).Doc(getDocID(project, pr)).Get(ctx)
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

func getDocID(project string, ID int) string {
	return fmt.Sprintf("%s/%d", project, ID)
}

func (r *refactoring) Save(ctx context.Context, project string, pr int, refactorings []*model.Refactoring) error {
	_, err := r.firestore.Collection(collectionName).Doc(getDocID(project, pr)).Set(ctx, &model.Job{
		PR:           pr,
		CreatedAt:    time.Now(),
		Refactorings: refactorings,
	})
	return err
}
