FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p data

# Expose port
EXPOSE 5000

# Start the server
CMD ["npx", "tsx", "src/index.ts"]
