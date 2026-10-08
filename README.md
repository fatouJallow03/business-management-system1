# Business Management System

This is a simple Business Management System that I am building to manage products and inventory for a business.

For this Docker project, I containerized the frontend, backend and PostgreSQL database so the whole application can run using Docker Compose.

## Technologies

- React + TypeScript + Vite
- Node.js + Express
- PostgreSQL
- Docker
- Docker Compose

## Prerequisites

To run the application you need:

- Docker
- Docker Compose

## Application

The application has three main parts:

- Frontend - React, TypeScript and Vite
- Backend - Node.js and Express
- Database - PostgreSQL

The frontend runs on port `5173`, the backend on port `3000` and PostgreSQL on port `5432`.

Docker Compose is used to run them together.

## How to run

Run:

```bash
docker compose up --build
```

Then open:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:3000
```

The products endpoint can be tested at:

```text
http://localhost:3000/products
```

To stop the application:

```bash
docker compose down
```

You can also use `Ctrl + C` if Docker Compose is running in the terminal.

## Docker setup

I created a Dockerfile for both the frontend and backend.

The backend uses Node 20 and installs the dependencies using `npm ci`. It then starts the backend using `index.js`.

The frontend also uses Node 20 and runs the Vite development server.

For the database I use the PostgreSQL 16 image.

## Database and networking

The PostgreSQL service is called `db`.

The backend uses `db` as the database host instead of `localhost` because the backend and database are running in different containers.

I also added a healthcheck to PostgreSQL. This checks if the database is ready before the backend starts.

## Environment variables

The backend gets the database settings through environment variables such as:

```text
DB_USER
DB_PASSWORD
DB_NAME
DB_HOST
DB_PORT
```

The backend can access these using `process.env`.

## Volume

I use a Docker volume called `walo_data` for the PostgreSQL database.

The volume is used so the database data can persist even if the container is recreated.

## Testing

I tested the application using:

```bash
docker compose up --build
```

I also used:

```bash
docker ps
```

to check that the containers were running.

I tested that the PostgreSQL container becomes healthy, the backend runs, the frontend loads in the browser and the `/products` endpoint can connect to the database.

## Security and efficiency

I use `.dockerignore` so Docker does not copy files that are not needed, such as:

```text
node_modules
.env
.git
```

The backend uses environment variables for the database configuration instead of putting the values directly inside the application code.

I also use `npm ci` when building the Node containers so the dependencies are installed from the package lock file.

## What I learned

This project helped me understand Docker better and how the different parts of an application can run in separate containers.

I learned more about images and containers, Docker Compose, ports, volumes, environment variables and how containers can communicate with each other.
