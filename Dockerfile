FROM golang:latest as build
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go

FROM scratch
WORKDIR /app
COPY --from=build /app/server .
COPY firebase.json .

CMD ["/app/server"]