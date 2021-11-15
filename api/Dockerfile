# Builder:
FROM rust:1.56-alpine AS builder

# Install system dependencies
RUN apk add --update --no-cache musl-dev

# Build dependencies
WORKDIR /workspace/api
RUN cargo init --bin --name api
COPY Cargo.toml Cargo.lock ./
RUN cargo build --release

# Build api
RUN rm src/*.rs
COPY ./build.rs ./build.rs
COPY ./src/ ./src/
RUN cargo build --release

RUN mkdir -p /dist && mv ./target/release/api /dist/api


# Runner:
FROM alpine:3 AS runner
RUN apk add --update --no-cache ca-certificates curl

WORKDIR /app
COPY --from=builder /dist/api ./

# Configure permissions
RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/api
USER docker

# Run api
ENV API_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3000
EXPOSE $API_PORT
ENTRYPOINT ["/app/api"]
HEALTHCHECK CMD curl --fail --head http://localhost:$API_PORT
