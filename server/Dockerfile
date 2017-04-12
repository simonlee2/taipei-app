FROM node:7.8.0

# install packages
RUN mkdir -p /usr/src/app
WORKDIR /usr/src

COPY package.json /usr/src
RUN npm install

COPY . /usr/src

EXPOSE 3000
