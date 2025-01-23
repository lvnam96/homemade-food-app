[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1omb5.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![wakatime](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7.svg)](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7)

## Useful links

- [Database schema documentation](https://dbdocs.io/lvnam96/Homemade-food-app) (password if asked: 123345) or [diagram only](https://dbdocs.io/embed/a7f26aa0105c8e8ad8fb07a101875556/361d2517416c4a6e85e6934448c71a1e).
- [API documentation](http://apidoc.food.lvnam.dev)
- [Services' status page](https://status.lvnam.dev)

## Platforms

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [pnpm v9](https://pnpm.io/installation)

## Development

For first-time database setup, there will be some [SQL scripts](./app/.server/db/sql) to create database schema and seed data. This is done automatically if the volume of postgres database service is empty. See [docker-compose.yml](./docker-compose.yml) for more details.

To init development server, run the following commands:

```bash
# Install dependencies (if not installed yet)
pnpm install

# Rename `.env.example` to `.env`
cp .env.example .env

# Init services
pnpm dev # enable Docker compose's watch mode to auto rebuild Remix image on deps change; press Ctrl+C to exit
```

To stop development server, run:

```bash
# Remove services' containers and volumes
pnpm dev:down
```
