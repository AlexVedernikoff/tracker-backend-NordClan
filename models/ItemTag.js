module.exports = function(sequelize, DataTypes) {

	let ItemTag = sequelize.define('ItemTag', {
		id : {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		tagId: {
			field: 'tag_id',
			type: DataTypes.INTEGER,
			unique: 'item_tag_taggable'
		},
		taggable: {
			type: DataTypes.STRING,
			unique: 'item_tag_taggable'
		},
		taggableId: {
			field: 'taggable_id',
			type: DataTypes.INTEGER,
			unique: 'item_tag_taggable',
			references: null
		}
	}, {
		underscored: true,
		timestamps: false,
		paranoid: false,
		tableName: 'item_tags'
	});

	ItemTag.associate = function(models) {

		ItemTag.belongsTo(models.Tag,{
				as: 'tag',
				foreignKey: {
					name: 'tagId',
					field: 'tag_id'
				}
		});

	};

	return ItemTag;
};