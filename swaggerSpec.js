const responsesCodes = {
  '200': {
    description: 'OK'
  },
  '400': {
    description: 'Некорректные данные запроса'
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
            in: 'query'
          },
          {
            name: 'name',
            type: 'string',
            in: 'query'
          },
          {
            name: 'statusId',
            description: 'можно разделять через ","',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'portfolioId',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'dateSprintBegin',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'dateSprintEnd',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'performerId',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Projects'],
        summary: 'Создать проект',
        parameters: [
          {
            in: 'body',
            name: 'project',
            description: 'The project to create.',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                },
                prefix: {
                  type: 'string',
                  example: 'string'
                },
                description: {
                  type: 'string',
                  example: 'string'
                },
                statusId: {
                  type: 'integer',
                  example: 1
                },
                portfolioId: {
                  type: 'integer',
                  example: 1
                },
                portfolioName: {
                  description: 'создаст новый портфель и прикрепит его к проекту',
                  type: 'string',
                  example: 'string'
                },
                notbillable: {
                  type: 'integer',
                  example: 1
                },
                budget: {
                  type: 'number',
                  example: 1.55
                },
                riskBudget: {
                  type: 'number',
                  example: 1.55
                },
                tags: {
                  type: 'string',
                  description: 'можно разделять через ","',
                  example: 'a,b,c'
                },
                creatorPsId: {
                  type: 'string',
                  description: 'Только для системного пользователя, id пользователя в пс. Обязательное поле для системного пользователя'
                }
              }
            }
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
          }
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
            in: 'body',
            name: 'project',
            description: 'The project to edit.',
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                },
                prefix: {
                  type: 'string',
                  example: 'string'
                },
                description: {
                  type: 'string',
                  example: 'string'
                },
                notbillable: {
                  type: 'integer',
                  example: 1
                },
                budget: {
                  type: 'number',
                  example: 1
                },
                riskBudget: {
                  type: 'number',
                  example: 1
                },
                portfolioId: {
                  description: '0 чтобы сбросить портфель у проекта',
                  type: 'integer',
                  example: 1
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      }
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
            in: 'body',
            name: 'project',
            description: 'Привязать пользователя к конкретному проекту',
            schema: {
              type: 'object',
              required: ['userId'],
              properties: {
                userId: {
                  type: 'integer',
                  example: '1'
                },
                rolesIds: {
                  type: 'string',
                  example: 'string',
                  description: 'можно разделять через ",". Смотри словарь ролей. Новое значение затерет предыдушие роли пользователя'
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
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
            in: 'body',
            name: 'project',
            description: 'Создать тег для конкретного проекта',
            schema: {
              type: 'object',
              required: [],
              properties: {
                tag: {
                  type: 'string',
                  example: 'string',
                  description: 'Тег'
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
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
          }
        ]
      }
    },
    '/project/:projectId/reports/period': {
      get: {
        tags: ['Projects'],
        summary: 'Получить файл - отчёт за период',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
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


    '/portfolio': {
      get: {
        tags: ['Portfolios'],
        summary: 'Получить все портфели',
        parameters: [
          {
            name: 'name',
            type: 'string',
            in: 'query'
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      }
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
          }
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
            in: 'body',
            name: 'portfolio',
            description: 'Изменить конкретный портфель',
            schema: {
              type: 'object',
              required: [],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
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
            in: 'query'
          },
          {
            name: 'name',
            type: 'string',
            in: 'query'
          },
          {
            name: 'statusId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Sprints'],
        summary: 'Создать спринт',
        parameters: [
          {
            in: 'body',
            name: 'sprint',
            description: 'The sprint to create.',
            schema: {
              type: 'object',
              required: ['name', 'projectId', 'factStartDate', 'factFinishDate'],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                },
                projectId: {
                  type: 'integer',
                  example: 1
                },
                factStartDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                factFinishDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                allottedTime: {
                  type: 'number',
                  example: 1.55
                },
                budget: {
                  type: 'number',
                  example: 1.55
                },
                riskBudget: {
                  type: 'number',
                  example: 1.55
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Sprints'],
        summary: 'Изменить конкретный спринт',
        parameters: [
          {
            in: 'body',
            name: 'sprint',
            description: 'The sprint to update.',
            schema: {
              type: 'object',
              required: ['sprintId'],
              properties: {
                sprintId: {
                  type: 'integer',
                  example: 1
                },
                name: {
                  type: 'string',
                  example: 'string'
                },
                factStartDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                factFinishDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                allottedTime: {
                  type: 'number',
                  example: 1.55
                },
                budget: {
                  type: 'number',
                  example: 1.55
                },
                riskBudget: {
                  type: 'number',
                  example: 1.55
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      }
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
            in: 'query'
          },
          {
            name: 'name',
            type: 'string',
            in: 'query'
          },
          {
            name: 'statusId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'typeId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'projectId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'authorId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'prioritiesId',
            type: 'integer',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'sprintId',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'performerId',
            description: '0 если без исполнителя',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'pageSize',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Tasks'],
        summary: 'Создать задачу',
        parameters: [
          {
            in: 'body',
            name: 'task',
            description: 'Создать задачу',
            schema: {
              type: 'object',
              required: ['name', 'projectId', 'statusId', 'typeId'],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                },
                projectId: {
                  type: 'integer',
                  example: 1
                },
                statusId: {
                  type: 'integer',
                  example: 1
                },
                typeId: {
                  type: 'integer',
                  example: 1
                },
                parentId: {
                  type: 'integer',
                  example: 1
                },
                sprintId: {
                  type: 'integer',
                  example: 1
                },
                description: {
                  type: 'string',
                  example: 'string'
                },
                plannedExecutionTime: {
                  type: 'number',
                  example: 1.55
                },
                factExecutionTime: {
                  type: 'number',
                  example: 1.55
                },
                prioritiesId: {
                  type: 'integer',
                  example: 1
                },
                tags: {
                  type: 'string',
                  description: 'можно разделять через ","',
                  example: 'string'
                },
                performerId: {
                  type: 'integer',
                  example: 1
                }
              }
            }
          }
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
          }
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
            in: 'body',
            name: 'task',
            description: 'Создать задачу',
            schema: {
              type: 'object',
              required: ['name', 'projectId', 'statusId', 'typeId'],
              properties: {
                name: {
                  type: 'string',
                  example: 'string'
                },
                statusId: {
                  type: 'integer',
                  example: 1
                },
                typeId: {
                  type: 'integer',
                  example: 1
                },
                parentId: {
                  type: 'integer',
                  description: '0 чтобы сбросить родительскую задачу',
                  example: 1
                },
                sprintId: {
                  type: 'integer',
                  description: '0 чтобы сбросить спринт у задачи',
                  example: 1
                },
                description: {
                  type: 'string',
                  example: 'string'
                },
                plannedExecutionTime: {
                  type: 'number',
                  example: 1.55
                },
                factExecutionTime: {
                  type: 'number',
                  example: 1.55
                },
                prioritiesId: {
                  type: 'integer',
                  example: 1
                },
                performerId: {
                  type: 'integer',
                  description: '0 для того чтобы убрать текущего исполнителя',
                  example: 1
                }
              }
            }
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
          }
        ],
        responses: responsesCodes
      }
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
            in: 'body',
            name: 'task',
            description: 'Присвязать к задаче другую задачу',
            schema: {
              type: 'object',
              required: ['linkedTaskId'],
              properties: {
                linkedTaskId: {
                  type: 'integer',
                  example: 1
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
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
            in: 'body',
            name: 'task',
            description: 'Создать тег для конкретной задачи',
            schema: {
              type: 'object',
              required: ['tag'],
              properties: {
                tag: {
                  type: 'string',
                  description: 'Тег',
                  example: 'string'
                }
              }
            }
          }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
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
          }
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
          }
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
          }
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
            in: 'body',
            name: 'task',
            description: 'Создать комментарий к конкретной задаче',
            schema: {
              type: 'object',
              required: ['text'],
              properties: {
                parentId: {
                  type: 'integer',
                  example: 1
                },
                text: {
                  type: 'string',
                  example: 'string'
                }
              }
            }
          }
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
            in: 'body',
            name: 'task',
            description: 'Обновить комментарий к задаче',
            schema: {
              type: 'object',
              required: ['text'],
              properties: {
                text: {
                  type: 'string',
                  example: 'string'
                }
              }
            }
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
          }
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
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      }
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
            in: 'query'
          },
          {
            name: 'currentPage',
            type: 'integer',
            in: 'query'
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
    },
    '/task/{taskId}/spent': {
      get: {
        tags: ['Tasks'],
        summary: 'Получить затраченное время по активностям задачи',
        parameters: [
          {
            name: 'taskId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },


    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Получить токен авторизации',
        parameters: [
          {
            in: 'body',
            name: 'auth',
            description: 'Получить токен авторизации',
            schema: {
              type: 'object',
              required: ['login', 'password'],
              properties: {
                login: {
                  type: 'string',
                  example: 'string'
                },
                password: {
                  type: 'string',
                  example: 'string'
                },
                isSystemUser: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/auth/logout': {
      delete: {
        tags: ['Auth'],
        summary: 'Удалить токен из базы системы',
        parameters: [
          {
            name: 'isSystemUser',
            type: 'boolean',
            in: 'formData'
          }
        ],
        responses: responsesCodes
      }
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
          }
        ],
        responses: responsesCodes
      }
    },
    '/user/me': {
      get: {
        tags: ['User'],
        summary: 'Получить информацию о текущем пользователе',
        responses: responsesCodes
      }
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
            in: 'query'
          }
        ]
      }
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
            in: 'body',
            name: 'timesheetDraft',
            description: '',
            schema: {
              type: 'object',
              required: ['isVisible'],
              properties: {
                isVisible: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
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
            description: 'Можно использовать либо userId из SimTrack. Только для systemUser',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'userPSId',
            description: 'Либо userPSId id юзера из PS. Только для systemUser',
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
          }
        ],
        responses: responsesCodes
      },
      post: {
        tags: ['Timesheets'],
        summary: 'Создание тш из драфта или напрямую',
        description: 'Использовать для создания тш напряму или через драфт. Если через драфт, то указать sheetId и поле isDraft = true ',
        parameters: [
          {
            in: 'body',
            name: 'timesheet',
            description: '',
            schema: {
              type: 'object',
              required: [],
              properties: {
                sheetId: {
                  type: 'integer',
                  example: 1
                },
                taskId: {
                  type: 'integer',
                  example: 1
                },
                taskStatusId: {
                  type: 'integer',
                  example: 1
                },
                projectId: {
                  type: 'integer',
                  example: 1
                },
                typeId: {
                  type: 'integer',
                  example: 1
                },
                spentTime: {
                  type: 'number',
                  example: 1.55
                },
                isVisible: {
                  type: 'boolean',
                  example: false
                },
                comment: {
                  type: 'string',
                  example: 'string'
                },
                onDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                }
              }
            }
          }
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Timesheets'],
        summary: 'Изменение таймшита',
        description: 'yyyy-mm-dd',
        parameters: [
          {
            name: 'return',
            type: 'string',
            description: 'Вернуть в ответ: "trackList"',
            in: 'query'
          },
          {
            in: 'body',
            name: 'timesheet',
            description: '',
            schema: {
              type: 'object',
              required: [],
              properties: {
                sheetId: {
                  type: 'integer',
                  example: 1
                },
                spentTime: {
                  type: 'number',
                  example: 1.55
                },
                isVisible: {
                  type: 'boolean',
                  example: false
                },
                comment: {
                  type: 'string',
                  example: 'string'
                },
                statusId: {
                  type: 'integer',
                  example: 1
                },
                onDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/draftsheet/': {
      put: {
        tags: ['Timesheets'],
        summary: 'Изменение драфта',
        parameters: [
          {
            name: 'return',
            type: 'string',
            description: 'Вернуть в ответ: "trackList"',
            in: 'query'
          },
          {
            in: 'body',
            name: 'draftsheet',
            description: '',
            schema: {
              type: 'object',
              required: [],
              properties: {
                sheetId: {
                  type: 'integer',
                  example: 1
                },
                spentTime: {
                  type: 'number',
                  example: 1.55
                },
                isVisible: {
                  type: 'boolean',
                  example: false
                }
              }
            }
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
          }
        ],
        responses: responsesCodes
      }
    },


    '/dictionary/project/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов проектов',
        responses: responsesCodes
      }
    },
    '/dictionary/sprint/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов спринтов',
        responses: responsesCodes
      }
    },
    '/dictionary/task/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов задач',
        responses: responsesCodes
      }
    },
    '/dictionary/task/types': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов задач',
        responses: responsesCodes
      }
    },
    '/dictionary/timesheet/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов активности в таймшитах',
        responses: responsesCodes
      }
    },
    '/dictionary/project/roles': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник ролей пользователей для проекта',
        responses: responsesCodes
      }
    },
    '/dictionary/timesheet/types': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов активности в таймшитах',
        responses: responsesCodes
      }
    }


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
