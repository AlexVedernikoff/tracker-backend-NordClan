module.exports = function(sequelize, DataTypes) {

	let Tag = sequelize.define('Tag', {
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
		}
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'tags'
	});



	Tag.associate = function(models) {

		Tag.belongsToMany(models.Task, {
			through: {
				model: models.ItemTag,
				unique: false
			},
			foreignKey: 'tag_id',
			constraints: false
		});

		Tag.belongsToMany(models.Project, {
			through: {
				model: models.ItemTag,
				unique: false
			},
			foreignKey: 'tag_id',
			constraints: false
		});

		Tag.belongsToMany(models.Sprint, {
			through: {
				model: models.ItemTag,
				unique: false
			},
			foreignKey: 'tag_id',
			constraints: false
		});

		Tag.belongsToMany(models.Portfolio, {
			through: {
				model: models.ItemTag,
				unique: false
			},
			foreignKey: 'tag_id',
			constraints: false
		});

	};


	return Tag;
};



