# Builder:
FROM node:14-alpine3.13 AS builder

WORKDIR /workspace/migrator
COPY ./package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN mkdir -p /dist && cd .. && mv ./migrator/ /dist/


# Runner:
FROM node:14-alpine3.13 AS runner

WORKDIR /app
COPY migrations/ migrations/
COPY migrate-mongo-config.js ./
COPY --from=builder /dist/migrator/node_modules/ node_modules/
COPY --from=builder /dist/migrator/package.json package.json

ENTRYPOINT ["yarn"]
CMD ["up"]
