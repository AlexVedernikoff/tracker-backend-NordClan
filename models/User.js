module.exports = function(sequelize, DataTypes) {

	let User = sequelize.define("User", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		ldapLogin: {
			field: 'ldap_login',
			type: DataTypes.TEXT,
			allowNull: false,
		},
		login: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				max: 225
			}
		},
		lastNameEn: {
			field: 'last_name_en',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		firstNameEn: {
			field: 'first_name_en',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		lastNameRu: {
			field: 'last_name_ru',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		firstNameRu: {
			field: 'first_name_ru',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		active: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				isInt: true
			}
		},
		photo: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		emailPrimary: {
			field: 'email_primary',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		emailSecondary: {
			field: 'email_secondary',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 225
			}
		},
		skype: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 255
			}
		},
		city: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				max: 255
			}
		},
		birthDate: {
			field: "birth_date",
			type: DataTypes.DATEONLY,
			allowNull: true,
			validate: {
				isDate: true
			}
		},
		createDate: {
			field: "create_date",
			type: DataTypes.DATE,
			allowNull: true,
			validate: {
				isDate: true
			}
		},
		deleteDate: {
			field: "delete_date",
			type: DataTypes.DATE,
			allowNull: true,
			validate: {
				isDate: true
			}
		},
		psId: {
			field: 'ps_id',
			allowNull: true,
			type: DataTypes.STRING
		},


	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
		tableName: 'users'
	});

	User.associate = function(models) {
		User.belongsToMany(models.Department, { through: models.UserDepartments });

		User.hasMany(models.Token, {
			foreignKey: {
				name: 'userId',
				field: 'user_id'
			}
		});


	};

	return User;
};







