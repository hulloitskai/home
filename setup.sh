#!/usr/bin/env bash

set -euo pipefail

echo 'Installing dependencies: `api`' >&2
cd ./api && cargo check

echo 'Installing dependencies: `web`' >&2
cd ../web && yarn install

echo 'Installing dependencies: `migrator`' >&2
cd ../migrator && yarn install

