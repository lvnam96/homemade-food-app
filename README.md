[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1omb5.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![wakatime](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7.svg)](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7)

## Database schema

<iframe width="1024" height="768" src='https://dbdiagram.io/e/67400013e9daa85aca53cffc/6740396ae9daa85aca58fa1e'> </iframe>

_See it as [structured documentation](https://dbdocs.io/lvnam96/Homemade-food-app)._

## Status page

<iframe src="https://status.lvnam.dev/badge?theme=dark" width="250" height="30" frameborder="0" scrolling="no"></iframe>

> All services's status is tracked at https://status.lvnam.dev

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
