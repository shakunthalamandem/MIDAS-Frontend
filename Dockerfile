FROM node:18-alpine AS build

WORKDIR /app

COPY Frontend/my-app/package.json Frontend/my-app/package-lock.json ./
RUN npm install --legacy-peer-deps && npm install date-fns --legacy-peer-deps

COPY Frontend/my-app/ ./
ENV CI=false
ENV TSC_COMPILE_ON_ERROR=true
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
