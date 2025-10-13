FROM node:lts-slim
#RUN apt update -y && apt install -y iputils-ping
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install --loglevel verbose
COPY . /usr/src/app
CMD ["sh", "-c", "npm run migrate && npm run dev"]
#CMD ["sh", "-c", "sleep infinity"]
