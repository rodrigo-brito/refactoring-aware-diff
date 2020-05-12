# RefDiff Server

Rest API for RefDiff Plugin

## Execution

Before start the project, put the firebase credentials on project root: `firebase.json`

```bash
go build -o server cmd/server/main.go
./server
```

## Image Build

```bash
docker build -t rodrigobrito/refdiff:server .
docker push rodrigobrito/refdiff:server
```

## Endpoints

- `POST /new` - Save refactorings for a given PR / Commit
- `GET /get/{id}` - Get refactorings found in a given PR / Commit
