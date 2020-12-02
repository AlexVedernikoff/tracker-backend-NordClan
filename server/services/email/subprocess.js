const path = require('path');
const { fork } = require('child_process');

module.exports = function (data) {
  try {
    const subprocess = fork(path.resolve(__dirname, './emailSend.js'));
    subprocess.send(data);
  } catch (e) {
    console.log(e);
  }
};
