FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

COPY docker-entrypoint.sh .

RUN chmod +x docker-entrypoint.sh

CMD ["./docker-entrypoint.sh"]