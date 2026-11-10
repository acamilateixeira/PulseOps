# Front-end estático servido pelo nginx, com /api encaminhado para a API.
# Build a partir da raiz do monorepo: docker build -f apps/web/Dockerfile -t pulseops-web .
FROM node:26-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @pulseops/web...
COPY packages/contracts packages/contracts
COPY apps/web apps/web
RUN pnpm --filter @pulseops/contracts build && pnpm --filter @pulseops/web build

FROM nginx:1.31-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
