# home

_My personal homepage and API._

> Home is where the heart is.

This is a place where you can learn more about me, whether or not I'm alive,
and potentially how I might be doing! It's still very much a work-in-progress.

_Here's a quick set of questions this website should
cover:_

- [x] Is this person alive?
- [x] What is this person listening to?
- [ ] Where is this person?
- [ ] How is this person doing today?
- [ ] How do I meet this person?
- [x] What's this person been up to?

> This site is currently live at [itskai.me](https://itskai.me)!

## Development

> You'll need [Rust](https://www.rust-lang.org/learn/get-started),
> [Volta](https://docs.volta.sh/guide/getting-started),
> and [Docker](https://docs.docker.com/get-started/) for development.

### Setup

1. Clone the repo:

   ```bash
   git clone git@github.com:hulloitskai/home
   ```

2. Bootstrap the workspace:

   ```bash
   ./bootstrap-workspace.sh
   ```

3. Fill out [`.env`](.env) file:

   ```bash
   vi .env
   ```

4. Start background dependencies:

   ```bash
   docker compose up -d
   ```

5. Run database migrations:

   ```bash
   cd migrator && yarn up
   ```

6. In **Terminal 1**, start `api`:

   ```bash
   cd api && cargo run
   ```

7. In **Terminal 2**, start `web`:

   ```bash
   cd web && yarn dev
   ```

### Teardown

1. Close both **Terminal 1** and **Terminal 2**.

2. Stop background dependencies:

   ```bash
   docker compose down
   ```
