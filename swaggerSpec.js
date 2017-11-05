const responsesCodes = {
  '200': {
    description: 'OK',
  },
  '400': {
    description: 'Не коректныые данные запроса'
  },
  '401': {
    description: 'Токен невалидный'
  },
  '50x': {
    description: 'Ошибка сервера'
  }
};



module.exports = {
  swagger: '2.0',
  info: {
    title: 'Sim-Track API',
    version: '1.0.0'
  },
  basePath: '/api/v1',
  paths: {
    '/project': {
      get: {
        tags: ['Projects'],
        summary: 'Получить все проекты',
        parameters: [
          {
            name: 'fields',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'query',
          },
          {
            name: 'name',
            type: 'string',
            in: 'query',
          },
          {
            name: 'statusId',
            description: 'можно разделять через ","',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'portfolioId',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'dateSprintBegin',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
          },
          {
            name: 'dateSprintEnd',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'query',
          },
          {
            name: 'performerId',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          },
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Projects'],
        summary: 'Создать проект',
        parameters: [
          {
            name: 'name',
            type: 'string',
            in: 'formData',
            example: 'string',
            required: true
          },
          {
            name: 'prefix',
            type: 'string',
            in: 'formData',
            example: 'string',
          },
          {
            name: 'description',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'portfolioId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'portfolioName',
            description: 'создаст новый портфель и прикрепит его к проекту',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'notbillable',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'budget',
            type: 'number',
            in: 'formData',
          },
          {
            name: 'riskBudget',
            type: 'number',
            in: 'formData',
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'formData',
          }
        ],
        responses: responsesCodes
      }
    },
    '/project/{projectId}': {
      get: {
        tags: ['Projects'],
        summary: 'Получить конкретный проект',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Projects'],
        summary: 'Изменить конкретный проект',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'name',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'prefix',
            type: 'string',
            in: 'formData',
            example: 'string',
          },
          {
            name: 'description',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'notbillable',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'budget',
            type: 'number',
            in: 'formData',
          },
          {
            name: 'riskBudget',
            type: 'number',
            in: 'formData',
          },
          {
            name: 'portfolioId',
            description: '0 чтобы сбросить портфель у проекта',
            type: 'integer',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
      delete: {
        tags: ['Projects'],
        summary: 'Удалить конкретный проект',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/users': {
      post: {
        tags: ['Projects'],
        summary: 'Привязать пользователя к конкретному проекту',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'userId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'rolesIds',
            type: 'string',
            description: 'можно разделять через ",". Смотри словарь ролей. Новое значение затерет предыдушие роли пользователя',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
      get: {
        tags: ['Projects'],
        summary: 'Получить пользователей проекта с их ролями',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/users/{userId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Отвязать пользователя от конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'userId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/tag': {
      post: {
        tags: ['Projects'],
        summary: 'Создать тег для конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'tag',
            description: 'Тег',
            type: 'string',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      },
      get: {
        tags: ['Projects'],
        summary: 'Получить все теги для конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/tag/{tag}': {
      delete: {
        tags: ['Projects'],
        summary: 'Удалить тег для конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'tag',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/tag': {
      get: {
        tags: ['Projects'],
        summary: 'Поиск тегов по всем проектам',
        parameters: [
          {
            name: 'tagName',
            description: 'Тег для поиска',
            type: 'string',
            in: 'query',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/attachment': {
      post: {
        tags: ['Projects'],
        summary: 'Загрузить файл и привязать его к конкретному проекту',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'file',
            type: 'file',
            in: 'formData',
            required: true
          },
        ]
      }
    },
    '/project/{projectId}/attachment/{attachmentId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Удалить файли отвязать его от конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'attachmentId',
            description: 'Id файла',
            type: 'integer',
            in: 'path',
            required: true
          },
        ]
      }
    },




    '/portfolio': {
      get: {
        tags: ['Portfolios'],
        summary: 'Получить все портфели',
        parameters: [
          {
            name: 'name',
            type: 'string',
            in: 'query',
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          }
        ],
        responses: responsesCodes
      },
    },
    '/portfolio/{portfolioId}': {
      get: {
        tags: ['Portfolios'],
        summary: 'Получить конкретный портфель',
        parameters: [
          {
            name: 'portfolioId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Portfolios'],
        summary: 'Изменить конкретный портфель',
        parameters: [
          {
            name: 'portfolioId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'name',
            type: 'string',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
    },


    '/sprint': {
      get: {
        tags: ['Sprints'],
        summary: 'Получить все спринты',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query',
            required: true
          },
          {
            name: 'fields',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'query',
          },
          {
            name: 'name',
            type: 'string',
            in: 'query',
          },
          {
            name: 'statusId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query',
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Sprints'],
        summary: 'Создать спринт',
        parameters: [
          {
            name: 'name',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'projectId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'factStartDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
            required: true
          },
          {
            name: 'factFinishDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
            required: true
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'allottedTime',
            type: 'numeric',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      }
    },
    '/sprint/{sprintId}': {
      get: {
        tags: ['Sprints'],
        summary: 'Получить конкретный портфель',
        parameters: [
          {
            name: 'sprintId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Sprints'],
        summary: 'Изменить конкретный портфель',
        parameters: [
          {
            name: 'sprintId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'projectId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'name',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'factStartDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
          },
          {
            name: 'factFinishDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
          },
          {
            name: 'allottedTime',
            type: 'numeric',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
      delete: {
        tags: ['Sprints'],
        summary: 'Удалить конкретный спринт',
        parameters: [
          {
            name: 'sprintId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },


    '/task': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить все задачи',
        parameters: [
          {
            name: 'fields',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'query',
          },
          {
            name: 'name',
            type: 'string',
            in: 'query',
          },
          {
            name: 'statusId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query',
          },
          {
            name: 'projectId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query',
          },
          {
            name: 'sprintId',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'performerId',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'query',
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Tasks'],
        summary: 'Создать задачу',
        parameters: [
          {
            name: 'name',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'projectId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'parentId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'sprintId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'description',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'plannedExecutionTime',
            type: 'numeric',
            in: 'formData',
          },
          {
            name: 'factExecutionTime',
            type: 'numeric',
            in: 'formData',
          },
          {
            name: 'prioritiesId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'formData',
          },
          {
            name: 'performerId',
            type: 'integer',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      }
    },
    '/task/{taskId}': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить конкретную задачу',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Tasks'],
        summary: 'Изменить конкретную задачу',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'name',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'description',
            type: 'string',
            in: 'formData',
          },

          {
            name: 'projectId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'plannedExecutionTime',
            type: 'numeric',
            in: 'formData',
          },
          {
            name: 'factExecutionTime',
            type: 'numeric',
            in: 'formData',
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'sprintId',
            description: '0 чтобы сбросить спринт у задачи',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'parentId',
            description: '0 чтобы сбросить родительскую задачу',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'prioritiesId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'linkedTasks',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'performerId',
            description: '0 для того чтобы урать текущего исполнителя',
            type: 'integer',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Удалить конкретную задачу',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/links': {
      post: {
        tags: ['Tasks'],
        summary: 'Присвязать к задаче другую задачу',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'linkedTaskId',
            type: 'integer',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/links/{linkedTaskId}': {
      delete: {
        tags: ['Tasks'],
        summary: 'Отвязать от задачи другую задачу',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'linkedTaskId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },

    '/task/{taskId}/tag': {
      post: {
        tags: ['Tasks'],
        summary: 'Создать тег для конкретной задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'tag',
            description: 'Тег',
            type: 'string',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      },
      get: {
        tags: ['Tasks'],
        summary: 'Получить все теги для конкретной задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/tag/{tag}': {
      delete: {
        tags: ['Tasks'],
        summary: 'Удалить тег для конкретной задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'tag',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/attachment': {
      post: {
        tags: ['Tasks'],
        summary: 'Загрузить файл и привязать его к конкретной задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'file',
            type: 'file',
            in: 'formData',
            required: true
          },
        ]
      }
    },
    '/task/{taskId}/attachment/{attachmentId}': {
      delete: {
        tags: ['Tasks'],
        summary: 'Удалить файли отвязать его от конкретной задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'attachmentId',
            description: 'Id файла',
            type: 'integer',
            in: 'path',
            required: true
          },
        ]
      }
    },
    '/task/{taskId}/comment': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить все комментарии к конкретной задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ]
      },
      post: {
        tags: ['Tasks'],
        summary: 'Создать комментарий к конкретной задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'parentId',
            type: 'integer',
            in: 'formData',
            required: false
          },
          {
            name: 'text',
            type: 'string',
            in: 'formData',
            required: true
          },
        ]
      }
    },
    '/task/{taskId}/comment/{commentId}': {
      put: {
        tags: ['Tasks'],
        summary: 'Обновить комментарий к задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'commentId',
            description: 'Id комментария',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'text',
            type: 'string',
            in: 'formData',
            required: true
          }
        ]
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Удалить комментарий к задаче',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'commentId',
            description: 'Id комментария',
            type: 'integer',
            in: 'path',
            required: true
          },
        ]
      }
    },
    '/task/{taskId}/history': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить историю сущности в контексте задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          },
        ],
        responses: responsesCodes
      },
    },
    '/project/{projectId}/history': {
      get: {
        tags: ['Projects'],
        summary: 'Получить историю сущности в контексте проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query',
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/tag/': {
      get: {
        tags: ['Tasks'],
        summary: 'Поиск тегов по всем задачам',
        parameters: [
          {
            name: 'tagName',
            description: 'Тег для поиска',
            type: 'string',
            in: 'query',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },


    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Получить токен авторизации',
        parameters: [
          {
            name: 'login',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'password',
            type: 'string',
            in: 'formData',
            format: 'password',
            required: true
          },
          {
            name: 'isSystemUser',
            type: 'boolean',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
    },
    '/auth/logout': {
      delete: {
        tags: ['Auth'],
        summary: 'Удалить токен из базы системы',
        parameters: [
          {
            name: 'isSystemUser',
            type: 'boolean',
            in: 'formData',
          },
        ],
        responses: responsesCodes
      },
    },



    '/user/{userId}': {
      get: {
        tags: ['User'],
        summary: 'Получить информацию о конкретном пользователе',
        parameters: [
          {
            name: 'userId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/user/me': {
      get: {
        tags: ['User'],
        summary: 'Получить информацию о текущем пользователе',
        responses: responsesCodes
      },
    },
    '/user/autocompleter': {
      get: {
        tags: ['User'],
        summary: 'Поиск пользователей по типу autocompliter',
        responses: responsesCodes,
        parameters: [
          {
            name: 'userName',
            type: 'integer',
            in: 'query',
            required: true
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query',
          },
        ],
      },
    },


    '/timesheetDraft/{timesheetDraftId}/': {
      put: {
        tags: ['Timesheets'],
        summary: 'Изменяет видимость драфтшита (deprecated, но еще используется)',
        parameters: [
          {
            name: 'timesheetDraftId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'isVisible',
            type: 'boolean',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      }
    },

    '/timesheet/tracksAll/': {
      get: {
        tags: ['Timesheets'],
        summary: 'Получить тш с драфтами для текущего пользователя',
        parameters: [
          {
            name: 'startDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
            required: true
          },
          {
            name: 'endDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },

    '/timesheet/': {
      get: {
        tags: ['Timesheets'],
        summary: 'Получить таймшиты без драфтов',
        parameters: [
          {
            name: 'userId',
            description: 'Можно использовать либо userId из SimTrack',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'userPSId',
            description: 'Либо userPSId id юзера из PS',
            type: 'string',
            in: 'query'
          },
          {
            name: 'dateBegin',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
            required: true
          },
          {
            name: 'dateEnd',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
            required: true
          },
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Timesheets'],
        summary: 'Создание тш из драфта или напрямую',
        description: 'Использовать для создания тш напряму или через драфт. Если через драфт, то указать sheetId и поле isDraft = true ',
        parameters: [
          {
            name: 'sheetId',
            type: 'integer',
            in: 'path',
          },
          {
            name: 'isDraft',
            type: 'boolean',
            in: 'formData',
          },
          {
            name: 'taskId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'taskStatusId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'projectId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'spentTime',
            type: 'integer',
            in: 'formData'
          },

          {
            name: 'isVisible',
            type: 'boolean',
            in: 'formData'
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData'
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData'
          },
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Timesheets'],
        summary: 'Изменение информации таймшит или драфте',
        description: 'yyyy-mm-dd',
        parameters: [
          {
            name: 'sheetId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'spentTime',
            type: 'integer',
            in: 'formData'
          },
          {
            name: 'isDraft',
            type: 'boolean',
            in: 'formData',
            required: true
          },
          {
            name: 'isVisible',
            type: 'boolean',
            in: 'formData'
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData'
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData'
          },
        ],
        responses: responsesCodes
      }
    },
    '/timesheet/{sheetId}/': {
      put: {
        tags: ['Timesheets'],
        summary: 'Изменение информации таймшит или драфте (deprecated, но еще используется)',
        parameters: [
          {
            name: 'sheetId',
            type: 'integer',
            in: 'path',
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'spentTime',
            type: 'integer',
            in: 'formData'
          },
          {
            name: 'isDraft',
            type: 'boolean',
            in: 'formData',
            required: true
          },
          {
            name: 'isVisible',
            type: 'boolean',
            in: 'formData'
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData'
          }
        ],
        responses: responsesCodes
      }
    },
    '/timesheet/{timesheetId}': {
      delete: {
        tags: ['Timesheets'],
        summary: 'Удалить таймшит для текущего пользователя',
        parameters: [
          {
            name: 'timesheetId',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },




    '/dictionary/project/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов проектов',
        responses: responsesCodes
      },
    },
    '/dictionary/sprint/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов спринтов',
        responses: responsesCodes
      },
    },
    '/dictionary/task/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов задач',
        responses: responsesCodes
      },
    },

    '/dictionary/timesheet/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов активности в таймшитах',
        responses: responsesCodes,
      },
    },
    '/dictionary/project/roles': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник ролей пользователей для проекта',
        responses: responsesCodes,
      },
    },
    '/dictionary/timesheet/types': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов активности в таймшитах',
        responses: responsesCodes,
      },
    },




  },
  securityDefinitions: {
    apiKey: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'ex.: Basic 91ae3866cb9b1441d152c205cd8dc622118f6ef9'
    }
  }
};
