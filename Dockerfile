FROM cgr.dev/chainguard/node
ENV NODE_ENV=production

WORKDIR /app

COPY --chown=node:node package.json package-lock.json server.mjs .
COPY --chown=node:node dist/ ./dist/
COPY --chown=node:node node_modules/ ./node_modules/

RUN npm install --omit-dev

CMD [ "server.mjs" ]