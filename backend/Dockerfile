FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app (if you use TypeScript)
COPY . .

# If you use TypeScript, uncomment the next line:
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]