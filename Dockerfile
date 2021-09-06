FROM node:lts-slim

# App work directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Build app
RUN npm install --loglevel=error

# Bundle app source into container
COPY /src/main.js src/main.js
ADD /public/ public/

# Port exposed
EXPOSE 5001

# Run Node app
CMD [ "npm", "start" ]