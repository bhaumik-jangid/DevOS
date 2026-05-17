FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first — layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Expose Next.js dev server port
EXPOSE 3000

# Start Next.js in development mode
CMD ["npm", "run", "dev"]