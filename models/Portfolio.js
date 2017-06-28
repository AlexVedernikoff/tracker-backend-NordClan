module.exports = function(sequelize, DataTypes) {

	let Portfolio = sequelize.define("Portfolio", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			trim: true,
			allowNull: false,
			validate: {
				max: {
					args: 255,
					msg: 'Name must be less than 255 characters.'
				}
			}
		},
		description: {
			trim: true,
			type: DataTypes.TEXT,
			defaultValue: null
		},
		createdAt: {type: DataTypes.DATE, field: 'created_at'},
		updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
		deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
	}, {
		underscored: true,
		timestamps: true,
		paranoid: true,
		tableName: 'portfolios'
	});


	Portfolio.associate = function(models) {

		Portfolio.hasMany(models.Project, {foreignKey: {
			name: 'portfolioId',
			field: 'portfolio_id'
		}});

		Portfolio.belongsToMany(models.Tag, {
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'portfolio'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

		Portfolio.belongsToMany(models.Tag, {
			as: 'tagForQuery',
			through: {
				model: models.ItemTag,
				unique: false,
				scope: {
					taggable: 'portfolio'
				}
			},
			foreignKey: 'taggable_id',
			constraints: false
		});

	};

	return Portfolio;
};