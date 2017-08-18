const simTrack = require('./server/index');

if(require.main === module){
  simTrack.run();
} else {
  module.exports = simTrack;
}
