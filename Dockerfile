FROM node:13-alpine
# Create lms_backend directory where our app will be stored.

WORKDIR /lms_backend

COPY . .

RUN npm install

# Expose our app to port and start the application

EXPOSE 4000

CMD ["npm", "run", "dev"]