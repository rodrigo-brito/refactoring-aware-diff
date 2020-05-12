package model

import "time"

type Job struct {
	PR            int                   `firestore:"pr"`
	ExecutionTime int                   `firestore:"execution_time"`
	CreatedAt     time.Time             `firestore:"created_at"`
	Refactorings  RefactoringCollection `firestore:"refactorings"`
}

type Refactoring struct {
	Type             string `firestore:"type" json:"type"`
	ObjectType       string `firestore:"object_type" json:"object_type"`
	BeforeLocalName  string `firestore:"before_local_name" json:"before_local_name"`
	BeforeFileName   string `firestore:"before_file_name" json:"before_file_name"`
	BeforeBegin      int    `firestore:"before_begin" json:"before_begin"`
	BeforeEnd        int    `firestore:"before_end" json:"before_end"`
	BeforeLineNumber int    `firestore:"before_line_number" json:"before_line_number"`
	AfterLocalName   string `firestore:"after_local_name" json:"after_local_name"`
	AfterFileName    string `firestore:"after_file_name" json:"after_file_name"`
	AfterBegin       int    `firestore:"after_begin" json:"after_begin"`
	AfterEnd         int    `firestore:"after_end" json:"after_end"`
	AfterLineNumber  int    `firestore:"after_line_number" json:"after_line_number"`
}

type RefactoringCollection []*Refactoring
