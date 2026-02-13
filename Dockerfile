FROM node:20-alpine AS builder

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production


COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public


ENV NODE_ENV= ${NODE_ENV}
ENV DB_HOST= ${DB_HOST}
ENV DB_PORT= ${DB_PORT}
ENV DB_USER= ${DB_USER}
ENV DB_PASSWORD= ${DB_PASSWORD}
ENV DB_NAME= ${DB_NAME}


EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
