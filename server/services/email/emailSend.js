const userSubscriptionEvents = require('../userSubscriptionEvents');

process.on('message', ({ eventId, input, user}) => {
  try {
    userSubscriptionEvents(eventId, input, user);
  } catch (e) {
    console.error(e);
  }
});
