module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    ldapLogin: {
      field: 'ldap_login',
      type: DataTypes.TEXT,
      allowNull: true
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    setPasswordToken: {
      field: 'set_password_token',
      type: DataTypes.STRING,
      allowNull: true
    },
    setPasswordExpired: {
      field: 'set_password_expired',
      type: DataTypes.DATE,
      allowNull: true
    },
    expiredDate: {
      field: 'expired_date',
      type: DataTypes.DATE,
      allowNull: true
    },
    lastNameEn: {
      field: 'last_name_en',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    firstNameEn: {
      field: 'first_name_en',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    lastNameRu: {
      field: 'last_name_ru',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    firstNameRu: {
      field: 'first_name_ru',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    fullNameRu: {
      field: 'full_name_ru',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    fullNameEn: {
      field: 'full_name_en',
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 200]
      }
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true
      }
    },
    isActive: {
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
      field: 'birth_date',
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    globalRole: {
      field: 'global_role',
      type: DataTypes.ENUM(0, 1),
      allowNull: true
    },
    psId: {
      field: 'ps_id',
      allowNull: true,
      type: DataTypes.STRING
    },
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'}
  }, {
    indexes: [
      {
        unique: true,
        fields: ['login']
      }
    ],
    timestamps: false,
    paranoid: true,
    underscored: true,
    tableName: 'users',
    getterMethods: {
      fullNameRu: function (){
        const fullNameRuArr = [this.firstNameRu, this.lastNameRu].filter(i => i);
        return fullNameRuArr.join(' ');
      },
      fullNameEn: function (){
        const fullNameEnArr = [this.firstNameEn, this.lastNameEn].filter(i => i);
        return fullNameEnArr.join(' ');
      }
    }
  });

  User.associate = function (models) {
    User.belongsToMany(models.Department, {
      as: 'department',
      through: models.UserDepartments
    });

    User.hasOne(models.Token, {
      as: 'token',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });

    User.hasMany(models.ProjectUsers, {
      as: 'usersProjects',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }});

    User.hasMany(models.Project, {
      as: 'authorsProjects',
      foreignKey: {
        name: 'authorId',
        field: 'author_id'
      }});

    User.hasOne(models.Timesheet, {
      as: 'timesheet',
      foreignKey: {
        name: 'userId',
        field: 'user_id'
      }
    });

  };

  User.defaultSelect = ['id', 'fullNameRu', 'firstNameRu', 'lastNameRu', ['ldap_login', 'fullNameEn'], 'fullNameEn', 'lastNameEn',
    'firstNameEn', 'skype', 'birthDate', 'emailPrimary', 'phone', 'mobile', 'photo', 'psId', 'deletedAt', 'globalRole',
    'expiredDate', 'isActive'];

  User.EXTERNAL_USER_ROLE = 'EXTERNAL_USER';

  return User;
};
