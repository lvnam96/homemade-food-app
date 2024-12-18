[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/1omb5.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![wakatime](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7.svg)](https://wakatime.com/badge/user/627979e0-f793-4b0a-b22f-899fedaabd2e/project/ee423f4f-df27-4e49-bc46-fee69d5f44b7)

## Useful links

- [Database schema documentation](https://dbdocs.io/lvnam96/Homemade-food-app) (password if asked: 123345) or [diagram only](https://dbdiagram.io/e/67400013e9daa85aca53cffc/6740396ae9daa85aca58fa1e).
- [API documentation](http://apidoc.food.lvnam.dev)
- [Services' status page](https://status.lvnam.dev)

## Development

For first-time database setup, there will be some [setup SQL scripts](./app/.server/db/sql) to setup database schema and seed data. They are automatically executed when init the database container the first time (empty database). See [db.Dockerfile](./db.Dockerfile) for details.

To init development server, run the following commands:

```bash
# Install dependencies (if not installed yet)
pnpm install

# Init dev server
pnpm dev
```
