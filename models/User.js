const Sequelize = require('sequelize');
const sequelizeTransforms = require('sequelize-transforms');
const sequelize = require('../orm');
const Department = require('./Department');
sequelizeTransforms(sequelize);

const User = sequelize.define("User", {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	login: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: false,
		validate: {
			max: 225
		}
	},
	lastNameEn: {
		filed: 'last_name_en',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	firstNameEn: {
		filed: 'first_name_en',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	lastNameRu: {
		filed: 'last_name_ru',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	firstNameRu: {
		filed: 'first_name_ru',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	active: {
		type: Sequelize.INTEGER,
		// allowNull: true,
		// validate: {
		// 	isInt: true
		// }
	},
	photo: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	emailPrimary: {
		filed: 'email_primary',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	emailSecondary: {
		filed: 'email_secondary',
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	phone: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 225
		}
	},
	skype: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 255
		}
	},
	city: {
		type: Sequelize.STRING,
		trim: true,
		allowNull: true,
		validate: {
			max: 255
		}
	},
	birthDate: {
		filed: "birth_date",
		type: Sequelize.DATE,
		// trim: true,
		// allowNull: true,
		// validate: {
		// 	isDate: true
		// }
	},
	createDate: {
		filed: "create_date",
		type: Sequelize.DATE,
		trim: true,
		allowNull: true,
		// validate: {
		// 	isDate: true
		// }
	},
	deleteDate: {
		filed: "delete_date",
		type: Sequelize.DATE,
		//trim: true,
		//allowNull: true,
		// validate: {
		// 	isDate: true
		// }
	},



}, {
	timestamps: true,
	paranoid: true,
	underscored: true,
	tableName: 'user'
});



const UserDepartmens = sequelize.define('UserDepartmens', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	}
});

User.belongsToMany(Department, { through: UserDepartmens });
Department.belongsToMany(User, { through: UserDepartmens });


module.exports = User;
