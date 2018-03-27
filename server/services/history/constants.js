module.exports = {
  actions: {
    SET: 'SET',
    DELETE: 'DELETE',
    CHANGE: 'CHANGE',
    CREATE: 'CREATE'
  },
  resources: {
    CREATE_PROJECT: {
      message: 'создал(а) проект'
    },
    CREATE_PROJECT_CREATEDBYSYSTEMUSER: {
      message: 'создал(а) проект от системного пользователя'
    },
    CHANGE_PROJECT_NAME: {
      message: 'изменил(-а) название проекта c \'{prevValue}\' на \'{value}\''
    },
    SET_PROJECT_DESCRIPTION: {
      message: 'добавил(а) описание проекта \'{value}\''
    },
    CHANGE_PROJECT_DESCRIPTION: {
      message: 'изменил(-а) описание проекта c \'{prevValue}\' на \'{value}\''
    },
    CHANGE_PROJECT_STATUSID: {
      message: 'изменил(-а) статус проекта c \'{prevValue}\' на \'{value}\''
    },
    SET_PROJECT_BUDGET: {
      message: 'добавил(а) бюджет проекта без рискового резерва \'{value}\''
    },
    CREATE_PROJECT_BUDGET: {
      message: 'добавил(а) бюджет проекта без рискового резерва \'{value}\''
    },
    CHANGE_PROJECT_BUDGET: {
      message: 'изменил(-а) бюджет проекта без рискового резерва c \'{prevValue}\' на \'{value}\''
    },
    CREATE_PROJECT_RISKBUDGET: {
      message: 'добавил(а) бюджет проекта с рисковым резервом \'{value}\''
    },
    SET_PROJECT_RISKBUDGET: {
      message: 'добавил(а) бюджет проекта с рисковым резервом \'{value}\''
    },
    CHANGE_PROJECT_RISKBUDGET: {
      message: 'изменил(-а) бюджет проекта c рисковым резервом c \'{prevValue}\' на \'{value}\''
    },
    CREATE_SPRINT: {
      message: 'создал(-а) спринт \'{sprint}\'',
      entities: ['sprint']
    },
    SET_SPRINT_DELETED_AT: {
      message: 'удалил(-а) спринт \'{sprint}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_STATUSID: {
      message: 'изменил(-а) статус спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CREATE_SPRINT_ALLOTTEDTIME: {
      message: 'добавил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    SET_SPRINT_ALLOTTEDTIME: {
      message: 'добавил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_ALLOTTEDTIME: {
      message: 'изменил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_NAME: {
      message: 'изменил(-а) название спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    SET_SPRINT_FACTSTARTDATE: {
      message: 'добавил(-а) фактическое начало спринта {sprint} \'{value}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_FACTSTARTDATE: {
      message: 'изменил(-а) фактическое начало спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    SET_SPRINT_FACTFINISHDATE: {
      message: 'добавил(-а) фактическое завершение спринта {sprint} \'{value}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_FACTFINISHDATE: {
      message: 'изменил(-а) фактическое завершение спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CREATE_SPRINT_BUDGET: {
      message: 'добавил(а) бюджет спринта {sprint} без рискового резерва \'{value}\'',
      entities: ['sprint']
    },
    CREATE_SPRINT_RISKBUDGET: {
      message: 'добавил(а) бюджет спринта {sprint} с рисковым резервом \'{value}\'',
      entities: ['sprint']
    },
    CREATE_PROJECTUSER: {
      message: 'добавил(-а) нового пользователя {user} в проект',
      entities: ['project_user.user']
    },
    SET_PROJECTUSER_ROLESIDS: {
      message: 'добавил(-а) нового пользователя {user} в проект',
      entities: ['project_user.user']
    },
    CHANGE_PROJECTUSER_ROLESIDS: {
      message: '{action}(-а) роль {role} для пользователя {user}',
      entities: ['project_user.user']
    },
    SET_PROJECTUSER_DELETED_AT: {
      message: 'удалил(-а) пользователя {user} из проекта',
      entities: ['project_user.user']
    },
    CREATE_PROJECTATTACHMENT: {
      message: 'прикрепил(-а) файл',
      entities: []
    },
    SET_PROJECTATTACHMENT_DELETED_AT: {
      message: 'удалил(-а) файл',
      entities: []
    },
    CREATE_ITEMTAG: {
      message: 'добавил(-а) тег \'{tag}\''
    },
    SET_ITEMTAG_DELETED_AT: {
      message: 'удалил(-а) тег \'{tag}\''
    },
    SET_PROJECT_PREFIX: {
      message: 'добавил(а) префикс проекта \'{value}\''
    },
    CHANGE_PROJECT_PREFIX: {
      message: 'изменил(а) префикс проекта c \'{prevValue}\' на \'{value}\''
    },
    SET_PROJECT_PORTFOLIOID: {
      message: 'добавил(а) проект в портфель {portfolio}',
      entities: ['portfolio']
    },
    CHANGE_PROJECT_PORTFOLIOID: {
      message: 'добавил(а) проект в портфель {portfolio}',
      entities: ['portfolio']
    },
    DELETE_PROJECT_PORTFOLIOID: {
      message: 'удалил(а) проект из портфеля {portfolio}',
      entities: ['portfolio']
    }
  }
};
