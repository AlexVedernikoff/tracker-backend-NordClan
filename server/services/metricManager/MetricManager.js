const { exec } = require('child_process');
const emailSubprocess = require('../email/subprocess');
const models = require('../../models');
const config = require('../../configs');


// Класс запускает метрики и отслеживает их состояние. Вызыв команд через lisner
module.exports = class MetricManager {

  constructor () {
    this._startedMetrics = {
      project: [], // содержит id проектов для которых запущенна вручную метрика
      allProjects: false // запуск сборк глобальной метрики
    };

    this.lisner = {
      startedMetrics: this._getStartedMetrics.bind(this),
      startMetric: this._startMetric.bind(this)
    };
    this._recipientsEmails = config.emailsToSendErrorsByMetrics;
  }

  _getStartedMetrics () {
    return this._startedMetrics;
  }

  _startMetric (request) {
    let projectId = '';
    const onFinish = () => {
      console.log('finish');
      if (projectId) {
        const index = this._startedMetrics.project.indexOf(projectId);
        if (index > -1) {
          this._startedMetrics.project.splice(index, 1);
        }
        return;
      }

      this._startedMetrics.allProjects = false;
    };

    if (request.projectId) {
      projectId = request.projectId;
      if (this._startedMetrics.project.indexOf(projectId) !== -1) {
        return { message: 'already started' };
      }
      this._startedMetrics.project.push(projectId);

    } else {
      if (this._startedMetrics.allProjects) {
        return { message: 'already started' };
      }
      this._startedMetrics.allProjects = true;
    }

    console.log('start');
    const promise = new Promise((resolve, reject) => {
      exec(`node ./server/services/agent/calculateByProject/agent.js ${projectId}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    })
      .then(() => {
        onFinish();
      })
      .catch((error) => {
        console.log('error', error);
        onFinish();
        emailSubprocess({
          eventId: models.ProjectEventsDictionary.values[5].id,
          input: {
            recipients: this._recipientsEmails,
            error: error,
            projectId: projectId
          }
        });
      });


    return { message: 'started' };
  }
};
