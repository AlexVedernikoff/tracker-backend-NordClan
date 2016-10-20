module.exports = {
  swagger: '2.0',
  info: {
    title: 'Sim-Track API',
    version: '1.0.0'
  },
  basePath: '/api',
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Получить access-token',
        parameters: [
          {
            name: 'username',
            in: 'formData',
            type: 'string',
            required: true
          },
          {
            name: 'password',
            in: 'formData',
            type: 'string',
            required: true
          },
          {
            name: 'Authorization',
            in: 'header',
            default: 'Basic ' + new Buffer('test:test').toString('base64')
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Token' }
          },
          '400': {
            description: 'Неверные параметры'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Обновить access-token',
        parameters: [
          {
            name: 'refresh_token',
            in: 'body',
            type: 'string',
            required: true
          },
          {
            type: 'basic'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Token' }
          },
          '400': {
            description: 'Неверные параметры'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/auth/check': {
      get: {
        tags: ['Auth'],
        summary: 'Проверить access-token',
        parameters: [],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/User' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/user/:username': {
      get: {
        tags: ['Users'],
        summary: 'Получить информацию о пользователе',
        parameters: [
          {
            name: 'username',
            type: 'string',
            in: 'path'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/User' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/user/sync/:username': {
      get: {
        tags: ['Users'],
        summary: 'Синхронизировать таски и проекты пользователя',
        parameters: [
          {
            name: 'username',
            type: 'string',
            in: 'path'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
          },
          '401': {
            description: 'Токен невалидный'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/task/:taskId': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить все или конкретный таск',
        parameters: [
          {
            name: 'taskId',
            type: 'string',
            in: 'path'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Task' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/project/:projectId': {
      get: {
        tags: ['Projects'],
        summary: 'Получить все или конкретный проект',
        parameters: [
          {
            name: 'projectId',
            type: 'string',
            in: 'path'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Project' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '500': {
            description: 'Ошибка сервера'
          }
        }
      }
    }
  },
  securityDefinitions: {
    apiKey: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'ex.: Bearer 91ae3866cb9b1441d152c205cd8dc622118f6ef9'
    }
  },
  definitions: {
    User: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        firstnameRu: { type: 'string' },
        lastnameRu: { type: 'string' },
        firstnameEn: { type: 'string' },
        lastnameEn: { type: 'string' },
        email: { type: 'string' },
        mobile: { type: 'string' },
        skype: { type: 'string' },
        photo: { type: 'string' },
        birthday: { type: 'string' },
        psId: { type: 'string' },
      }
    },
    Project: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        startDate: { type: 'string' },
        psId: { type: 'string' },
      }
    },
    Task: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        priority: { type: 'number' },
        type: { type: 'string' },
        planedTime: { type: 'number' },
        currentTime: { type: 'number' },
        owner: { '$ref': '#/definitions/User' },
        author: { '$ref': '#/definitions/User' },
        project: { '$ref': '#/definitions/Project' },
        psId: { type: 'string' },
      }
    },
    Token: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        clientId: { type: 'string' },
        user: { '$ref': '#/definitions/User' },
        expires: { type: 'number' },
      }
    },
    Auth: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      }
    }
  }
};
