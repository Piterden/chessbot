FROM node:22
WORKDIR /usr/src/app
RUN npm i npm -g
COPY package*.json /usr/src/app/
RUN npm i
COPY . /usr/src/app
CMD ["sh", "-c", "npm run migrate && node src/index.js"]
