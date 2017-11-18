module.exports = function(sequelize, DataTypes) {
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
    createdAt: {type: DataTypes.DATE, field: 'created_at'},
    updatedAt: {type: DataTypes.DATE, field: 'updated_at'},
    deletedAt: {type: DataTypes.DATE, field: 'deleted_at'},
    
    psId: {
      field: 'ps_id',
      allowNull: true,
      type: DataTypes.STRING
    },


  }, {
    indexes: [
      {
        unique: true,
        fields: ['login']
      },
    ],
    timestamps: false,
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

  };
  //
  User.defaultSelect = ['id', 'fullNameRu', 'firstNameRu', 'lastNameRu', ['ldap_login', 'fullNameEn'], 'lastNameEn',
    'firstNameEn', 'skype', 'birthDate', 'emailPrimary', 'phone', 'mobile', 'photo', 'psId', 'deletedAt', 'globalRole'];

  return User;
};
