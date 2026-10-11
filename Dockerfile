# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install app dependencies (only production dependencies)
RUN npm ci --only=production

# Copy the rest of the application's source code
COPY . .

# Your server listens on process.env.PORT, but Suga needs to know which port to expose.
# We will use the default PORT from your server code (3000).
EXPOSE 3000

# Define the command to run your app
CMD [ "npx", "ts-node", "server/index.ts" ]