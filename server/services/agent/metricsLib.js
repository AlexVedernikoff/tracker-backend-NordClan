const TaskStatusesDictionary = require('../../models').TaskStatusesDictionary;

module.exports = function (metricsTypeId, input){
	switch(metricsTypeId){
		
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

		10. % часов затраченных на роль 1(Account) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		11. % часов затраченных на роль 2(PM) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		12. % часов затраченных на роль 3(UX) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		13. % часов затраченных на роль 4(Аналитик) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		14. % часов затраченных на роль 5(Back) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		15. % часов затраченных на роль 6(Front) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		16. % часов затраченных на роль 7(Mobile) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		17. % часов затраченных на роль 8(TeamLead(Code review)) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		18. % часов затраченных на роль 9(QA) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		19. % часов затраченных на роль 10(Unbillable) = [Часы списанные на проект людьми с ролью Х]/[Часы списанные на проект всеми участниками проекта]*100%
		20. часы затраченные на роль 1(Account) = [Часы списанные на проект людьми с ролью Х]
		21. часы затраченные на роль 2(PM) = [Часы списанные на проект людьми с ролью Х]
		22. часы затраченные на роль 3(UX) = [Часы списанные на проект людьми с ролью Х]
		23. часы затраченные на роль 4(Аналитик) = [Часы списанные на проект людьми с ролью Х]
		24. часы затраченные на роль 5(Back) = [Часы списанные на проект людьми с ролью Х]
		25. часы затраченные на роль 6(Front) = [Часы списанные на проект людьми с ролью Х]
		26. часы затраченные на роль 7(Mobile) = [Часы списанные на проект людьми с ролью Х]
		27. часы затраченные на роль 8(TeamLead(Code review)) = [Часы списанные на проект людьми с ролью Х]
		28. часы затраченные на роль 9(QA) = [Часы списанные на проект людьми с ролью Х]
		29. часы затраченные на роль 10(Unbillable) = [Часы списанные на проект людьми с ролью Х]
		
		// Метрики по спринтам
		
		30. Burndown по спринтам без РР = [Бюджет спринта без РР]-[Списаное время на текущий спринт на текущую дату]
		31. Burndown по спринтам с РР = [Бюджет спринта с РР]-[Списаное время на текущий спринт на текущую дату]
		32. Динамика закрытия фич (с учетом трудозатрат) = [Сумма трудозатрат (по оценке) по всем фичам спринта]-[Сумма трудозатрат (по оценке) по ЗАКРЫТЫМ фичам спринта у которых была оценка]
		33. Трудозатрат на фичи без оценки = [Сумма трудозатрат по ЗАКРЫТЫМ фичам спринта у которых нет оценки]
		34. Динамика списания времени на фичи = [Сумма трудозатрат списанных на фичи спринта]

		35. Количество открытых задач типа 1(Фича) = [Количество открытых задач типа Х в выбранном спринте]
		36. Количество открытых задач типа 2(Доп. Фича) = [Количество открытых задач типа Х в выбранном спринте]
		37. Количество открытых задач типа 3(Баг) = [Количество открытых задач типа Х в выбранном спринте]
		38. Количество открытых задач типа 4(Регрес. Баг) = [Количество открытых задач типа Х в выбранном спринте]
		39. Количество открытых задач типа 5(Баг от клиента) = [Количество открытых задач типа Х в выбранном спринте]

		40. Количество фич без оценки = [Количество задач Тип = Фича, без проставленной оценки]
		*/

		case(1):
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : input.project.createdAt,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(2):
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : input.project.completedAt,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(3):
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : input.project.budget,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(4):
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : input.project.riskBudget,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(5):
			let projectBurndown = input.project.budget || 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						if(!task.factExecutionTime) return;
						projectBurndown -= task.factExecutionTime;
					})
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : projectBurndown,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(6):
			let projectRiskBurndown = input.project.riskBudget || 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						if(!task.factExecutionTime) return;
						projectRiskBurndown -= task.factExecutionTime;
					})
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : projectRiskBurndown,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(7):
			let totalBugsAmount = 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalBugsAmount += sprint.activeBugsAmount;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : totalBugsAmount,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(8):
			let totalClientBugsAmount = 0; 
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalClientBugsAmount += sprint.clientBugsAmount;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : totalClientBugsAmount,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(9):
			let totalRegressionBugsAmount = 0;
			if(input.project.sprints.length > 0){
				input.project.sprints.forEach(function(sprint){
					totalRegressionBugsAmount += sprint.regressionBugsAmount;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : totalRegressionBugsAmount,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(10):
		case(11):
		case(12):
		case(13):
		case(14):
		case(15):
		case(16):
		case(17):
		case(18):
		case(19):
			let rolesIdsConf = {
					'10' : 1,
					'11' : 2,
					'12' : 3,
					'13' : 4,
					'14' : 5,
					'15' : 6,
					'16' : 7,
					'17' : 8,
					'18' : 9,
					'19' : 10
				};
			let roleId = rolesIdsConf[metricsTypeId.toString()];
			let totalTimeSpent = 0; 
			let totalTimeSpentWithRole = 0; 
			let totalTimeSpentInPercent = 0;
			if(input.project.sprints.length > 0 && input.project.users.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						if(!task.factExecutionTime) return;
						totalTimeSpent += task.factExecutionTime;
						input.project.users.forEach(function(user){
							if(user.id == task.performerId && user.projectUser.rolesIds.indexOf(roleId) !== -1) totalTimeSpentWithRole += task.factExecutionTime;
						})
					})
				})
			}
			totalTimeSpentInPercent = ( totalTimeSpentWithRole / totalTimeSpent ) * 100 || 0;
			totalTimeSpentInPercent = parseFloat(totalTimeSpentInPercent.toFixed(2));
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : totalTimeSpentInPercent,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(20):
		case(21):
		case(22):
		case(23):
		case(24):
		case(25):
		case(26):
		case(27):
		case(28):
		case(29):
			let _rolesIdsConf = {
					'20' : 1,
					'21' : 2,
					'22' : 3,
					'23' : 4,
					'24' : 5,
					'25' : 6,
					'26' : 7,
					'27' : 8,
					'28' : 9,
					'29' : 10
				};
			let _roleId = _rolesIdsConf[metricsTypeId.toString()];
			let _totalTimeSpentWithRole = 0; 
			if(input.project.sprints.length > 0 && input.project.users.length > 0){
				input.project.sprints.forEach(function(sprint){
					if(sprint.tasks.length == 0) return;
					sprint.tasks.forEach(function(task){
						input.project.users.forEach(function(user){
							if(!task.factExecutionTime) return;
							if(user.id == task.performerId && user.projectUser.rolesIds.indexOf(_roleId) !== -1) _totalTimeSpentWithRole += task.factExecutionTime;
						})

					})
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : _totalTimeSpentWithRole,
				'projectId' : input.project.id,
				'sprintId' : null,
				'userId' : null
			});

		case(30):
			let sprintBurndown = input.sprint.budget || 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(!task.factExecutionTime) return;
					sprintBurndown -= task.factExecutionTime;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : sprintBurndown,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(31):
			let _sprintBurndown = input.sprint.riskBudget || 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(!task.factExecutionTime) return;
					_sprintBurndown -= task.factExecutionTime;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : _sprintBurndown,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(32):
			let closedTasksDynamics = 0;
			let laborCostsTotal = 0;
			let laborCostsClosedTasks = 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(!task.plannedExecutionTime) return;
					laborCostsTotal += task.plannedExecutionTime;
					if(task.typeId == 1) laborCostsClosedTasks += task.plannedExecutionTime;
				})
			}
			closedTasksDynamics = laborCostsTotal - laborCostsClosedTasks;
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : closedTasksDynamics,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(33):
			let laborCostsWithoutRating = 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(
						task.plannedExecutionTime ||
						task.typeId !== 1 ||
						task.statusId !== TaskStatusesDictionary.CLOSED_STATUS ||
						!task.factExecutionTime
					) return;
					laborCostsWithoutRating += task.factExecutionTime;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : laborCostsWithoutRating,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(34):
			let _laborCostsTotal = 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(!task.factExecutionTime || task.typeId !== 1) return;
					_laborCostsTotal += task.factExecutionTime;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : _laborCostsTotal,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(35):
		case(36):
		case(37):
		case(38):
		case(39):
			let taskTypeIdsConf = {
				'1' : 1,
				'2' : 2,
				'3' : 3,
				'4' : 4,
				'5' : 5
			};
			let taskTypeId = taskTypeIdsConf[metricsTypeId.toString()];
			let openedTasksAmount = 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(task.statusId == TaskStatusesDictionary.CLOSED_STATUS || task.typeId !== taskTypeId) return;
					openedTasksAmount++;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : openedTasksAmount,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});

		case(40):
			let unratedFeaturesTotal = 0;
			if(input.sprint.tasks.length > 0){
				input.sprint.tasks.forEach(function(task){
					if(task.plannedExecutionTime || task.typeId !== 1) return;
					unratedFeaturesTotal++;
				})
			}
			return Promise.resolve({
				'typeId' : metricsTypeId,
				'createdAt' : input.executeDate,
				'value' : unratedFeaturesTotal,
				'projectId' : input.project.id,
				'sprintId' : input.sprint.id,
				'userId' : null
			});
	}
}