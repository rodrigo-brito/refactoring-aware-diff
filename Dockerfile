FROM golang:1.13 as build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server cmd/server/main.go

FROM alpine
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=build /app/server /app/server
CMD ["/app/server"]