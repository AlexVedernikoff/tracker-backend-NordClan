module.exports = function(sequelize, DataTypes) {

	let Portfolio = sequelize.define("Portfolio", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(150),
			trim: true,
			allowNull: false,
			validate: {
				len: [1, 150]
			}
		},
		authorId: {
			field: 'author_id',
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		createdAt: {type: DataTypes.DATE, field: 'created_at'},
		updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
		deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
	}, {
		underscored: true,
		timestamps: true,
		paranoid: false,
		tableName: 'portfolios'
	});


	Portfolio.associate = function(models) {

		Portfolio.hasMany(models.Project, {
			as: 'projects',
			foreignKey: {
				name: 'portfolioId',
				field: 'portfolio_id'
		}});

	};


	return Portfolio;
};