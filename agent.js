//const _ = require('lodash');
const Sequelize = require('sequelize');

const sequelize = require('./server/orm');
const Project = require('./server/models').Project;
const ProjectUsers = require('./server/models').ProjectUsers;
const ProjectRolesDictionary = require('./server/models').ProjectRolesDictionary;
const Sprint = require('./server/models').Sprint;
const Task = require('./server/models').Task;
const User = require('./server/models').User;
const TaskStatusesDictionary = require('./server/models').TaskStatusesDictionary;

const executeDate = new Date();

sequelize
.authenticate()
.then(() => {
	console.log('Database connection has been established successfully.');

	getMetrics()
	.then(function(metricsData){

		saveMetrics(metricsData)
		.then(function(){
			console.log('ok');
			process.exit(-1);
		})
		.catch(function(err){
			console.error('saveMetrics err', err);
			process.exit(-1);
		})

	})
	.catch(function(err){
		console.error('getMetrics err', err);
		process.exit(-1);
	})

})
.catch((err) => {
	console.error('Unable to connect to the database:', err);
	process.exit(-1);
});




function getMetrics(){
	return new Promise(function(resolve,reject){
		let projectsQuery = {
			attributes: Project.defaultSelect,
			include: [
				{
					as: 'sprints',
					model: Sprint,
					attributes: Sprint.defaultSelect.concat([
						[
							Sequelize.literal(`(SELECT count(*)
								FROM tasks as t
								WHERE t.project_id = "Project"."id"
								AND t.sprint_id = "sprints"."id"
								AND t.deleted_at IS NULL
								AND t.type_id = '2'
								AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
							'activeBugsAmount'
						], // Количество открытых задач Тип = Баг
						[
							Sequelize.literal(`(SELECT count(*)
								FROM tasks as t
								WHERE t.project_id = "Project"."id"
								AND t.sprint_id = "sprints"."id"
								AND t.deleted_at IS NULL
								AND t.type_id = '5'
								AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
							'clientBugsAmount'
						], // Количество открытых задач Тип = Баг от Клиента
						[
							Sequelize.literal(`(SELECT count(*)
								FROM tasks as t
								WHERE t.project_id = "Project"."id"
								AND t.sprint_id = "sprints"."id"
								AND t.deleted_at IS NULL
								AND t.type_id = '4'
								AND t.status_id NOT IN (${TaskStatusesDictionary.DONE_STATUSES}))`),
							'regressionBugsAmount'
						] // Количество открытых задач Тип = Регрес.баг
					]),
					include : [
						{
							as: 'tasks',
							model: Task,
							attributes: Task.defaultSelect,
							where: {
								statusId: {
									$in: TaskStatusesDictionary.DONE_STATUSES
								},
								deletedAt: {
									$eq: null
								}
							},
							/*include: [
								{
									as: 'performer',
									model: User,
									attributes: User.defaultSelect
								}
							],*/
							required: false
						}
					]
				},
				{
					as: 'users',
					model: User,
					attributes: User.defaultSelect,
					through: {
						model: ProjectUsers,
						attributes: []
					}
				}
			],
			subQuery: true
		};

		Project.findAll(projectsQuery)
		.then(function(projects){

			/*projects.forEach(function(i){
				console.log(JSON.stringify(i));
			})*/

			let projectMetricsTasks = [];

			projects.forEach(function(project){
				project = project.get({ 'plain' : true });
				if(project.sprints.length > 0){
					project.sprints.forEach(function(sprint, sprintKey){
						project.sprints[sprintKey].activeBugsAmount = parseInt(sprint.activeBugsAmount, 10);
						project.sprints[sprintKey].clientBugsAmount = parseInt(sprint.clientBugsAmount, 10);
						project.sprints[sprintKey].regressionBugsAmount = parseInt(sprint.regressionBugsAmount, 10);
					})
				}

				for(var i=1; i<=9; i++){
					projectMetricsTasks.push(metricsLib(i, {
						project,
						executeDate
					}))
				}

				ProjectRolesDictionary.values.forEach(function(projectRole){
					projectMetricsTasks.push(
						metricsLib(10, {
							project,
							executeDate,
							projectRole
						}),
						metricsLib(11, {
							project,
							executeDate,
							projectRole
						})
					)

				})
			})

			Promise.all(projectMetricsTasks)
			.then(function(projectMetrics){
				resolve(projectMetrics);
			})
			.catch(function(err){
				reject(err);
			})
			
		})
		.catch(function(err){
			reject(err);
		})
	});

	function loadProjects(){

	}

	function loadRoles(){

	}
}


function saveMetrics(metricsData){
	metricsData.forEach(function(i){
		console.log(JSON.stringify(i));
	})

	return Promise.resolve();
}

function metricsLib(metricsType, input){
	switch(metricsType){
		
		/*
		(id типа метрики). (название метрики) = (метод расчета метрики)

		// Метрики по проекту

		1. Дата начала проекта	
		2. Дата завершения проекта	
		3. Бюджет проекта без РР (часы)	
		4. Бюджет проекта с РР (часы)	
		5. Burndown по проекту без РР = [Бюджет прокта без РР]-[Списаное время на текущую дату]
		6. Burndown по проекту с РР = [Бюджет прокта c РР]-[Списаное время на текущую дату]
		7. Количество открытых багов = [Количество открытых задач Тип = Баг]
		8. Количество открытых багов от Заказчика = [Количество открытых задач Тип = Баг от Клиента]
		9. Количество открытых регрессионных багов = [Количество открытых задач Тип = Регрес.баг]
		
		// Информация по ролям

		10. % часов затраченных на [РОЛЬ Х] = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		11. часы затраченные на [РОЛЬ Х] = [Часы списанные на проект людьми с ролью Х]
		
		// Метрики по спринтам
		
		12. Burndown по спринтам без РР = [Бюджет спринта без РР]-[Списаное время на текущий спринт на текущую дату]
		13. Burndown по спринтам с РР = [Бюджет спринта с РР]-[Списаное время на текущий спринт на текущую дату]
		14. Динамика закрытия фич (с учетом трудозатрат) = [Сумма трудозатрат (по оценке) по всем фичам спринта]-[Сумма трудозатрат (по оценке) по ЗАКРЫТЫМ фичам спринта у которых была оценка]
		15. Трудозатрат на фичи без оценки = [Сумма трудозатрат по ЗАКРЫТЫМ фичам спринта у которых нет оценки]
		16. Динамика списания времени на фичи = [Сумма трудозатрат списанных на фичи спринта]
		17. Количество открытых задач = [Количество открытых задач типа Х в выбранном спринте]
		18. Количество фич без оценки = [Количество задач Тип = Фича, без проставленной оценки]
		*/

		case(1): // Дата начала проекта
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : input.project.createdAt,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(2): // Дата завершения проекта
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : input.project.completedAt,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(3): // Бюджет проекта без РР (часы)
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : input.project.budget,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(4): // Бюджет проекта с РР (часы)
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : input.project.riskBudget,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(5): // Burndown по проекту без РР = [Бюджет прокта без РР]-[Списаное время на текущую дату]
			let totalFactExecutionTime = input.project.budget || 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						totalFactExecutionTime -= task.factExecutionTime;
					})
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalFactExecutionTime,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(6): // Burndown по проекту с РР = [Бюджет прокта c РР]-[Списаное время на текущую дату]
			let totalRiskFactExecutionTime = input.project.riskBudget || 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						totalRiskFactExecutionTime -= task.factExecutionTime;
					})
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalRiskFactExecutionTime,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(7): // Количество открытых багов = [Количество открытых задач Тип = Баг]
			let totalBugsAmount = 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalBugsAmount += sprint.activeBugsAmount;
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalBugsAmount,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(8): // Количество открытых багов от Заказчика = [Количество открытых задач Тип = Баг от Клиента]
			let totalClientBugsAmount = 0; 
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalClientBugsAmount += sprint.clientBugsAmount;
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalClientBugsAmount,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(9): // Количество открытых регрессионных багов = [Количество открытых задач Тип = Регрес.баг]
			let totalRegressionBugsAmount = 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalRegressionBugsAmount += sprint.regressionBugsAmount;
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalRegressionBugsAmount,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});
		case(10): // % часов затраченных на роль = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
			/*let totalTimeSpent = 0; 
			let totalTimeSpentWithRole = 0; 
			let totalTimeSpentInPercent = 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						totalTimeSpent += task.factExecutionTime;
						input.project.users.forEach(function(user){
							if(user.id == task.performerId) totalTimeSpentWithRole += task.factExecutionTime;
						})
					})
				})
			}
			totalTimeSpentInPercent = ( totalTimeSpentWithRole / totalTimeSpentInPercent ) * 100;
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : totalTimeSpentInPercent,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});*/
			return Promise.resolve({});
		case(11): // Часы затраченные на роль = [Часы списанные на проект людьми с ролью Х]
			/*let _totalTimeSpentWithRole = 0; 
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						
						input.project.users.forEach(function(user){
							if(user.id == task.performerId) _totalTimeSpentWithRole += task.factExecutionTime;
						})

					})
				})
			}
			return Promise.resolve({
				'metricsType' : metricsType,
				'date' : input.executeDate,
				'value' : _totalTimeSpentWithRole,
				'projectId' : input.project.id,
				'projectRoleId' : null,
				'sprintId' : null,
				'userId' : null
			});*/
			return Promise.resolve({});
		case(12): // Burndown по спринтам без РР = [Бюджет спринта без РР]-[Списаное время на текущий спринт на текущую дату]
			return Promise.resolve({});
		case(13): // Burndown по спринтам с РР = [Бюджет спринта с РР]-[Списаное время на текущий спринт на текущую дату]
			return Promise.resolve({});
		case(14): // Динамика закрытия фич (с учетом трудозатрат) = [Сумма трудозатрат (по оценке) по всем фичам спринта]-[Сумма трудозатрат (по оценке) по ЗАКРЫТЫМ фичам спринта у которых была оценка]
			return Promise.resolve({});
		case(15): // Трудозатрат на фичи без оценки = [Сумма трудозатрат по ЗАКРЫТЫМ фичам спринта у которых нет оценки]
			return Promise.resolve({});
		case(16): // Динамика списания времени на фичи = [Сумма трудозатрат списанных на фичи спринта]
			return Promise.resolve({});
		case(17): // Количество открытых задач = [Количество открытых задач типа Х в выбранном спринте]
			return Promise.resolve({});
		case(18): // Количество фич без оценки = [Количество задач Тип = Фича, без проставленной оценки]
			return Promise.resolve({});
			return;
	}
}