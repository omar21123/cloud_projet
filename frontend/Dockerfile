# STAGE 1: The Builder (Compiles the code)
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# STAGE 2: The Server (Wear the Suit)
FROM nginx:1.30.5-alpine
# Copy the compiled assets from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Copy the Internal Nginx Config (The Pocket Guide)
COPY nginx-internal.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
