FROM node:22-alpine3.20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY package.json ./

# RUN corepack install # NOTE: using this causes corepack throwing error when updating project's deps later. Use either:
# 1. keep using the installed version of corepack:
RUN corepack prepare --activate
# 2. recommended way by corepack maintainers: RUN npm install -g corepack@latest -> RUN corepack install
# 3. not synced with package manager version in package.json: RUN npm install -g pnpm@<version>
# Refs: https://github.com/pnpm/pnpm/issues/9029#issuecomment-2630882497 https://github.com/pnpm/pnpm/issues/9029#issuecomment-2629817478

COPY pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/.pnpm-store \
  pnpm config set store-dir /.pnpm-store && \
  pnpm install

COPY . .

# Using non-root user is not necessary for development
# USER node

CMD ["pnpm", "exec", "remix", "vite:dev", "--host"]