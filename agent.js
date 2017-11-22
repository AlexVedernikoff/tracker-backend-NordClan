const Sequelize = require('sequelize');
const moment = require('moment');

const sequelize = require('./server/orm');
const Project = require('./server/models').Project;
const ProjectUsers = require('./server/models').ProjectUsers;
const Sprint = require('./server/models').Sprint;
const Task = require('./server/models').Task;
const TaskStatusesDictionary = require('./server/models').TaskStatusesDictionary;
const User = require('./server/models').User;
const Metrics = require('./server/models').Metrics;
const metricsLib = require('./server/components/metricsLib');

const executeDate = moment().toISOString();

init()
.then(() => {
	console.log('Database connection has been established successfully.');

	getMetrics()
	.then(function(metricsData){

		metricsData.forEach(function(i){
			console.log(JSON.stringify(i));
		})

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

function init(){
	return sequelize.authenticate();
}

function getMetrics(){
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
							required: false
						}
					]
				},
				{
					as: 'users',
					model: User,
					attributes: User.defaultSelect,
					through: {
						as: 'projectUser',
						model: ProjectUsers
					}
				}
			],
			subQuery: true
		};

	return new Promise(function(resolve,reject){
		Project.findAll(projectsQuery)
		.then(function(projects){

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

				if(project.users.length > 0){
					project.users.forEach(function(user, userKey){
						if(!user.projectUser.rolesIds) return;
						project.users[userKey].projectUser.rolesIds = JSON.parse(user.projectUser.rolesIds);
					})
				}

				for(var i=1; i<=9; i++){
					projectMetricsTasks.push(metricsLib(i, {
						project,
						executeDate
					}))
				}

				for(var i=10; i<=29; i++){
					projectMetricsTasks.push(metricsLib(i, {
						project,
						executeDate
					}))
				}

				if(project.sprints.length > 0){
					project.sprints.forEach(function(sprint){
						for(var i=30; i<=40; i++){
							projectMetricsTasks.push(metricsLib(i, {
								project,
								sprint,
								executeDate
							}))
						}
					})
				}
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
}


function saveMetrics(metricsData){
	return Metrics.bulkCreate(metricsData);
}