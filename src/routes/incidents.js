'use strict';

const express = require('express');
const service = require('../services/incidentService');

const router = express.Router();

router.get('/', (req, res) => {
  const { status, priority } = req.query;
  res.json({ incidents: service.listIncidents({ status, priority }) });
});

router.get('/at-risk', (req, res) => {
  res.json({ incidents: service.listAtRisk() });
});

router.get('/:id', (req, res) => {
  const incident = service.getIncident(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'incident not found' });
  }
  res.json(incident);
});

router.post('/', (req, res) => {
  try {
    const incident = service.createIncident(req.body || {});
    res.status(201).json(incident);
  } catch (err) {
    if (err instanceof service.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const incident = service.updateStatus(req.params.id, (req.body || {}).status);
    if (!incident) {
      return res.status(404).json({ error: 'incident not found' });
    }
    res.json(incident);
  } catch (err) {
    if (err instanceof service.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

router.patch('/:id/assignee', (req, res) => {
  try {
    const incident = service.assign(req.params.id, (req.body || {}).assignee);
    if (!incident) {
      return res.status(404).json({ error: 'incident not found' });
    }
    res.json(incident);
  } catch (err) {
    if (err instanceof service.ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

module.exports = router;
