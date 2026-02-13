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


ENV NODE_ENV=production
ENV DB_HOST=["Ingrese host de la base de datos"]
ENV DB_PORT=["Ingrese puerto de la base de datos"]
ENV DB_USER=["Ingrese usuario de la base de datos"]
ENV DB_PASSWORD=["Ingrese contraseña de la base de datos"]
ENV DB_NAME=["Ingrese nombre de la base de datos"]


EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
