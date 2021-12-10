# Builder:
FROM node:14-alpine3.13 AS builder

# Configure args
ARG SENTRY_URL=https://sentry.io/
ARG SENTRY_ORG=
ARG SENTRY_PROJECT=
ARG SENTRY_AUTH_TOKEN

# Install dependencies
WORKDIR /workspace/web
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build web
COPY ./ ./
RUN yarn build
RUN mkdir -p /dist && cd .. && mv web/ /dist/


# Runner:
FROM node:14-alpine3.13 AS runner

# Install system dependencies
RUN apk add --update --no-cache curl

WORKDIR /app
COPY --from=builder /dist/web/next.config.js /dist/web/package.json /dist/web/yarn.lock ./
COPY --from=builder /dist/web/public ./public/
COPY --from=builder /dist/web/.next/ ./.next/

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Configure permissions
RUN addgroup -g 1001 -S docker && \
    adduser -u 1001 -S docker && \
    chown -R docker:docker /app/.next
USER docker

# Run web
ENV NODE_ENV=production
ENV WEB_HOST=0.0.0.0
ENV WEB_PORT=8000
EXPOSE $WEB_PORT
ENTRYPOINT ["yarn"]
CMD ["start"]
HEALTHCHECK CMD curl --fail --head http://localhost:$WEB_PORT/api/health
