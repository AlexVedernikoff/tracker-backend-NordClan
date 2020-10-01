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

const putResponseCodes = {
  '204': {
    description: 'Нет контента'
  },
  '400': responsesCodes['400'],
  '401': responsesCodes['401'],
  '50x': responsesCodes['50x']
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
            name: 'typeId',
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
          // TODO: подобрать более подходящие названия для флагов onlyUserInProject и userIsParticipant
          {
            name: 'onlyUserInProject',
            description: 'Получить проекты где текущий пользователь находится в участниках (исключает проекты где пользователь только создатель)',
            type: 'boolean',
            in: 'query'
          },
          {
            name: 'userIsParticipant',
            description: 'Получить проекты где текущий пользователь находися как участник и как создатель',
            type: 'boolean',
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
                statusId: {
                  type: 'integer',
                  example: 1
                },
                typeId: {
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
                },
                gitlabProjectIds: {
                  description: 'Массив айдишников проектов GitLab',
                  type: 'array',
                  example: [1, 2]
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
                },
                gitlabRoles: {
                  type: 'array',
                  example: '[]',
                  items: {
                    type: 'object',
                    properties: {
                      accessLevel: {
                        type: 'integer',
                        required: true
                      },
                      gitlabProjectId: {
                        type: 'integer',
                        required: true
                      },
                      expiredDate: {
                        type: 'string'
                      }
                    }
                  }
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
          },
          {
            name: 'isExternal',
            type: 'integer',
            in: 'query'
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
    '/project/{projectId}/tags': {
      get: {
        tags: ['Projects'],
        summary: 'Поиск тега задачи по имени среди задач конкретного проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'tagName',
            description: 'Поиск по имени тега',
            type: 'string',
            in: 'query',
            required: false
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
    '/project/{projectId}/reports/period': {
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
            required: false
          },
          {
            name: 'endDate',
            description: 'yyyy-mm-dd',
            type: 'string',
            format: 'date',
            in: 'query',
            required: false
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
    '/project/{projectId}/addGitlabProject': {
      post: {
        tags: ['Projects'],
        summary: 'Привязать существующий gitlab репозиторий',
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
            schema: {
              type: 'object',
              required: true,
              properties: {
                path: {
                  type: 'string',
                  required: true,
                  example: 'front-end/gitlab-local-test'
                }
              }
            }
          }
        ],
        responses: {
          ...responsesCodes,
          '200': {
            ...responsesCodes['200'],
            schema: {
              type: 'object',
              properties: {
                gitlabProject: {
                  type: 'object',
                  example: '{}'
                },
                projectUsers: {
                  type: 'array',
                  required: true,
                  example: '[]'
                },
                notProcessedGitlabUsers: {
                  type: 'array',
                  example: '[]'
                }
              }
            }
          }
        }
      }
    },
    '/project/{projectId}/createGitlabProject': {
      post: {
        tags: ['Projects'],
        summary: 'Создать gitlab репозиторий и привязать к проекту',
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
            schema: {
              type: 'object',
              required: true,
              properties: {
                name: {
                  type: 'string',
                  required: true,
                  example: 'some repo name'
                },
                namespace_id: {
                  type: 'integer',
                  required: true,
                  example: '1'
                }
              }
            }
          }
        ],
        responses: {
          ...responsesCodes,
          '200': {
            ...responsesCodes['200'],
            schema: {
              type: 'object',
              properties: {
                gitlabProject: {
                  type: 'object',
                  example: '{}'
                },
                projectUsers: {
                  type: 'array',
                  required: true,
                  example: '[]'
                },
                notProcessedGitlabUsers: {
                  type: 'array',
                  example: '[]'
                }
              }
            }
          }
        }
      }
    },

    '/project/{projectId}/environment': {
      get: {
        tags: ['Projects'],
        summary: 'Получить окружения проекта',
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
      post: {
        tags: ['Projects'],
        summary: 'Создать окружение проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'environment',
            schema: {
              type: 'object',
              required: true,
              properties: {
                title: {
                  type: 'string',
                  required: true,
                  example: 'title'
                },
                description: {
                  type: 'string',
                  required: false,
                  example: 'description'
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/project/{projectId}/environment/{environmentId}': {
      delete: {
        tags: ['Projects'],
        summary: 'Удалить окружение проекта',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'environmentId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/project/{projectId}/test-run': {
      get: {
        tags: ['Projects'],
        summary: 'Получить тест планы проекта, лимит 10 итемов и общее количество',
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
    '/project/{projectId}/test-run/dict': {
      get: {
        tags: ['Projects'],
        summary: 'Получить все тест планы в усеченном виде',
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
    '/project/{projectId}/test-run-execution': {
      get: {
        tags: ['Projects'],
        summary: 'Получить запущенные тест раны проекта, лимит 10 итемов и общее количество',
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
      post: {
        tags: ['Projects'],
        summary: 'Создать запущенный тест ран (запустить тест ран)',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'testRunExecution',
            schema: {
              type: 'object',
              required: true,
              properties: {
                testRunId: {
                  type: 'integer',
                  required: true,
                  example: 52
                },
                projectEnvironmentId: {
                  type: 'integer',
                  required: true,
                  example: 1
                },
                projectId: {
                  type: 'integer',
                  required: true,
                  example: 513
                },
                startedBy: {
                  type: 'integer',
                  required: true,
                  example: 357
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/project/{projectId}/test-run-execution/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Получить выполняемый тест ран по id',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Projects'],
        summary: 'Обновить выполняемый тест ран по id',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'testRunExecution',
            schema: {
              type: 'object',
              required: true,
              properties: {
                status: {
                  type: 'integer',
                  required: true,
                  example: 3
                }
              }
            }
          }
        ],
        responses: responsesCodes
      },
      delete: {
        tags: ['Projects'],
        summary: 'Удалить выполняемый тест ран по id',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
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
                  example: 'DEPRECATED'
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
                  example: 'DEPRECATED'
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
            description: 'можно разделять через ","',
            in: 'query'
          },
          {
            name: 'performerId',
            description: '0 если без исполнителя',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'isDevOps',
            description: 'true false или пусто, при пустом все задачи вернуться',
            type: 'boolean',
            in: 'query',
            example: null
          },
          {
            name: 'tags',
            type: 'string',
            description: 'можно разделять через ",". Можно исползовать "No tag", "Без тега" для поиска тасок без тегов.',
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
    '/user/password/{token}': {
      put: {
        tags: ['User'],
        summary: 'Установка пароля для внешнего пользователя',
        parameters: [
          {
            name: 'token',
            type: 'string',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'user',
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                password: {
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
    '/user/autocompleter/external': {
      get: {
        tags: ['User'],
        summary: 'Поиск внешних пользователей по типу autocompliter',
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
    '/user/': {
      put: {
        tags: ['User'],
        summary: 'Изменение глобальной роли пользователя',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'body',
            required: true
          },
          {
            name: 'globalRole',
            type: 'string',
            in: 'body',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/user/roles': {
      get: {
        tags: ['User'],
        summary: 'Получение списка всех пользователей кроме внешних и их глобальных ролей',
        responses: responsesCodes
      }
    },
    '/user/external': {
      get: {
        tags: ['User'],
        summary: 'Получение списка всех внешних пользователей',
        responses: responsesCodes
      },
      post: {
        tags: ['User'],
        summary: 'Создать внешнего пользователя',
        parameters: [
          {
            in: 'body',
            name: 'user',
            schema: {
              type: 'object',
              required: ['login'],
              properties: {
                login: {
                  type: 'string',
                  example: 'string'
                },
                firstNameRu: {
                  type: 'string',
                  example: 'string'
                },
                expiredDate: {
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
    '/user/external/{id}': {
      put: {
        tags: ['User'],
        summary: 'Редактирование внешнего пользователя',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'user',
            schema: {
              type: 'object',
              properties: {
                login: {
                  type: 'string',
                  example: 'string'
                },
                firstNameRu: {
                  type: 'string',
                  example: 'string'
                },
                expiredDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                active: {
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
    '/user/test/{id}': {
      put: {
        tags: ['User'],
        summary: 'Редактирование тестового пользователя',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'user',
            schema: {
              type: 'object',
              properties: {}
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/user/external/refresh': {
      put: {
        tags: ['User'],
        summary: 'Обновление ссылки регистрации для внешнего пользователя',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'user',
            schema: {
              type: 'object',
              properties: {
                login: {
                  type: 'string',
                  example: 'string'
                },
                firstNameRu: {
                  type: 'string',
                  example: 'string'
                },
                expiredDate: {
                  type: 'string',
                  example: 'yyyy-mm-dd'
                },
                active: {
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
            name: 'taskId',
            description: 'id задачи. Обязательный параметр в случае, если явно не указаны dateBegin и dateEnd.',
            type: 'integer',
            in: 'query'
          },
          {
            name: 'dateBegin',
            description: 'В формате yyyy-mm-dd. Обязательный параметр в случае, если явно не указан taskId',
            type: 'string',
            format: 'date',
            in: 'query',
            required: false
          },
          {
            name: 'dateEnd',
            description: 'В формате yyyy-mm-dd. Обязательный параметр в случае, если явно не указан taskId',
            type: 'string',
            format: 'date',
            in: 'query',
            required: false
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
    '/dictionary/project/types': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов проектов',
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
    },
    '/dictionary/milestone/types': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник типов майлстоунов',
        responses: responsesCodes
      }
    },
    '/dictionary/test-case/status': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник статусов тест кейса',
        responses: responsesCodes
      }
    },
    '/dictionary/test-case/severity': {
      get: {
        tags: ['Dictionary'],
        summary: 'Справочник сложности тест кейса',
        responses: responsesCodes
      }
    },
    '/milestones/{id}': {
      delete: {
        tags: ['Milestone'],
        summary: 'Вех проекта',
        parameters: [
          {
            name: 'id',
            description: 'id вех',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/jira/auth': {
      post: {
        tags: ['Jira'],
        summary: 'Авторизация в Jira',
        parameters: [
          {
            in: 'body',
            name: 'credentials',
            description: '',
            schema: {
              type: 'object',
              required: [],
              properties: {
                server: {
                  type: 'string',
                  example: 'http://jira-test.simbirsoft:8080'
                },
                username: {
                  type: 'string',
                  example: 'admin'
                },
                password: {
                  type: 'string',
                  example: 'admin'
                },
                email: {
                  type: 'string',
                  example: 'test@example.org'
                }
              }
            }
          }
        ]
      }
    },
    '/jira/project': {
      get: {
        tags: ['Jira'],
        summary: 'Получить проекты из Jira',
        parameters: [
          {
            in: 'header',
            name: 'X-Jira-Auth',
            description: 'Token',
            schema: {
              type: 'string'
            },
            required: true
          }
        ]
      }
    },
    '/jira/getActiveProjects': {
      get: {
        tags: ['Jira'],
        summary: 'Получить все заинтегрированные проекты с Jira (нужно для TTI)'
      }
    },
    '/jira/synchronize': {
      post: {
        tags: ['Jira'],
        summary: 'На этот адрес TTI присылает данные с Jira',
        parameters: [
          {
            in: 'header',
            name: 'X-Jira-Auth',
            description: 'Token',
            schema: {
              type: 'string'
            },
            required: true
          },
          {
            in: 'body',
            name: 'body',
            description: 'неизвестность',
            schema: {
              type: 'object'
            },
            required: true
          }
        ]
      }
    },
    '/jira/project/{jiraProjectId}/info': {
      get: {
        tags: ['Jira'],
        summary: 'Получить информацию из Jira (status_type и issue_type, users)',
        parameters: [
          {
            in: 'header',
            name: 'X-Jira-Auth',
            description: 'Token',
            schema: {
              type: 'string'
            },
            required: true
          },
          {
            name: 'jiraProjectId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      }
    },
    '/jira/project/{jiraProjectId}/handleSync': {
      post: {
        tags: ['Jira'],
        summary: 'Вручную запустить команду на синхронизацию с JIRA, далее TTI пришлет данные по другому роуту',
        parameters: [
          {
            in: 'header',
            name: 'X-Jira-Auth',
            description: 'Token',
            schema: {
              type: 'string'
            },
            required: true
          },
          {
            name: 'jiraProjectId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      }
    },
    '/project/{projectId}/jira/association/': {
      get: {
        tags: ['Jira'],
        summary: 'Получить существующие ассоциации проекта с Jira',
        parameters: [
          {
            name: 'projectId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      },
      post: {
        tags: ['Jira'],
        summary: 'Привязать проект Jira к проекту в simtrack',
        parameters: [
          {
            in: 'header',
            name: 'X-Jira-Auth',
            description: 'Token',
            schema: {
              type: 'string'
            },
            required: true
          },
          {
            in: 'body',
            name: '',
            description: '',
            schema: {
              type: 'object',
              required: [],
              properties: {
                jiraProjectId: {
                  type: 'integer',
                  example: 1000
                },
                jiraHostName: {
                  type: 'string',
                  example: 'http://jira-test.simbirsoft:8080'
                },
                issueTypesAssociation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: [],
                    properties: {
                      internalTaskTypeId: {
                        type: 'integer',
                        example: 1
                      },
                      externalTaskTypeId: {
                        type: 'integer',
                        example: 5
                      }
                    }
                  }
                },
                statusesAssociation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: [],
                    properties: {
                      internalStatusId: {
                        type: 'integer',
                        example: 1
                      },
                      externalStatusId: {
                        type: 'integer',
                        example: 5
                      }
                    }
                  }
                },
                userEmailAssociation: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: [],
                    properties: {
                      internalUserEmail: {
                        type: 'string',
                        example: 'abs@simbirsoft.com'
                      },
                      externalUserEmail: {
                        type: 'string',
                        example: 'abs@simbirsoft.com'
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    '/healthcheck': {
      get: {
        tags: ['Healthcheck'],
        summary: 'Проверка жив ли бек, реализует простой запрос в бд',
        responses: responsesCodes
      }
    },
    '/test-case': {
      get: {
        tags: ['Test Case'],
        summary: 'Получить все тест-кейсы',
        responses: responsesCodes
      },
      post: {
        tags: ['Test Case'],
        summary: 'Создать тест-кейс',
        parameters: [
          {
            in: 'body',
            name: 'test-case',
            description: 'The test case to create',
            schema: {
              type: 'object',
              required: ['title, testCaseSteps'],
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'description'
                },
                status: {
                  type: 'integer',
                  enum: [1, 2, 3],
                  example: 3
                },
                severity: {
                  type: 'integer',
                  enum: [1, 2, 3, 4, 5, 6, 7],
                  example: 1
                },
                priority: {
                  type: 'integer',
                  example: 3
                },
                preConditions: {
                  type: 'string',
                  example: 'pre conditions'
                },
                postConditions: {
                  type: 'string',
                  example: 'post conditions'
                },
                expectedResult: {
                  type: 'string',
                  example: 'expected result'
                },
                duration: {
                  type: 'string',
                  example: '2:00:00'
                },
                testSuiteId: {
                  type: 'integer',
                  example: 2
                },
                authorId: {
                  type: 'integer',
                  example: 4
                },
                testCaseSteps: {
                  type: 'array',
                  example: [{ 'action': 'action', 'expectedResult': 'expected result' }],
                  items: {
                    type: 'object',
                    properties: {
                      action: {
                        type: 'string',
                        required: true
                      },
                      expectedResult: {
                        type: 'string',
                        required: true
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-case/{testCaseId}': {
      get: {
        tags: ['Test Case'],
        summary: 'Получить конкретный тест кейс',
        parameters: [
          {
            name: 'testCaseId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Test Case'],
        summary: 'Изменить конкретный тест кейс',
        parameters: [
          {
            name: 'testCaseId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'test-case',
            description: 'The test case to edit',
            schema: {
              type: 'object',
              required: ['testCaseSteps'],
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'description'
                },
                status: {
                  type: 'integer',
                  enum: [1, 2, 3],
                  example: 3
                },
                severity: {
                  type: 'string',
                  enum: [1, 2, 3, 4, 5, 6, 7],
                  example: 4
                },
                priority: {
                  type: 'integer',
                  example: 3
                },
                preConditions: {
                  type: 'string',
                  example: 'pre conditions'
                },
                postConditions: {
                  type: 'string',
                  example: 'post conditions'
                },
                expectedResult: {
                  type: 'string',
                  example: 'expected result'
                },
                duration: {
                  type: 'string',
                  example: '2:00:00'
                },
                testSuiteId: {
                  type: 'integer',
                  example: 2
                },
                authorId: {
                  type: 'integer',
                  example: 4
                },
                testCaseSteps: {
                  type: 'array',
                  example: [{ 'action': 'action', 'expectedResult': 'expected result' }],
                  items: {
                    type: 'object',
                    properties: {
                      action: {
                        type: 'string',
                        required: true
                      },
                      expectedResult: {
                        type: 'string',
                        required: true
                      }
                    }
                  }
                }
              }
            }
          }
        ],
        responses: {
        }
      },
      delete: {
        tags: ['Test Case'],
        summary: 'Удалить конкретный тест кейс',
        parameters: [
          {
            name: 'testCaseId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-suite': {
      get: {
        tags: ['Test Suite'],
        summary: 'Получить все тест сьюты',
        responses: responsesCodes
      },
      post: {
        tags: ['Test Suite'],
        summary: 'Создать тест сьют',
        parameters: [
          {
            in: 'body',
            name: 'test-suite',
            description: 'The test suite to create',
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'descr'
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-suite/{testSuiteId}': {
      get: {
        tags: ['Test Suite'],
        summary: 'Получить конкретный тест сьют',
        parameters: [
          {
            name: 'testSuiteId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      },
      put: {
        tags: ['Test Suite'],
        summary: 'Изменить конкретный тест сьют',
        parameters: [
          {
            name: 'testSuiteId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'test-suite',
            description: 'The test suite to edit',
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'descr'
                }
              }
            }
          }
        ],
        responses: putResponseCodes
      },
      delete: {
        tags: ['Test Suite'],
        summary: 'Удалить конкретный тест сьют',
        parameters: [
          {
            name: 'testSuiteId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-run': {
      post: {
        tags: ['Test Run'],
        summary: 'Создать тест прогон тестов',
        parameters: [
          {
            in: 'body',
            name: 'test-run',
            description: 'The test run to create',
            schema: {
              type: 'object',
              required: ['title', 'testCasesData', 'projectEnvironments'],
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'desc'
                },
                projectId: {
                  type: 'integer',
                  example: 1
                },
                runtime: {
                  type: 'string',
                  example: '3:00:00'
                },
                testCasesData: {
                  type: 'array',
                  example: [{ 'testCaseId': 8, 'assignedTo': 1 }],
                  items: {
                    type: 'object',
                    properties: {
                      testCaseId: {
                        type: 'integer',
                        required: true
                      },
                      assignedTo: {
                        type: 'integer',
                        required: true
                      }
                    }
                  }
                },
                projectEnvironments: {
                  type: 'array',
                  example: [1, 2],
                  items: {
                    type: 'number'
                  }
                }
              }
            }
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-run/{testRunId}': {
      get: {
        tags: ['Test Run'],
        summary: 'Получить конкретный прогон тестов',
        parameters: [
          {
            name: 'testRunId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      },
      put: {
        tags: ['Test Run'],
        summary: 'Изменить конкретный прогон тестов',
        parameters: [
          {
            name: 'testRunId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'test-run',
            description: 'The test run to update',
            schema: {
              type: 'object',
              required: ['testCasesData'],
              properties: {
                title: {
                  type: 'string',
                  example: 'title'
                },
                description: {
                  type: 'string',
                  example: 'desc'
                },
                projectId: {
                  type: 'integer',
                  example: 1
                },
                runtime: {
                  type: 'string',
                  example: '3:00:00'
                },
                testCasesData: {
                  type: 'array',
                  example: [{ 'testCaseId': 8, 'assignedTo': 1 }],
                  items: {
                    type: 'object',
                    properties: {
                      testCaseId: {
                        type: 'integer',
                        required: true
                      },
                      assignedTo: {
                        type: 'integer',
                        required: true
                      }
                    }
                  }
                },
                projectEnvironments: {
                  type: 'array',
                  example: [1, 2],
                  items: {
                    type: 'number'
                  }
                }
              }
            }
          }
        ],
        responses: putResponseCodes
      },
      delete: {
        tags: ['Test Run'],
        summary: 'Удалить конкретный прогон тестов',
        parameters: [
          {
            name: 'testRunId',
            type: 'integer',
            in: 'path',
            required: true
          }
        ],
        responses: responsesCodes
      }
    },
    '/test-step-execution/{id}': {
      put: {
        tags: ['Test Step Execution'],
        summary: 'Обновить шаг исполняемого тест кейса по id',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'testStepExecution',
            description: 'Test step execution to update',
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'integer',
                  example: 3
                },
                description: {
                  type: 'string',
                  example: 'something wrong'
                }
              }
            }
          }
        ],
        responses: putResponseCodes
      }
    },
    '/test-step-execution/{testStepExecutionId}/attachment': {
      post: {
        tags: ['Test Step Execution'],
        summary: 'Прикрепить файл к шагу исполняемого тест кейса',
        parameters: [
          {
            name: 'testStepExecutionId',
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
        ],
        responses: responsesCodes
      }
    },
    '/test-case/{testCaseId}/attachment': {
      post: {
        tags: ['Test Case'],
        summary: 'Прикрепить файл к тест кейс',
        parameters: [
          {
            name: 'testCaseId',
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
        ],
        responses: responsesCodes
      }
    },
    '/test-step-execution/{testStepExecutionId}/attachment/{id}': {
      delete: {
        tags: ['Test Step Execution'],
        summary: 'Удалить прикрепленный к исполняемому шагу тест кейса файл',
        parameters: [
          {
            name: 'testStepExecutionId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      }
    },
    '/test-case/{testCaseId}/attachment/{id}': {
      delete: {
        tags: ['Test Case'],
        summary: 'Удалить прикрепленный к тест кейс файл',
        parameters: [
          {
            name: 'testCaseId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
      }
    },
    '/test-case-execution/{id}': {
      put: {
        tags: ['Test Case Execution'],
        summary: 'Обновить тест кейс исполняемого тест рана',
        parameters: [
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            in: 'body',
            name: 'testCaseExecution',
            description: 'Test case execution to update',
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'integer',
                  example: 3
                },
                description: {
                  type: 'string',
                  example: 'something wrong'
                }
              }
            }
          }
        ],
        responses: putResponseCodes
      }
    },
    '/test-case-execution/{testCaseExecutionId}/attachment': {
      post: {
        tags: ['Test Case Execution'],
        summary: 'Прикрепить файл к тест кейсу исполняемого тест рана',
        parameters: [
          {
            name: 'testCaseExecutionId',
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
        ],
        responses: responsesCodes
      }
    },
    '/test-case-execution/{testCaseExecutionId}/attachment/{id}': {
      delete: {
        tags: ['Test Case Execution'],
        summary: 'Удалить прикрепленный к исполняемому тест кейсу файл',
        parameters: [
          {
            name: 'testCaseExecutionId',
            type: 'integer',
            in: 'path',
            required: true
          },
          {
            name: 'id',
            type: 'integer',
            in: 'path',
            required: true
          }
        ]
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
