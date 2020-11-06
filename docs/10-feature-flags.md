# Feature Flags

### Мотивация
Этот функционал был добавлен для оперативного отключения интеграции с сервисами (Gitlab или Jira), без вмешательства в кодовую базу. Включение/отключение происходит обычным POST-запросом.

### Доступные флаги

| Описание                         | `path`                                  |
|----------------------------------|-----------------------------------------|
| Добавление пользователя в проект | `project.userCreate.processGitlabRoles` |

### Endpoints

Получить дерево флагов: 
```sh
curl --location --request GET 'http://localhost:8000/api/v1/core/featureFlags/'
```

Изменить значение флага:
```sh
curl --location --request POST 'http://localhost:8000/api/v1/core/featureFlags' \
--header 'Content-Type: application/json' \
--data-raw '{
    "path": "project.userCreate.processGitlabRoles",
    "value": false
}'
```
