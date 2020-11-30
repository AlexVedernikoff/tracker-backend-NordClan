const userSubscriptionEvents = require('../userSubscriptionEvents');

process.on('message', async ({ eventId, input, user}) => {
  try {
    await userSubscriptionEvents(eventId, input, user);
    process.exit(0);
  } catch (e) {
    process.exit(1);
    console.error(e);
  }
});
