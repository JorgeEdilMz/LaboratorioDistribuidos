FROM node:18.20.0-alpine3.19

WORKDIR /app

COPY package.json .
COPY prisma ./prisma/ 
RUN npm install

COPY . .

CMD ["npm","run","dev"]

