const responses = {
	'200': {
		description: 'OK',
		schema: { $ref: '#/definitions/Project' }
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
				responses: responses
			},
			post: {
				tags: ['Projects'],
				summary: 'Создать проект',
				parameters: [
					{
						name: 'name',
						required: "true",
						type: 'string',
						in: 'formData',
						example: 'string'
					},
					{
						name: 'typeId',
						required: "true",
						type: 'integer',
						in: 'formData',
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
						name: 'plannedStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'plannedFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					}
				],
				responses: responses
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
				responses: responses
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
						name: 'typeId',
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
						type: 'numeric',
						in: 'formData',
					},
					{
						name: 'risBudget',
						type: 'numeric',
						in: 'formData',
					},
					{
						name: 'plannedStartDate',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'plannedFinishDate',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'factStartDate',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'factFinishDate',
						type: 'date',
						in: 'formData',
					}
				],
				responses: responses
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
				responses: responses
			},
		},




		'/portfolio': {
			get: {
				tags: ['Portfolios'],
				summary: 'Получить все портфели',
				parameters: [
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
				responses: responses
			},
			post: {
				tags: ['Portfolios'],
				summary: 'Создать портфель',
				parameters: [
					{
						name: 'name',
						required: "true",
						type: 'string',
						in: 'formData',
					},
					{
						name: 'description',
						type: 'string',
						in: 'formData',
					},
				],
				responses: responses
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
				responses: responses
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
					{
						name: 'description',
						type: 'string',
						in: 'formData',
					},
				],
				responses: responses
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
				responses: responses
			},
		},




		'/sprint': {
			get: {
				tags: ['Sprints'],
				summary: 'Получить все спринты',
				parameters: [
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
				responses: responses
			},
			post: {
				tags: ['Sprints'],
				summary: 'Создать спринт',
				parameters: [
					{
						name: 'name',
						required: "true",
						type: 'string',
						in: 'formData',
					},
					{
						name: 'description',
						type: 'string',
						in: 'formData',
					},
					{
						name: 'plannedStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'plannedFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'projectId',
						type: 'integer',
						in: 'formData',
					},
				],
				responses: responses
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
				responses: responses
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
						name: 'plannedStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'plannedFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factStartDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'factFinishDate',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'projectId',
						type: 'integer',
						in: 'formData',
					},
				],
				responses: responses
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
				responses: responses
			},
		},

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
		Project: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				status: { type: 'string' },
				startDate: { type: 'string' },
				psId: { type: 'string' },
			}
		},
	}
};
