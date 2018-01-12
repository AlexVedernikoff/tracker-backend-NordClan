const config = require('../../configs').email;

module.exports = function (templateName, input){

  let subject, body;
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
                + (i.task.performer ? '<br><span style="font-weight: bold; font-style: italic;">Исполнитель:</span>' + i.task.performer.fullNameRu : '')
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
    subject = `Вам назначена новая задача: ${i.task.project.name} - ${i.task.id}: ${i.task.name}`;

    body = `<h2>Вам назначена новая задача:<br>
      ${i.task.id}: ${i.task.name}</h2>
      ${i.task.description ? `<h3><strong>Описание задачи:</strong><br>${i.task.description}</h3>` : '' }
      <p><strong>Тип задачи</strong> : ${i.task.type.name}</p>
      <p><strong>Приоритет задачи</strong> : ${i.task.prioritiesId}</p>
      ${i.task.plannedExecutionTime ? `<p><strong>Планируемое время выполнения</strong> : ${i.task.plannedExecutionTime}</p>` : ''}
      <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" target="_blank">Перейти к задаче</a>`;

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
                    ${i.task.project.name + ' '}
                  </a>
                  оставлен новый комментарий к задаче:
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
            <tr><td style="padding: 10px;"></td></tr>
            <tr>
              <td style="font-weight: normal;line-height: 19px;">
                <span style="font-weight: bold; font-style: italic;">${i.comment.author.fullNameRu}:</span>
                <br>
                ${i.comment.text}
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

  case ('taskStatusChange'):
    subject = `Изменение статуса задачи: ${i.task.project.name} - ${i.task.id}: ${i.task.name}`;

    body
        = `<h2>Задача ${i.task.id}: ${i.task.name} переведена в статус<br>
        ${i.task.taskStatus.name}</h2>
        <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" target="_blank">Перейти к задаче</a>`;

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
