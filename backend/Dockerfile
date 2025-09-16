FROM golang:1.20-alpine AS builder

WORKDIR /app

# Install build deps
RUN apk add --no-cache git

# Copy go mod and sum first for better caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ecommgo main.go

FROM gcr.io/distroless/base-debian11

WORKDIR /app

COPY --from=builder /app/ecommgo /app/ecommgo

ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["/app/ecommgo"]



