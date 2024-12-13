require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const http = require('http');
const https = require('https');
const routes = require('./routes');

const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use('/', routes);

// Konfigurasi Sertifikat SSL untuk HTTPS
const httpsOptions = {
  key: fs.readFileSync('./certs/private-key.pem'), // Path ke private key
  cert: fs.readFileSync('./certs/certificate.pem'), // Path ke certificate
};

// HTTP Server di port 3000
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on http://localhost:${HTTP_PORT}`);
});

// HTTPS Server di port 3001
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${HTTPS_PORT}`);
});
