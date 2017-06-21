const Sequelize = require('sequelize');
const sequelize = require('../orm');
const Department = require('./Department');
const UserDepartments = require('./UserDepartments');
const UserTokens = require('./Token');


const User = sequelize.define("User", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	ldapLogin: {
		filed: 'ldap_login',
		type: Sequelize.TEXT,
		allowNull: false,
	},
	login: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			max: 225
		}
	},
	lastNameEn: {
		filed: 'last_name_en',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	firstNameEn: {
		filed: 'first_name_en',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	lastNameRu: {
		filed: 'last_name_ru',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	firstNameRu: {
		filed: 'first_name_ru',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	active: {
		type: Sequelize.INTEGER,
		allowNull: true,
		validate: {
			isInt: true
		}
	},
	photo: {
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	emailPrimary: {
		filed: 'email_primary',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	emailSecondary: {
		filed: 'email_secondary',
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	phone: {
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	skype: {
		type: Sequelize.STRING,
		//trim: true,
		allowNull: true,
		validate: {
			max: 255
		}
	},
	city: {
		type: Sequelize.STRING,
		allowNull: true,
		validate: {
			max: 255
		}
	},
	birthDate: {
		filed: "birth_date",
		type: Sequelize.DATEONLY,
		allowNull: true,
		validate: {
			isDate: true
		}
	},
	createDate: {
		filed: "create_date",
		type: Sequelize.DATE,
		allowNull: true,
		validate: {
			isDate: true
		}
	},
	deleteDate: {
		filed: "delete_date",
		type: Sequelize.DATE,
		allowNull: true,
		validate: {
			isDate: true
		}
	},
	psId: {
		field: 'ps_id',
		allowNull: true,
		type: Sequelize.STRING
	},


}, {
	timestamps: true,
	paranoid: true,
	underscored: true,
	tableName: 'users'
});


User.belongsToMany(Department, { through: UserDepartments });
Department.belongsToMany(User, { through: UserDepartments });
User.hasMany(UserTokens, {
	foreignKey: {
		name: 'userId',
		field: 'user_id'
	}
});
UserTokens.belongsTo(User, {foreignKey: {
	name: 'userId',
	field: 'user_id'
}});


module.exports = User;
