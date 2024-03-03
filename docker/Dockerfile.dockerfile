# Use Node.js 14 as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Clone your Node.js app from the GitHub repository
RUN git clone https://github.com/blackbuble/antaboga.git .

# Install dependencies
RUN npm install

# Install Chromium
RUN apt-get update && apt-get install -y chromium

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
