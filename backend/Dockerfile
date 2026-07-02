# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
