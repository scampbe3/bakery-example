FROM node:18-alpine

WORKDIR /app

# install backend deps
COPY backend/package*.json ./backend/
RUN npm --prefix backend install

# copy source
COPY backend ./backend
COPY frontend ./frontend

ENV PORT=8080
EXPOSE 8080

CMD ["node", "backend/server.js"]
