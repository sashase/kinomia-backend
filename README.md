# Kinomia Backend

## Prerequisites

1.  Docker 19.03.0+

### How to run?

- Clone the repository;
- Open cloned directory;
- Create your own `.env` (you can find an example inside `.env.sample`);
- Run `docker compose up -d` to start the application in a development environment and detached mode. The server starts on port 3001;
- Run `docker compose -f compose.yml -f compose.prod.yml up -d` to start the application in a production environment and detached mode. The server starts on port 3000.
