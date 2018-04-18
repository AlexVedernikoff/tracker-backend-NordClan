const userSubscriptionEvents = require('../userSubscriptionEvents');

process.on('message', ({ eventId, input, user}) => {
  userSubscriptionEvents(eventId, input, user);
});