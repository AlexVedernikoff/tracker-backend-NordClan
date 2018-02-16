const config = require('../../configs').email;

module.exports = function (templateName, input){

  let subject, body, lastComment;
  const i = input;

  switch (templateName){
  case ('newTaskForQAPM'):
    // input.task

    subject = `${i.task.project.name}. Новая задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0;table-layout: fixed;width: 600px;color: #2d4154;font-size: 14px;">
            <tr>
              <td>
                <span style="font-size: 13px;">
                  В проект
                  <a href="${config.templateBaseUrl}/projects/${i.task.project.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 19px;" target="_blank">
                    ${i.task.project.name + ' '}
                  </a>
                  добавлена новая задача:
                </span>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 25px;" target="_blank">
                  ${i.task.project.prefix}-${i.task.id} | ${i.task.name}
                </a>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>`
            + (i.task.description ? '<tr><td><span style="font-weight: normal;line-height: 19px;">' + i.task.description + '</span></td></tr>' : '')
            + `<tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">Приоритет задачи:</span>
                ${ getTaskPriorityName(i.task.prioritiesId) }
                <br>
                <span style="font-weight: bold; font-style: italic;">Автор задачи:</span>
                ${i.task.author.fullNameRu}`
                + (i.task.performer ? '<br><span style="font-weight: bold; font-style: italic;">Исполнитель:</span> ' + i.task.performer.fullNameRu : '')
              + `</td>
            </tr>
            <tr><td style="padding: 10px; border-bottom:1px solid #DDDDDD;"></td></tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px; color: #999999; font-size: 12px;">
                <span style="font-weight: bold; font-style: italic;">SimbirSoft</span>
                <br>
                Это письмо отправлено из
                <a href="${config.templateBaseUrl}" style="color: #999999;" target="_blank">
                  SimTrack
                </a>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    break;

  case ('newTaskForPerformer'):

    switch (i.task.statusId){
    case (1): //new
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

    body = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0;table-layout: fixed;width: 600px;color: #2d4154;font-size: 14px;">
            <tr>
              <td>
                <span style="font-size: 13px;">
                  В проекте 
                  <a href="${config.templateBaseUrl}/projects/${i.task.project.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 19px;" target="_blank">
                  ${i.task.project.name}</a> `;

    switch (i.task.statusId){
    case (1): //new
    case (2): //develop play
    case (3): //develop stop
      body += 'на вас назначена задача';
      break;
    case (4): //code review play
    case (5): //code review stop
    case (6): //qa play
    case (7): //qa stop
      body += 'на проверку назначена задача';
      break;
    default:
      break;
    }

    body += `</span>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 25px;" target="_blank">
                  ${i.task.project.prefix}-${i.task.id} | ${i.task.name}
                </a>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>`
            + (i.task.description ? '<tr><td><span style="font-weight: normal;line-height: 19px;">' + i.task.description + '</span></td></tr>' : '')
            + `<tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">Приоритет задачи:</span>
                ${ getTaskPriorityName(i.task.prioritiesId) }
                <br>
                <span style="font-weight: bold; font-style: italic;">Автор задачи:</span>
                ${i.task.author.fullNameRu}`;

    // TODO
    /*switch(i.task.statusId){
    case(1): //new
    case(3): //develop stop
      break;
    case(5): //code review stop
    case(7): //qa stop
      body += '<br><span style="font-weight: bold; font-style: italic;">Исполнитель:</span>' + getTaskPrevPerformer(i.task);
      break;
    default:
      break;
    }*/

    body += `</td>
            </tr>`;

    if (i.task.comments && i.task.comments.length > 0) {
      lastComment = getTaskLastComment(i.task);
      body += `<tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">${lastComment.author.fullNameRu}:</span>
                <br>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${lastComment.id}" style="font-weight: bold; font-style: italic; color: #2d4154;" target="_blank">
                  ${lastComment.text}
                </a>
              </td>
            </tr>`;
    }

    body += `<tr><td style="padding: 10px; border-bottom:1px solid #DDDDDD;"></td></tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px; color: #999999; font-size: 12px;">
                <span style="font-weight: bold; font-style: italic;">SimbirSoft</span>
                <br>
                Это письмо отправлено из
                <a href="${config.templateBaseUrl}" style="color: #999999;" target="_blank">
                  SimTrack
                </a>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    break;

  case ('newTaskComment'):
    subject = `${i.task.project.name}. Новый комментарий к задаче ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0;table-layout: fixed;width: 600px;color: #2d4154;font-size: 14px;">
            <tr>
              <td>
                <span style="font-size: 13px;">
                  В проекте 
                  <a href="${config.templateBaseUrl}/projects/${i.task.project.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 19px;" target="_blank">
                  ${i.task.project.name}</a> оставлен новый комментарий к задаче:</span>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 25px;" target="_blank">
                  ${i.task.project.prefix}-${i.task.id} | ${i.task.name}
                </a>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">${i.comment.author.fullNameRu}:</span>
                <br>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${i.comment.id}" style="font-weight: bold; font-style: italic; color: #2d4154;" target="_blank">
                  ${i.comment.text}
                </a>
              </td>
            </tr>
            <tr><td style="padding: 10px; border-bottom:1px solid #DDDDDD;"></td></tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px; color: #999999; font-size: 12px;">
                <span style="font-weight: bold; font-style: italic;">SimbirSoft</span>
                <br>
                Это письмо отправлено из
                <a href="${config.templateBaseUrl}" style="color: #999999;" target="_blank">
                  SimTrack
                </a>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

    break;

  case ('taskCompleted'):
    subject = `${i.task.project.name}. Готова задача ${i.task.project.prefix}-${i.task.id} | ${i.task.name}`;

    body = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head>
        <body>
          <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0;table-layout: fixed;width: 600px;color: #2d4154;font-size: 14px;">
            <tr>
              <td>
                <span style="font-size: 13px;">
                  В проекте 
                  <a href="${config.templateBaseUrl}/projects/${i.task.project.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 19px;" target="_blank">
                  ${i.task.project.name}</a> готова задача:
                </span>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" style="font-weight: bold; font-style: italic; color: #2d4154; line-height: 25px;" target="_blank">
                  ${i.task.project.prefix}-${i.task.id} | ${i.task.name}
                </a>
              </td>
            </tr>
            <tr><td style="padding: 10px;"></td></tr>`
            + (i.task.description ? '<tr><td><span style="font-weight: normal;line-height: 19px;">' + i.task.description + '</span></td></tr>' : '')
            + `<tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">Приоритет задачи:</span>
                ${ getTaskPriorityName(i.task.prioritiesId) }
                <br>
                <span style="font-weight: bold; font-style: italic;">Автор задачи:</span>
                ${i.task.author.fullNameRu}
              </td>
            </tr>`;

    if (i.task.comments && i.task.comments.length > 0) {
      lastComment = getTaskLastComment(i.task);
      body += `<tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">${lastComment.author.fullNameRu}:</span>
                <br>
                <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}#comment-${lastComment.id}" style="font-weight: bold; font-style: italic; color: #2d4154;" target="_blank">
                  ${lastComment.text}
                </a>
              </td>
            </tr>`;
    }

    body += `<tr><td style="padding: 10px; border-bottom:1px solid #DDDDDD;"></td></tr>
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px; color: #999999; font-size: 12px;">
                <span style="font-weight: bold; font-style: italic;">SimbirSoft</span>
                <br>
                Это письмо отправлено из
                <a href="${config.templateBaseUrl}" style="color: #999999;" target="_blank">
                  SimTrack
                </a>
              </td>
            </tr>
          </table>
        </body>
      </html>`;

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
  return task.comments[task.comments.length - 1];
}

// TODO
/*function getTaskPrevPerformer(task){

}*/
