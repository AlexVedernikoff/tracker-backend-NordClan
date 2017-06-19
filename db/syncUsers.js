const async = require('async');
const userSync = require('./sync');

async.series([
  userSync
  ],
  (err) => {
    if (err) {
      throw new Error(err);
    }
    console.log('Users are synchronized.');
  }
);

