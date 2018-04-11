const path = require('path');
const { fork } = require('child_process');

const subprocess = fork('emailSend.js');

module.exports = function (data) {
  try {
    subprocess.send('email', data);
  } catch (e) {
    console.log(e);
  }
};