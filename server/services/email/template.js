const config = require('../../configs').email;

module.exports = function (templateName, input){

  let subject, body, lastComment, appointment;
  const i = input;

  const createBlock = content => {
    return `
      <tr>
        <td style="
          padding: 16px;
          padding-top: 0
        ">
          ${content}
        </td>
      </tr>
    `;
  };

  const createLink = (content, path) => {
    return `
      <a href="${path}" target="_blank" style="
        font-weight: bold;
        color: #2d4154;
      ">
        ${content}
      </a>
    `;
  };

  const mailHeader = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
        </head>
        <body style="padding: 8px">
          <table border="0" cellpadding="0" cellspacing="0" style="
            margin:0;
            padding:0;
            table-layout: fixed;
            max-width: 600px;
            width: 100%;
            font-family: sans-serif;
            font-weight: normal;
            font-size: 14px;
            line-height: 19px;
            color: #333;
            border: 1px solid #DDDDDD;
          ">
            <tr>
              <td style="
                padding: 16px;
                background-color: #2b3e50;
                color: white;
                font-size: 18px;
              ">
                <span style="color: #ff7800">Sim</span>Track
              </td>
            </tr>
            <tr><td style="padding-top: 24px"></td></tr>
  `;

  const mailFooter = `
            <tr><td style="padding-top: 8px"></td></tr>
            <tr><td style="border-bottom:1px solid #DDDDDD;"></td></tr>
            <tr>
              <td style="
                text-align: left;
                font-weight: normal;
                line-height: 16px;
                color: #999999;
                font-size: 12px;
                padding: 16px;
                background-color: ghostwhite
              ">
                <span style="font-weight: bold;">
                  SimbirSoft
                </span>
                <br>
                Это письмо отправлено из <a href="${config.templateBaseUrl}" style="color: #999999;" target="_blank">SimTrack</a>
              </td>
            </tr>
          </table>
        </body>
      </html>
  `;

  switch (templateName){
  case ('newTaskForQAPM'):
    // input.task

    subject = `${i.task.project.name}. Новая задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `${mailHeader}

      ${createBlock(`
        В проект
        ${createLink(
          i.task.project.name,
          `${config.templateBaseUrl}/projects/${i.task.project.id}`
        )}
        добавлена новая задача:
      `)}

      ${createBlock(
          createLink(
          `${i.task.project.prefix}-${i.task.id} | ${i.task.name}`,
          `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}`
        )
      )}

      ${
        i.task.description
        ? createBlock(i.task.description)
        : ''
      }
      
      ${
        createBlock(`
          <span style="font-weight: bold;">Приоритет:</span> ${ getTaskPriorityName(i.task.prioritiesId) }
          <br>
          <span style="font-weight: bold;">Автор:</span> ${i.task.author.fullNameRu}
          ${
            i.task.performer
            ? `<br><span style="font-weight: bold;">Исполнитель:</span> ${i.task.performer.fullNameRu}`
            : ''
          }
        `)
      }

    ${mailFooter}`;

    break;

  case ('newTaskForPerformer'):

    switch (i.task.statusId){
    case (1): //new
    case (8): //new
      subject = `${i.task.project.name}. Вам назначена задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;
      break;
    case (2): //develop play
    case (3): //develop stop
      subject = `${i.task.project.name}. Вам в разработку поставлена задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;
      // TODO вам в разработку в Х раз поставлена задача
      break;
    case (4): //code review play
    case (5): //code review stop
      subject = `${i.task.project.name}. Вам на кодревью поставлена задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;
      break;
    case (6): //qa play
    case (7): //qa stop
      subject = `${i.task.project.name}. Вам на проверку поставлена задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;
      break;
    default:
      break;
    }

    switch (i.task.statusId){
    case (1): //new
    case (2): //develop play
    case (3): //develop stop
      appointment = 'на вас назначена задача';
      break;
    case (4): //code review play
    case (5): //code review stop
    case (6): //qa play
    case (7): //qa stop
      appointment = 'на проверку назначена задача';
      break;
    default:
      break;
    }

    body = `
      ${mailHeader}

      ${createBlock(`
        В проекте 
        ${createLink(i.task.project.name, `${config.templateBaseUrl}/projects/${i.task.project.id}`)}
        ${appointment}:
      `)}

      ${createBlock(
        createLink(
          `${i.task.project.prefix}-${i.task.id} | ${i.task.name}`,
          `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}`
        )
      )}

      ${
        i.task.description
        ? createBlock(i.task.description)
        : ''
      }

      ${createBlock(`
          <span style="font-weight: bold">Приоритет задачи:</span>
          ${ getTaskPriorityName(i.task.prioritiesId) }
          <br>
          <span style="font-weight: bold">Автор задачи:</span>
          ${i.task.author.fullNameRu}
      `)}

      ${
        i.task.comments && i.task.comments.length > 0
        ? createBlock(`
            <span style="font-weight: bold;">${getTaskLastComment(i.task).author.fullNameRu}:</span>
            <br>
            ${createLink(
              getTaskLastComment(i.task).text,
              `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${getTaskLastComment(i.task).id}`
            )}
          `)
        : ''
      }

      ${mailFooter}
    `;

    break;

  case ('newTaskComment'):
    subject = `${i.task.project.name}. Новый комментарий к задаче ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `
      ${mailHeader}

      ${createBlock(`
        В проекте 
        ${createLink(i.task.project.name, `${config.templateBaseUrl}/projects/${i.task.project.id}`)}
        оставлен новый комментарий к задаче:
      `)}

      ${createBlock(
        createLink(`${i.task.project.prefix}-${i.task.id} | ${i.task.name}`, `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}`)
      )}

      ${createBlock(`
        <span style="font-weight: bold">${i.comment.author.fullNameRu}:</span>
        <br>
        ${createLink(i.comment.text, `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${i.comment.id}`)}
      `)}

      ${mailFooter}
    `;

    break;

  case ('taskCompleted'):
    subject = `${i.task.project.name}. Готова задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `
      ${mailHeader}
      ${createBlock(`
        В проекте 
        ${createLink(i.task.project.name, `${config.templateBaseUrl}/projects/${i.task.project.id}`)}
        готова задача:
      `)}
      ${createBlock(
        createLink(`${i.task.project.prefix}-${i.task.id} | ${i.task.name}`, `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}`)
      )}
      ${
        i.task.description
        ? createBlock(i.task.description)
        : ''
      }
      ${createBlock(`
        <span style="font-weight: bold">Приоритет задачи:</span>
        ${ getTaskPriorityName(i.task.prioritiesId) }
        <br>
        <span style="font-weight: bold">Автор задачи:</span>
        ${i.task.author.fullNameRu}
      `)}

      ${
        i.task.comments && i.task.comments.length > 0
        ? createBlock(`
            <span style="font-weight: bold;">${getTaskLastComment(i.task).author.fullNameRu}:</span>
            <br>
            ${createLink(
              getTaskLastComment(i.task).text,
              `${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${getTaskLastComment(i.task).id}`
            )}
          `)
        : ''
      }
      ${mailFooter}
    `;

    break;

  case ('activateExternalUser'):
    subject = 'Активация аккаунта в SimTrack';

    body = `
      ${mailHeader}
      ${createBlock(`
        ${createLink('Активировать аккаунт', `${config.templateBaseUrl}/externalUserActivate/${i.token}`)}
      `)}
      ${mailFooter}
    `;

    break;

  case ('newTaskCommentMention'):
    break;

  default:
    throw new Error('template not found');
  }

  return {
    subject,
    body
  };

};


function getTaskPriorityName (num){
  switch (num){
  case (1):
    return 'Highest';
  case (2):
    return 'High';
  case (3):
    return 'Average';
  case (4):
    return 'Low';
  case (5):
    return 'Lowest';
  default:
    return;
  }
}

function getTaskLastComment (task){
  return task.comments[0];
}

// TODO
/*function getTaskPrevPerformer(task){

}*/
