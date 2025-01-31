# Use the official Node.js image as the base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Ensure the public directory exists
RUN mkdir -p public

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8001

# Start the application
CMD ["npm", "start"]