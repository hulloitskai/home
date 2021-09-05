# Build app:
FROM node:14-alpine3.13 AS builder

WORKDIR /workspace/web
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn build
RUN mkdir -p /dist && cd .. && mv web/ /dist/


# Build image:
FROM node:14-alpine3.13 AS runner
RUN apk add --update --no-cache curl

WORKDIR /app
COPY --from=builder /dist/web/next.config.js ./
# COPY --from=builder /dist/web/public ./public
COPY --from=builder /dist/web/.next/ .next/
COPY --from=builder /dist/web/node_modules/ node_modules/
COPY --from=builder /dist/web/package.json package.json

RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/.next
USER docker

# TODO: Add healthchecks.

ENV NODE_ENV=production
EXPOSE 8000
ENTRYPOINT ["yarn"]
CMD ["start"]
