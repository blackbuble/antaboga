# Use Node.js 14 LTS as the base image
FROM node:latest

# Install necessary dependencies including Chromium
RUN apt-get update && apt-get install -y chromium

# Set environment variables for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
