module.exports = {
  actions: {
    SET: 'SET',
    DELETE: 'DELETE',
    CHANGE: 'CHANGE',
    CREATE: 'CREATE'
  },
  resources: {
    CHANGE_PROJECT_NAME: 'изменил(-а) название проекта c \'{prevValue}\' на \'{value}\'',
    CHANGE_PROJECT_DESCRIPTION: 'изменил(-а) описание проекта c \'{prevValue}\' на \'{value}\'',
    CHANGE_PROJECT_STATUSID: 'изменил(-а) статус проекта c \'{prevValue}\' на \'{value}\'',
    CHANGE_PROJECT_BUDGET: 'изменил(-а) бюджет проекта c рисковым резервом c \'{prevValue}\' на \'{value}\'',
    CHANGE_PROJECT_RISKBUDGET: 'изменил(-а) бюджет проекта без рискового резерва c \'{prevValue}\' на \'{value}\''
  }
};
