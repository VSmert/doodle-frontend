FROM node:lts-alpine as doodle-base

WORKDIR /app
COPY . .
RUN npm install -g http-server 
RUN npm install 

FROM doodle-base as build-and-serve

WORKDIR /app
RUN npm run build

EXPOSE 8080
CMD [ "http-server", "dist" ]