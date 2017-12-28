const config = require('../../configs').email;

module.exports = function (templateName, input){

  let subject, body;
  const i = input;

  switch (templateName){
  case ('newTaskForQAPM'):
    // input.task

    subject = `Новая задача: ${i.task.project.name} - ${i.task.id}: ${i.task.name}`;

    body
        = `<h2>В проект ${i.task.project.name} добавлена новая задача:<br>
        ${i.task.id}: ${i.task.name}</h2>
        ${i.task.description ? `<h3><strong>Описание задачи:</strong><br>${i.task.description}</h3>` : '' }
        <p><strong>Тип задачи</strong> : ${i.task.type.name}</p>
        <p><strong>Приоритет задачи</strong> : ${i.task.prioritiesId}</p>
        <p><strong>Задачу добавил</strong> : ${i.task.author.fullNameRu}</p>
        ${i.task.performer ? `<p><strong>Исполнитель</strong> : ${i.task.performer.fullNameRu}</p>` : '' }
        ${i.task.plannedExecutionTime ? `<p><strong>Планируемое время выполнения</strong> : ${i.task.plannedExecutionTime}</p>` : ''}
        ${i.task.sprint ? `<p><strong>Спринт</strong> : ${i.task.sprint.name}</p>` : ''}
        <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" target="_blank">Перейти к задаче</a>`;

    break;

  case ('newTaskForPerformer'):
    subject = `Вам назначена новая задача: ${i.task.project.name} - ${i.task.id}: ${i.task.name}`;

    body
        = `<h2>Вам назначена новая задача:<br>
        ${i.task.id}: ${i.task.name}</h2>
        ${i.task.description ? `<h3><strong>Описание задачи:</strong><br>${i.task.description}</h3>` : '' }
        <p><strong>Тип задачи</strong> : ${i.task.type.name}</p>
        <p><strong>Приоритет задачи</strong> : ${i.task.prioritiesId}</p>
        ${i.task.plannedExecutionTime ? `<p><strong>Планируемое время выполнения</strong> : ${i.task.plannedExecutionTime}</p>` : ''}
        <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" target="_blank">Перейти к задаче</a>`;

    break;

  case ('newTaskComment'):
    subject = `Новый комментарий к задаче ${i.task.project.name} - ${i.task.id}: ${i.task.name}`;

    body
        = `<h2>${i.comment.author.fullNameRu} оставил(-а) комментарий к задаче<br>
        ${i.task.id}: ${i.task.name}</h2>
        <p>${i.comment.text}</p>
        <a href="${config.templateBaseUrl}/projects/${i.task.project.id}/tasks/${i.task.id}" target="_blank">Перейти к задаче</a>`;

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
