module.exports = function(sequelize, DataTypes) {

	let UserDepartments = sequelize.define('UserDepartments', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		}
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'user_departments'
	});

	return UserDepartments;
};
