FROM node:21.6-slim as builder
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine AS runtime
ARG FRONT_PORT
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE $FRONT_PORT
