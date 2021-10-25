#!/usr/bin/env bash

set -euo pipefail

echo 'Installing dependencies: `api`' >&2
cd ./api && cargo check && cd ..

echo 'Installing dependencies: `web`' >&2
cd ./web && yarn install && cd ..

echo 'Installing dependencies: `migrator`' >&2
cd ./migrator && yarn install && cd ..

echo 'Bootstrapping .env from .env.example' >&2
cp .env.example .env
