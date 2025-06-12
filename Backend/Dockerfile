# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt tất cả dependencies (bao gồm devDependencies để build)
RUN npm ci

# Copy source code
COPY . .

# Build ứng dụng
RUN npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Chỉ cài đặt production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application từ build stage
COPY --from=build /app/dist ./dist

# Tạo user non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Chuyển ownership cho user nestjs
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 8085

# Khởi chạy ứng dụng
CMD ["node", "dist/main"] 