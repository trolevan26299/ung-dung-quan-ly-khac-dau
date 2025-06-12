# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument cho API URL (gọi backend qua container name)
ARG REACT_APP_API_URL=http://khacdau-backend:8085
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build ứng dụng
RUN npm run build

# Production stage - sử dụng serve để host static files
FROM node:18-alpine

WORKDIR /app

# Cài đặt serve globally
RUN npm install -g serve

# Copy build files từ build stage
COPY --from=build /app/build ./build

# Tạo user non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactjs -u 1001

# Chuyển ownership cho user reactjs
RUN chown -R reactjs:nodejs /app
USER reactjs

# Expose port
EXPOSE 3005

# Khởi chạy serve
CMD ["serve", "-s", "build", "-l", "3005"] 