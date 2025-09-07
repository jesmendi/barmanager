FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar package.json e instalar TODAS las dependencias (incluyendo devDependencies)
COPY package*.json ./
RUN npm install  # Sin --production

COPY . .

EXPOSE 3000

# Usar nodemon para desarrollo
CMD ["npm", "run", "dev"]
