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
						name: 'limit',
						type: 'integer',
						in: 'query',
					},
					{
						name: 'page',
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
						name: 'type_id',
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
						name: 'status_id',
						type: 'integer',
						in: 'formData',
					},
					{
						name: 'portfolio_id',
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
						name: 'risk_budget',
						type: 'number',
						in: 'formData',
					},
					{
						name: 'planned_start_date',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'planned_finish_date',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'fact_start_date',
						type: 'string',
						format: 'date',
						in: 'formData',
					},
					{
						name: 'fact_finish_date',
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
						name: 'status_id',
						type: 'integer',
						in: 'formData',
					},
					{
						name: 'type_id',
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
						name: 'risk_budget',
						type: 'numeric',
						in: 'formData',
					},
					{
						name: 'planned_start_date',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'planned_finish_date',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'fact_start_date',
						type: 'date',
						in: 'formData',
					},
					{
						name: 'fact_finish_date',
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
						name: 'limit',
						type: 'integer',
						in: 'query',
					},
					{
						name: 'page',
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
