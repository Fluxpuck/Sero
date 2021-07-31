FROM node:14
WORKDIR /sero
COPY package.json /sero
COPY package-lock.json ./
RUN npm install
COPY . /sero
CMD node main.js