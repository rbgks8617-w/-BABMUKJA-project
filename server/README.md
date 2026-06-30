# BABMUKJA API server

Node.js API skeleton for the Korea Polytechnic University campus meal app.

## Local Linux-style run

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

## Production build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t babmukja-api .
docker run --env-file .env -p 4000:4000 babmukja-api
```

Current data is in-memory seed data. Replace `src/repositories/inMemoryStore.ts` with a database-backed repository when Firebase, PostgreSQL, or another server store is introduced.
