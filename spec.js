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
          '50x': {
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
          '50x': {
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
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/user/{username}': {
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
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/user/sync/{username}': {
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
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/task/{taskId}': {
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
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/project/{projectId}': {
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
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/comment': {
      post: {
        tags: ['Comments'],
        summary: 'Создать коментарий',
        parameters: [
          {
            name: 'message',
            type: 'string',
            in: 'formData'
          },
          {
            name: 'task',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'user',
            type: 'string',
            in: 'formData'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Comment' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      }
    },
    '/comment/{commentId}': {
      get: {
        tags: ['Comments'],
        summary: 'Получить коментарий',
        parameters: [
          {
            name: 'commentId',
            type: 'string',
            in: 'path',
            required: true
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Comment' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      },
      put: {
        tags: ['Comments'],
        summary: 'Изменить коментарий',
        parameters: [
          {
            name: 'commentId',
            type: 'string',
            in: 'path',
            required: true
          },
          {
            name: 'message',
            type: 'string',
            in: 'formData'
          },
          {
            name: 'task',
            type: 'string',
            in: 'formData'
          },
          {
            name: 'user',
            type: 'string',
            in: 'formData'
          }
        ],
        responses: {
          '200': {
            description: 'OK',
            schema: { $ref: '#/definitions/Comment' }
          },
          '401': {
            description: 'Токен невалидный'
          },
          '50x': {
            description: 'Ошибка сервера'
          }
        }
      },
      delete: {
        tags: ['Comments'],
        summary: 'Удалить коментарий',
        parameters: [
          {
            name: 'commentId',
            type: 'string',
            in: 'path',
            required: true
          }
        ],
        responses: {
          '200': {
            description: 'OK',
          },
          '401': {
            description: 'Токен невалидный'
          },
          '50x': {
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
    Comment: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: { '$ref': '#/definitions/User' },
        task: { '$ref': '#/definitions/Task' },
      }
    },
    Token: {
      type: 'object',
      properties: {
        token_type: { type: 'string' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        expires_in: { type: 'number' },
        user: { '$ref': '#/definitions/User' },
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
