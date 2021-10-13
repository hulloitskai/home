# Builder:
FROM rust:1.54-alpine AS builder

# Install system dependencies.
RUN apk add --update --no-cache musl-dev

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}

# Build dependencies and entity framework.
WORKDIR /workspace/api
RUN cargo init --bin --name api
COPY ./ent/ ./ent/
COPY Cargo.toml Cargo.lock ./
RUN cargo build --release

# Build api.
RUN rm src/*.rs
COPY ./build.rs ./build.rs
COPY ./src/ ./src/
RUN cargo build --release

RUN mkdir -p /dist && mv ./target/release/home-api /dist/api


# Runner:
FROM alpine:3 AS runner
RUN apk add --update --no-cache ca-certificates curl

WORKDIR /app
COPY --from=builder /dist/api ./

RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/api
USER docker

# TODO: Add healthchecks.

ENV HOME_API_ENV=production
ENV HOME_API_PORT=3000
EXPOSE 3000
ENTRYPOINT ["/app/api"]
