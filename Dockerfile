FROM node:12

WORKDIR /opt

COPY package.json package-lock.json ./
RUN npm install 

COPY lib ./lib
COPY express ./express


EXPOSE 8000
CMD [ "node", "express/app.js" ]
