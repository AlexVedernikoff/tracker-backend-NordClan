module.exports = {
  actions: {
    SET: 'SET',
    DELETE: 'DELETE',
    CHANGE: 'CHANGE',
    CREATE: 'CREATE'
  },
  resources: {
    CREATE_PROJECT: {
      message: 'создал(а) проект',
      messageEn: 'was created project'
    },
    CREATE_PROJECT_CREATEDBYSYSTEMUSER: {
      message: 'создал(а) проект от системного пользователя',
      messageEn: 'was created project from system user'
    },
    CHANGE_PROJECT_NAME: {
      message: 'изменил(-а) название проекта c \'{prevValue}\' на \'{value}\'',
      messageEn: 'was changed name of project from \'{prevValue}\' to \'{value}\''
    },
    SET_PROJECT_DESCRIPTION: {
      message: 'добавил(а) описание проекта \'{value}\'',
      messageEn: 'added description project \'{value}\''
    },
    CHANGE_PROJECT_DESCRIPTION: {
      message: 'изменил(-а) описание проекта c \'{prevValue}\' на \'{value}\'',
      messageEn: 'changed description project from \'{prevValue}\' to \'{value}\''
    },
    CHANGE_PROJECT_STATUSID: {
      message: 'изменил(-а) статус проекта c \'{prevValue}\' на \'{value}\'',
      messageEn: 'changed status project from \'{prevValue}\' to \'{value}\''
    },
    SET_PROJECT_BUDGET: {
      message: 'добавил(а) бюджет проекта без рискового резерва \'{value}\'',
      messageEn: 'added budget project without risk reserve \'{value}\''
    },
    CREATE_PROJECT_BUDGET: {
      message: 'добавил(а) бюджет проекта без рискового резерва \'{value}\'',
      messageEn: 'added budget project without risk reserve \'{value}\''
    },
    CHANGE_PROJECT_BUDGET: {
      message: 'изменил(-а) бюджет проекта без рискового резерва c \'{prevValue}\' на \'{value}\'',
      messageEn: 'changed budget project without risk reserve from \'{prevValue}\' to \'{value}\''
    },
    CREATE_PROJECT_RISKBUDGET: {
      message: 'добавил(а) бюджет проекта с рисковым резервом \'{value}\'',
      messageEn: 'added budget project with risk reserve \'{value}\''
    },
    SET_PROJECT_RISKBUDGET: {
      message: 'добавил(а) бюджет проекта с рисковым резервом \'{value}\'',
      messageEn: 'added budget project with risk reserve \'{value}\''
    },
    CHANGE_PROJECT_RISKBUDGET: {
      message: 'изменил(-а) бюджет проекта c рисковым резервом c \'{prevValue}\' на \'{value}\'',
      messageEn: 'changed budget project without risk reserve from \'{prevValue}\' to \'{value}\''
    },
    CREATE_SPRINT: {
      message: 'создал(-а) спринт \'{sprint}\'',
      entities: ['sprint'],
      messageEn: 'created sprint \'{sprint}\''
    },
    SET_SPRINT_DELETED_AT: {
      message: 'удалил(-а) спринт \'{sprint}\'',
      entities: ['sprint'],
      messageEn: 'removed sprint \'{sprint}\''
    },
    CHANGE_SPRINT_STATUSID: {
      message: 'изменил(-а) статус спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'changed status of sprint \'{sprint}\' from \'{prevValue}\' to \'{value}\''
    },
    CREATE_SPRINT_ALLOTTEDTIME: {
      message: 'добавил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added allotted time to sprint \'{sprint}\' from \'{prevValue}\' to \'{value}\''
    },
    SET_SPRINT_ALLOTTEDTIME: {
      message: 'добавил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added alotted time to sprint \'{sprint}\' from \'{prevValue}\' to \'{value}\''
    },
    CHANGE_SPRINT_ALLOTTEDTIME: {
      message: 'изменил(-а) выделенное время на спринт {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'changed alotted time to sprint \'{sprint}\' from \'{prevValue}\' to \'{value}\''
    },
    CHANGE_SPRINT_NAME: {
      message: 'изменил(-а) название спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'changed name of sprint \'{sprint}\' from \'{prevValue}\' to \'{value}\''
    },
    SET_SPRINT_FACTSTARTDATE: {
      message: 'добавил(-а) фактическое начало спринта {sprint} \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added factic start sprint time {sprint} \'{value}\''
    },
    CHANGE_SPRINT_FACTSTARTDATE: {
      message: 'изменил(-а) фактическое начало спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'changed factic sprint start time {sprint} from \'{prevValue}\' to \'{value}\''
    },
    SET_SPRINT_FACTFINISHDATE: {
      message: 'добавил(-а) фактическое завершение спринта {sprint} \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added factic sprint end time {sprint} \'{value}\''
    },
    CHANGE_SPRINT_FACTFINISHDATE: {
      message: 'изменил(-а) фактическое завершение спринта {sprint} c \'{prevValue}\' на \'{value}\'',
      entities: ['sprint'],
      messageEn: 'changed factic sprint end time from \'{prevValue}\' to \'{value}\''
    },
    CREATE_SPRINT_BUDGET: {
      message: 'добавил(а) бюджет спринта {sprint} без рискового резерва \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added budget of sprint without risk reserve \'{value}\''
    },
    CREATE_SPRINT_RISKBUDGET: {
      message: 'добавил(а) бюджет спринта {sprint} с рисковым резервом \'{value}\'',
      entities: ['sprint'],
      messageEn: 'added budget of sprint with risk reserve \'{value}\''
    },
    CREATE_PROJECTUSER: {
      message: 'добавил(-а) нового пользователя {user} в проект',
      entities: ['project_user.user'],
      messageEn: 'added new user {user} to project'
    },
    SET_PROJECTUSER_ROLESIDS: {
      message: 'добавил(-а) нового пользователя {user} в проект',
      entities: ['project_user.user'],
      messageEn: 'added new user {user} to project'
    },
    CHANGE_PROJECTUSER_ROLESIDS: {
      message: '{action}(-а) роль {role} для пользователя {user}',
      entities: ['project_user.user'],
      messageEn: '{action} role {role} for user {user}'
    },
    SET_PROJECTUSER_DELETED_AT: {
      message: 'удалил(-а) пользователя {user} из проекта',
      entities: ['project_user.user'],
      messageEn: 'removed user {user} from project'
    },
    CREATE_PROJECTATTACHMENT: {
      message: 'прикрепил(-а) файл',
      entities: [],
      messageEn: 'attached file'
    },
    SET_PROJECTATTACHMENT_DELETED_AT: {
      message: 'удалил(-а) файл',
      entities: [],
      messageEn: 'removed file'
    },
    CREATE_ITEMTAG: {
      message: 'добавил(-а) тег \'{tag}\'',
      messageEn: 'added tag \'{tag}\''
    },
    SET_ITEMTAG_DELETED_AT: {
      message: 'удалил(-а) тег \'{tag}\'',
      messageEn: 'removed tag \'{tag}\''
    },
    SET_PROJECT_PREFIX: {
      message: 'добавил(а) префикс проекта \'{value}\'',
      messageEn: 'added prefix project \'{value}\''
    },
    CHANGE_PROJECT_PREFIX: {
      message: 'изменил(а) префикс проекта c \'{prevValue}\' на \'{value}\'',
      messageEn: 'changed prefix of project from \'{prevValue}\' to \'{value}\''
    },
    SET_PROJECT_PORTFOLIOID: {
      message: 'добавил(а) проект в портфель {portfolio}',
      entities: ['portfolio'],
      messageEn: 'added project in portfolio {portfolio}'
    },
    CHANGE_PROJECT_PORTFOLIOID: {
      message: 'добавил(а) проект в портфель {portfolio}',
      entities: ['portfolio'],
      messageEn: 'added project in portfolio {portfolio}'
    },
    DELETE_PROJECT_PORTFOLIOID: {
      message: 'удалил(а) проект из портфеля {portfolio}',
      entities: ['portfolio'],
      messageEn: 'removed project from portfolio {portfolio}'
    }
  }
};
