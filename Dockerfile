# Dockerfile to build Remix.run application with `pnpm` as package manager

# Use the official Node.js image as the base image
FROM node:22-alpine3.20

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and pnpm-lock.yaml files to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application files to the container
COPY . .

# Build the Remix application
RUN pnpm build

# Expose port 3000
ENV PORT=3000

EXPOSE $PORT

# Start the Remix application
CMD ["pnpm", "start", "--port", "$PORT"]