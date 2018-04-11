const userSubscriptionEvents = require('../userSubscriptionEvents');

process.on('message', (m, { eventId, input, user}) => {
  console.log(99999999);
  if (m === 'email') {
    userSubscriptionEvents(eventId, input, user);
  }
});