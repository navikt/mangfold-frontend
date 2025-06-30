# build frontend and server
FROM library/node:lts-alpine3.20 AS build
WORKDIR /.
COPY package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts ./
RUN npm ci

COPY /. ./
RUN npm run build

# production environment
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --from=build /dist /usr/share/nginx/html
#COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]