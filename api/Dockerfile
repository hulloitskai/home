# Build app:
FROM rust:1.54-alpine as builder

# Install system dependencies.
#
# NOTE: openssl-dev is required to build oauth2 library.
RUN apk add --update --no-cache musl-dev openssl-dev

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION}

# Build dependencies and proc-macros.
WORKDIR /workspace/api
RUN cargo init --bin --name api
COPY macros/Cargo.toml macros/Cargo.lock macros/
COPY macros/src/ macros/src/
COPY Cargo.toml Cargo.lock ./
RUN cargo rustc --release -- -C target-feature=-crt-static

# Build api.
RUN rm src/*.rs
COPY ./build.rs ./build.rs
COPY ./src/ ./src/
RUN cargo build --release

RUN mkdir -p /dist && mv ./target/release/home-api /dist/api


# Build image:
FROM alpine:3.13 AS runner
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
