FROM node:23-alpine3.21 as base
WORKDIR /usr/src/app

FROM base as prod_dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM base as builder
COPY package.json package-lock.json ./
COPY --from=prod_dependencies /usr/src/app/node_modules ./node_modules
RUN npm install
COPY . .
RUN npm run build

FROM base as runner
COPY --from=prod_dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/package-lock.json ./package-lock.json

CMD ["npm", "run", "start:prod"]