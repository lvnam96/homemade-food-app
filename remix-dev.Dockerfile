FROM node:22-alpine3.20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY package.json ./

RUN corepack install

COPY pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/.pnpm-store \
  pnpm config set store-dir /.pnpm-store && \
  pnpm install

COPY . .

USER node

CMD ["pnpm", "exec", "remix", "vite:dev", "--host"]