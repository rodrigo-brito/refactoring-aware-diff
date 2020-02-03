package model

import "time"

type Job struct {
	PR           int                   `json:"pr"`
	CreatedAt    time.Time             `json:"created_at"`
	Refactorings RefactoringCollection `json:"refactorings"`
}

type Refactoring struct {
	Type             string `json:"type"`
	ObjectType       string `json:"object_type"`
	BeforeLocalName  string `json:"before_local_name"`
	BeforeFileName   string `json:"before_file_name"`
	BeforeBegin      int    `json:"before_begin"`
	BeforeEnd        int    `json:"before_end"`
	BeforeLineNumber int    `json:"before_line_number"`
	AfterLocalName   string `json:"after_local_name"`
	AfterFileName    string `json:"after_file_name"`
	AfterBegin       int    `json:"after_begin"`
	AfterEnd         int    `json:"after_end"`
	AfterLineNumber  int    `json:"after_line_number"`
}

type RefactoringCollection []*Refactoring
