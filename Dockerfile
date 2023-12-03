# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory to /usr/src/app
WORKDIR /app/product

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose port
EXPOSE 3002

# Set the command to start the app
CMD [ "npm", "start" ]
