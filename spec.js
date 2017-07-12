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
	basePath: '/api',
	paths: {
		'/project': {
			get: {
				tags: ['Projects'],
				summary: 'Получить все проекты',
				parameters: [
					{
						name: 'fields',
						description: 'fields separated by ","',
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
						description: 'tags separated by ","',
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
						description: 'tags separated by ","',
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
						name: 'statusId',
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


		'/project-users': {
			post: {
				tags: ['Projects'],
				summary: 'Привязать пользователя к конкретному проекту',
				parameters: [
					{
						name: 'projectId',
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
						name: 'rolesIds',
						type: 'string',
						description: 'rolesId separated by ",". See project roles dictionary. Will replace rolesId',
						in: 'formData',
					},
				],
				responses: responsesCodes
			},
		},
		'/project-users/{projectId}': {
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
		'/project-users/{projectId}/{userId}': {
			delete: {
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
						in: 'path',
						required: true
					},
				],
				responses: responsesCodes
			},
		},

		'/portfolio': {
			get: {
				tags: ['Portfolios'],
				summary: 'Получить все портфели',
				parameters: [
					{
						name: 'fields',
						description: 'fields separated by ","',
						type: 'string',
						in: 'query',
					},
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
			post: {
				tags: ['Portfolios'],
				summary: 'Создать портфель',
				parameters: [
					{
						name: 'name',
						type: 'string',
						in: 'formData',
						required: true
					},
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
			delete: {
				tags: ['Portfolios'],
				summary: 'Удалить конкретный портфель',
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
		},




		'/sprint': {
			get: {
				tags: ['Sprints'],
				summary: 'Получить все спринты',
				parameters: [
					{
						name: 'fields',
						description: 'fields separated by ","',
						type: 'string',
						in: 'query',
					},
					{
						name: 'projectId',
						type: 'integer',
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
						description: 'fields separated by ","',
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
						in: 'query',
					},
					{
						name: 'projectId',
						type: 'integer',
						in: 'query',
					},
					{
						name: 'sprintId',
						type: 'integer',
						in: 'query',
					},
					{
						name: 'tags',
						type: 'string',
						description: 'tags separated by ","',
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
						name: 'linkedTasks',
						type: 'string',
						in: 'formData',
					},
					{
						name: 'tags',
						type: 'string',
						description: 'tags separated by ","',
						in: 'formData',
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
						name: 'statusId',
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
		'/task-users': {
			post: {
				tags: ['Tasks'],
				summary: 'Назначить исполнителем пользователя на проект',
				parameters: [
					{
						name: 'taskId',
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
				],
				responses: responsesCodes
			},
		},
		'/task-users/{taskId}/{userId}': {
			delete: {
				tags: ['Tasks'],
				summary: 'Убрать исполнителя у проекта',
				parameters: [
					{
						name: 'taskId',
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



		'/tag': {
			post: {
				tags: ['Tag'],
				summary: 'Создать тег для сущности',
				parameters: [
					{
						name: 'taggable',
						description: 'Имя сущности: \'task\', \'project\'',
						type: 'string',
						in: 'formData',
						required: true
					},
					{
						name: 'taggableId',
						description: 'ID сущности',
						type: 'integer',
						in: 'formData',
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
		},
		'/tag/autocompliter/{taggable}': {
			get: {
				tags: ['Tag'],
				summary: 'Поиск тегов по типу сущности',
				parameters: [
					{
						name: 'taggable',
						description: 'Имя сущности: \'task\', \'project\'',
						type: 'string',
						in: 'path',
						required: true
					},
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
		'/tag/{taggable}/{taggableId}': {
			get: {
				tags: ['Tag'],
				summary: 'Получить теги для сущности',
				parameters: [
					{
						name: 'taggable',
						description: 'Имя сущности: \'task\', \'project\'',
						type: 'string',
						in: 'path',
						required: true
					},
					{
						name: 'taggableId',
						description: 'ID сущности',
						type: 'integer',
						in: 'path',
						required: true
					},
				],
				responses: responsesCodes
			},
			delete: {
				tags: ['Tag'],
				summary: 'Удалить тег для сущности',
				parameters: [
					{
						name: 'taggable',
						description: 'Имя сущности: \'task\', \'project\'',
						type: 'integer',
						in: 'path',
						required: true
					},
					{
						name: 'taggableId',
						description: 'ID сущности',
						type: 'integer',
						in: 'path',
						required: true
					},
					{
						name: 'tag',
						description: 'tags separated by ","',
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
						format: "password",
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
		'/user/autocompliter': {
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
				],
			},
		},

		'/dictionary/statuses/{entity}': {
			get: {
				tags: ['Dictionary'],
				summary: 'Справочник статусов',
				responses: responsesCodes,
				parameters: [
					{
						name: 'entity',
						type: 'integer',
						description: 'Может принимать значения: \'task\', \'sprint\', \'project\'',
						in: 'path',
						required: true
					},
				],
			},
		},

		'/dictionary/project-roles': {
			get: {
				tags: ['Dictionary'],
				summary: 'Справочник ролей пользователей для проекта',
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