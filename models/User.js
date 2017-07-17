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
				len: [2, 100]
			}
		},
		lastNameEn: {
			field: 'last_name_en',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [2, 100]
			}
		},
		firstNameEn: {
			field: 'first_name_en',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [2, 100]
			}
		},
		lastNameRu: {
			field: 'last_name_ru',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [2, 100]
			}
		},
        firstNameRu: {
            field: 'first_name_ru',
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2, 100]
            }
        },
        fullNameRu: {
            field: 'full_name_ru',
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2, 200]
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
				len: [0, 100]
			}
		},
		emailPrimary: {
			field: 'email_primary',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
			}
		},
		emailSecondary: {
			field: 'email_secondary',
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
			}
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
			}
		},
		mobile: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
			}
		},
		skype: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
			}
		},
		city: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [0, 100]
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
		tableName: 'users',
		getterMethods: {
			fullNameRu: function(){
				return this.firstNameRu.concat(' ', this.lastNameRu);
			}
		}
	});

	User.associate = function(models) {
		User.belongsToMany(models.Department, {
			as: 'department',
			through: models.UserDepartments
		});

		User.hasMany(models.Token, {
			foreignKey: {
				name: 'userId',
				field: 'user_id'
			}
		});

		User.hasOne(models.ProjectUsers);


	};

	return User;
};
