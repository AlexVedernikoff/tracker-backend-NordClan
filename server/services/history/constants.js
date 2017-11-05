module.exports = {
  actions: {
    SET: 'SET',
    DELETE: 'DELETE',
    CHANGE: 'CHANGE',
    CREATE: 'CREATE'
  },
  resources: {
    CHANGE_PROJECT_NAME: {
      message: 'изменил(-а) название проекта c \'{prevValue}\' на \'{value}\''
    },
    CHANGE_PROJECT_DESCRIPTION: {
      message: 'изменил(-а) описание проекта c \'{prevValue}\' на \'{value}\''
    },
    CHANGE_PROJECT_STATUSID: {
      message: 'изменил(-а) статус проекта c \'{prevValue}\' на \'{value}\''
    },
    CHANGE_PROJECT_BUDGET: {
      message: 'изменил(-а) бюджет проекта c рисковым резервом c \'{prevValue}\' на \'{value}\''
    },
    CHANGE_PROJECT_RISKBUDGET: {
      message: 'изменил(-а) бюджет проекта без рискового резерва c \'{prevValue}\' на \'{value}\''
    },
    CREATE_SPRINT: {
      message: 'создал(-а) спринт \'{sprint}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_STATUSID: {
      message: 'изменил(-а) статус спринта {sprint} c \'{prevValue}\' на \'{value}\'',
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
    CHANGE_SPRINT_FACTSTARTDATE: {
      message: 'изменил(-а) фактическое начало спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CHANGE_SPRINT_FACTFINISHDATE: {
      message: 'изменил(-а) фактическое завершение спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint']
    },
    CREATE_PROJECTUSER: {
      message: 'добавил(-а) нового пользователя {user} в проект',
      entities: ['user']
    },
    CHANGE_PROJECTUSER_ROLESIDS: {
      message: '{action}(-а) роль {role} для пользователя {user}',
      entities: ['user']
    },
    SET_PROJECTUSER_DELETED_AT: {
      message: 'удалил(-а) пользователя {user} из проекта',
      entities: ['user']
    },
    CREATE_ITEMTAG: {
      message: 'добавил(-а) тег \'{tag}\'',
    },
    SET_ITEMTAG_DELETED_AT: {
      message: 'удалил(-а) тег \'{tag}\'',
    }
  }
};
