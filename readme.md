# RefDiff Server

Rest API for RefDiff Plugin

## Execution

Before start the project, put the firebase credentials on project root: `firebase.json`

```bash
go build -o server cmd/server/main.go
./server
```

## Endpoints

- `POST /user/repo/id` - Save refactorings for a given PR
- `GET /user/repo/id` - Get refactorings found in a given PR
