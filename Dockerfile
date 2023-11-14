FROM node:lts-slim
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
CMD ["sh", "-c", "npm run migrate && node src/index.js"]
