[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1omb5.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![wakatime](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7.svg)](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7)

## Database schema

See it as [structured documentation](https://dbdocs.io/lvnam96/Homemade-food-app) (PW: 123345) or [diagram](https://dbdiagram.io/e/67400013e9daa85aca53cffc/6740396ae9daa85aca58fa1e).

## Status page

All services are tracked at https://status.lvnam.dev

## Development

For first-time database setup, there will be a bash script at `./app/.server/db/setup_db.sh` for easier setup PostgreSQL database.

```bash
# First-time setup
pnpm install && chmod 700 ./app/.server/db/setup_db.sh && ./app/.server/db/setup_db.sh
```

Init dev server:

```bash
pnpm dev
```
