FROM node:18

WORKDIR /app

# Install deps only on container startup
COPY package*.json ./

# No copying full source – will be mounted
RUN npm install

EXPOSE 4173
CMD ["npm", "run", "dev", "--", "--host"]
