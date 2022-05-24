const express = require('express');
const config = require('./configs');
const httpsServer = require('https');
const fs = require('fs');
const path = require('path');
const { initApp } = require('./initApp');
const app = express();

exports.runHttpsServer = function () {
  initApp(app);

  const options = {
    key: fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.key')),
    cert: fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.crt')),
    requestCert: true,
    rejectUnauthorized: false,
    ca: [
      fs.readFileSync(path.join(__dirname, '/serverstore', config.httpsKey + '.crt')),
    ],
    passphrase: 'Aa1234', // todo move to env (??)
  };

  // todo just for testing
  app.get('/test', (req, res) => {
    const cert = req.socket.getPeerCertificate();

    if (req.client.authorized) {
      res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`);
    } else if (cert.subject) {
      res.status(403)
        .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`);
    } else {
      res.status(401)
        .send('Sorry, but you need to provide a client certificate to continue.');
    }
  });

  httpsServer.createServer(options, app).listen(config.httpsPort, () => {
    console.log('listen ' + config.httpsPort);
    console.log('RUN HTTPS SERVER');
  });
};
