module.exports = {
	swagger: '2.0',
	info: {
		title: 'Sim-Track API',
		version: '1.0.0'
	},
	basePath: '/api',
	paths: {

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
