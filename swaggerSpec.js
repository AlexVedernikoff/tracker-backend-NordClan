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
    '/project/status/dictionary': {
      get: {
        tags: ['Projects'],
        summary: 'Справочник статусов проектов',
        responses: responsesCodes
      },
    },
    '/project/roles/dictionary': {
      get: {
        tags: ['Projects'],
        summary: 'Справочник ролей пользователей для проекта',
        responses: responsesCodes,
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
      // post: {
      // 	tags: ['Portfolios'],
      // 	summary: 'Создать портфель',
      // 	parameters: [
      // 		{
      // 			name: 'name',
      // 			type: 'string',
      // 			in: 'formData',
      // 			required: true
      // 		},
      // 	],
      // 	responses: responsesCodes
      // }
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
      // delete: {
      // 	tags: ['Portfolios'],
      // 	summary: 'Удалить конкретный портфель',
      // 	parameters: [
      // 		{
      // 			name: 'portfolioId',
      // 			type: 'integer',
      // 			in: 'path',
      // 			required: true
      // 		},
      // 	],
      // 	responses: responsesCodes
      // },
    },
    

    '/sprint': {
      get: {
        tags: ['Sprints'],
        summary: 'Получить все спринты',
        parameters: [
          {
            name: 'fields',
            description: 'можно разделять через ","',
            type: 'string',
            in: 'query',
          },
          {
            name: 'projectId',
            type: 'integer',
            description: 'можно разделять через ","',
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
    '/sprint/{sprintId}/status': {
      put: {
        tags: ['Sprints'],
        summary: 'Изменить статус конкретного спринта',
        parameters: [
          {
            name: 'sprintId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/sprint/status/dictionary/': {
      get: {
        tags: ['Sprints'],
        summary: 'Справочник статусов спринтов',
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
          }
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
    '/task/{taskId}/status': {
      put: {
        tags: ['Tasks'],
        summary: 'Изменить статус конкретной задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/users': {
      post: {
        tags: ['Tasks'],
        summary: 'Назначить исполнителем пользователя на проект',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'userId',
            description: '0 для того чтобы урать текущего исполнителя',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'statusId',
            type: 'integer',
            description: 'Можно также изменить статус задачи',
            in: 'formData',
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
    '/task/{taskId}/timesheet/': {
      post: {
        tags: ['Timesheets'],
        summary: 'Создать таймшит для текущего пользователя',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'sprintId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
            required: true
          },
          {
            name: 'typeId',
            description: 'Тип активности (см. словарь)',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'spentTime',
            description: 'Потраченное время',
            type: 'numeric',
            in: 'formData',
            required: true
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'isBillible',
            type: 'boolean',
            in: 'formData',
            required: true
          },
          {
            name: 'userRoleId',
            description: 'Через запятую без пробелов перечислить id',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'taskStatusId',
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
        ],
        responses: responsesCodes
      },
    },
    '/task/timesheet/getTimesheets': {
      get: {
        tags: ['Timesheets'],
        summary: 'Получить таймшиты',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'userId',
            type: 'integer',
            in: 'query',
            required: true
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
    },
    '/task/{taskId}/timesheet/{timesheetId}': {
      put: {
        tags: ['Timesheets'],
        summary: 'Изменить таймшит для текущего пользователя',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'timesheetId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
          },
          {
            name: 'typeId',
            description: 'Тип активности (см. словарь)',
            type: 'integer',
            in: 'formData',
          },
          {
            name: 'spentTime',
            description: 'Потраченное время',
            type: 'number',
            format: 'float',
            in: 'formData',
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData',
          },
          {
            name: 'isBillible',
            type: 'boolean',
            in: 'formData'
          },
          {
            name: 'isVisible',
            type: 'boolean',
            description: 'Определяет нахождение таймшита под катом или над катом',
            in: 'formData'
          },
          {
            name: 'userRoleId',
            type: 'integer',
            in: 'formData'
          },
          {
            name: 'taskStatusId',
            type: 'integer',
            in: 'formData'
          },
          {
            name: 'statusId',
            type: 'integer',
            in: 'formData'
          },
        ],
        responses: responsesCodes
      },
      delete: {
        tags: ['Timesheets'],
        summary: 'Удалить тайм шит для текущего пользователя',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'timesheetId',
            type: 'integer',
            in: 'path',
            required: true
          },
        ],
        responses: responsesCodes
      },
    },
    '/task/{taskId}/history': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить историю сущности',
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
    '/task/status/dictionary/': {
      get: {
        tags: ['Tasks'],
        summary: 'Справочник статусов задач',
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
        ],
        responses: responsesCodes
      },
    },
    '/auth/logout': {
      delete: {
        tags: ['Auth'],
        summary: 'Удалить токен из базы системы',
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


    '/task/{taskId}/timesheetDraft/': {
      post: {
        tags: ['TimesheetsDraft'],
        summary: 'Создать драфт-таймшит для пользователя',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'sprintId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'userId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
            required: true
          },
          {
            name: 'typeId',
            description: 'Тип активности (см. словарь)',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'comment',
            type: 'string',
            in: 'formData',
            required: true
          },
          {
            name: 'isBillible',
            type: 'boolean',
            in: 'formData',
            required: true
          },
          {
            name: 'userRoleId',
            type: 'integer',
            in: 'formData',
            required: true
          },
          {
            name: 'taskStatusId',
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
        ],
        responses: responsesCodes
      }
    },


    '/timesheetDraft/{timesheetDraftId}/': {
      put: {
        tags: ['TimesheetsDraft'],
        summary: 'Изменяет видимость драфтшита',
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

    '/timesheet/tracks/': {
      get: {
        tags: ['Tracks'],
        summary: 'Получить треки для текущего пользователя в конкретный день',
        parameters: [
          {
            name: 'onDate',
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

    '/timesheet/tracksAll/': {
      get: {
        tags: ['Tracks'],
        summary: 'Получить треки для текущего пользователя на неделю',
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
    '/task/timesheet/types/dictionary': {
      get: {
        tags: ['Timesheets'],
        summary: 'Справочник типов активности в тайм шитах',
        responses: responsesCodes,
      },
    },
    '/timesheet/{taskId}/setTime/': {
      post: {
        tags: ['Timesheets'],
        summary: 'Заполнить таймшит в UI таблице таймшитов',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'onDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'formData',
            required: true
          },
          {
            name: 'spentTime',
            type: 'number',
            format: 'float',
            in: 'formData',
          },
          {
            name: 'taskStatusId',
            type: 'number',
            format: 'float',
            in: 'formData',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },



    '/timesheet/{sheetId}/': {
      put: {
        tags: ['Tracks'],
        summary: 'Изменение возможной информации о треке',
        parameters: [
          {
            name: 'sheetId',
            type: 'integer',
            in: 'path',
          },
          {
            name: 'typeId',
            type: 'integer',
            in: 'path',
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