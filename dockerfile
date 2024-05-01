# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY . .

# Make port available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["node", "server.js"]

# Run the front end
CMD ["npm", "start"]
