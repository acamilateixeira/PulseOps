# Imagem da API. Build a partir da raiz do monorepo:
#   docker build -f apps/api/Dockerfile -t pulseops-api .
FROM node:26-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @pulseops/api...
COPY packages/contracts packages/contracts
COPY apps/api apps/api
RUN pnpm --filter @pulseops/contracts build \
 && pnpm --filter @pulseops/api build \
 && pnpm --filter @pulseops/api deploy --prod --legacy /out

FROM node:26-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
CMD ["node", "dist/src/main.js"]
