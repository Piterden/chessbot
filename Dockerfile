FROM node:lts-slim

#RUN apt update -y && apt install -y iputils-ping

RUN useradd -ms /bin/sh -u 1001 app
USER app
WORKDIR /app

COPY --chown=app:app package*.json knexfile.js .
RUN npm install
COPY --chown=app:app ./src ./src
COPY --chown=app:app ./migrations ./migrations

# CMD ["sh", "-c", "npm run dev"]
#CMD ["sh", "-c", "sleep infinity"]
