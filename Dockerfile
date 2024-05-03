FROM node:18 as node_modules

WORKDIR /home/app

COPY package.json yarn.lock ./

RUN yarn install

FROM node_modules as build

WORKDIR /home/app

COPY . .

ENV MONGO_URI=mongodb+srv://dbadmin:maP1HO4JZoxoG5bm@cluster0.zvuk7wj.mongodb.net/gossip?retryWrites=true&w=majority

RUN yarn build

EXPOSE 4000

ENTRYPOINT [ "yarn", "start"]