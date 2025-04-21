# Use the official Node.js image as the base image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lightweight web server for the production build
FROM node:18-alpine AS runner

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]