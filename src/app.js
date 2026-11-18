'use strict';

const express = require('express');
const incidentsRouter = require('./routes/incidents');

function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/incidents', incidentsRouter);

  app.use((req, res) => res.status(404).json({ error: 'not found' }));

  return app;
}

module.exports = { createApp };
