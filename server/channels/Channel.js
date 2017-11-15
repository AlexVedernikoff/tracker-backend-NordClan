const User = require('../models').User;

class Channel {
  async sendAction(type, data, socketIO) {
    const action = this.getAction(type, data);
    const users = await User.findAll();

    users
      .filter(this.selectUsers)
      .forEach(user => {
        this.emit(socketIO, action, user.id);
      });
  }

  getAction() {
  }

  selectUsers() {
    return true;
  }

  emit() {
  }
}

module.exports = Channel;
