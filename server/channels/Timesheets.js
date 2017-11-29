class TimesheetsChannel {
  async sendAction (type, data, socketIO, userId) {
    const action = this.getAction(type, data);
    this.emit(socketIO, action, userId);
  }

  getAction (type, data) {
    const actions = {
      ['update timesheet']: {
        type: 'UPDATE_TIMESHEET_SUCCESS',
        timesheet: data
      },
      create: {
        type: 'CREATE_TIMESHEET_SUCCESS',
        timesheet: data
      },
      destroy: {
        type: 'DELETE_TIMESHEET_SUCCESS',
        timesheet: data
      }
    };

    return actions[type];
  }

  emit (socketIO, action, userId) {
    const channel = `timesheet_user_${userId}`;
    socketIO.emit(channel, action);
  }
}

module.exports = TimesheetsChannel;
