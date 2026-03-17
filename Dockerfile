FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (cached unless package files change)
COPY Frontend/my-app/package.json Frontend/my-app/package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY Frontend/my-app/ ./
ENV CI=false \
    TSC_COMPILE_ON_ERROR=true \
    NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
