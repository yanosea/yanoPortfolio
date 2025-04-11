FROM golang:1.24 as builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

FROM alpine:latest
ARG BACK_PORT
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /main ./
EXPOSE $BACK_PORT
CMD ["./main"]
