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
		{id: 10, name: '% часов затраченных на роль'},
		{id: 11, name: 'Часы затраченные на роль'},
		{id: 12, name: 'Burndown по спринтам без РР'},
		{id: 13, name: 'Burndown по спринтам с РР'},
		{id: 14, name: 'Динамика закрытия фич (с учетом трудозатрат)'},
		{id: 15, name: 'Трудозатрат на фичи без оценки'},
		{id: 16, name: 'Динамика списания времени на фичи'},
		{id: 17, name: 'Количество открытых задач'},
		{id: 18, name: 'Количество фич без оценки'}
	];
  
	MetricTypes.associate = function(models) {
		MetricTypes.hasMany(models.Metrics, {
			as: 'metricTypes',
			foreignKey: {
				name: 'typeId',
				field: 'type_id'
			}
		});
	};
  
	return MetricTypes;
};