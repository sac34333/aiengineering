'use strict';

const { createApp } = require('./app');

const port = process.env.PORT || 3000;

createApp().listen(port, () => {
  console.log(`incident-service listening on http://localhost:${port}`);
});
