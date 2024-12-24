FROM node:22-alpine3.20

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@9

COPY . .

RUN pnpm install

CMD ["pnpm", "exec", "remix", "vite:dev", "--host"]