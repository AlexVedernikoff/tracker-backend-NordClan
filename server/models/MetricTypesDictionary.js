module.exports = function(sequelize, DataTypes) {
	const MetricTypes = sequelize.define('MetricTypesDictionary', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: false,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(20),
			trim: true,
			allowNull: false,
			validate: {
				len: [1, 20]
			}
		}
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'metric_types'
	});

	MetricTypes.values = [
		{id: 1, name: 'Дата начала проекта'},
		{id: 2, name: 'Дата завершения проекта'},
		{id: 3, name: 'Бюджет проекта без РР (часы)'},
		{id: 4, name: 'Бюджет проекта с РР (часы)'},
		{id: 5, name: 'Burndown по проекту без РР'},
		{id: 6, name: 'Burndown по проекту с РР'},
		{id: 7, name: 'Количество открытых багов'},
		{id: 8, name: 'Количество открытых багов от Заказчика'},
		{id: 9, name: 'Количество открытых регрессионных багов'},
		{id: 10, name: '% часов затраченных на роль 1(Account)'},
		{id: 11, name: '% часов затраченных на роль 2(PM)'},
		{id: 12, name: '% часов затраченных на роль 3(UX)'},
		{id: 13, name: '% часов затраченных на роль 4(Аналитик)'},
		{id: 14, name: '% часов затраченных на роль 5(Back)'},
		{id: 15, name: '% часов затраченных на роль 6(Front)'},
		{id: 16, name: '% часов затраченных на роль 7(Mobile)'},
		{id: 17, name: '% часов затраченных на роль 8(TeamLead(Code review))'},
		{id: 18, name: '% часов затраченных на роль 9(QA)'},
		{id: 19, name: '% часов затраченных на роль 10(Unbillable)'},
		{id: 20, name: 'Часы затраченные на роль 1(Account)'},
		{id: 21, name: 'Часы затраченные на роль 2(PM)'},
		{id: 22, name: 'Часы затраченные на роль 3(UX)'},
		{id: 23, name: 'Часы затраченные на роль 4(Аналитик)'},
		{id: 24, name: 'Часы затраченные на роль 5(Back)'},
		{id: 25, name: 'Часы затраченные на роль 6(Front)'},
		{id: 26, name: 'Часы затраченные на роль 7(Mobile)'},
		{id: 27, name: 'Часы затраченные на роль 8(TeamLead(Code review))'},
		{id: 28, name: 'Часы затраченные на роль 9(QA)'},
		{id: 29, name: 'Часы затраченные на роль 10(Unbillable)'},
		{id: 30, name: 'Burndown по спринтам без РР'},
		{id: 31, name: 'Burndown по спринтам с РР'},
		{id: 32, name: 'Динамика закрытия фич (с учетом трудозатрат)'},
		{id: 33, name: 'Трудозатрат на фичи без оценки'},
		{id: 34, name: 'Динамика списания времени на фичи'},
		{id: 35, name: 'Количество открытых задач типа 1(Фича)'},
		{id: 36, name: 'Количество открытых задач типа 2(Доп. Фича)'},
		{id: 37, name: 'Количество открытых задач типа 3(Баг)'},
		{id: 38, name: 'Количество открытых задач типа 4(Регрес. Баг)'},
		{id: 39, name: 'Количество открытых задач типа 5(Баг от клиента)'},
		{id: 40, name: 'Количество фич без оценки'}
	];
  
	return MetricTypes;
};