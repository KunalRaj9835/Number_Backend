// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log('Loading routes...');

let authRoutes, nodeRoutes;

try {
  authRoutes = (await import('./routes/auth.js')).default;
  console.log('Auth routes loaded');
} catch (error) {
  console.error('Failed to load auth routes:', error);
  process.exit(1);
}

try {
  nodeRoutes = (await import('./routes/nodes.js')).default;
  console.log('Node routes loaded');
} catch (error) {
  console.error('Failed to load node routes:', error);
  process.exit(1);
}

const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/nodes', nodeRoutes);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server');
  server.close();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server');
  server.close();
});