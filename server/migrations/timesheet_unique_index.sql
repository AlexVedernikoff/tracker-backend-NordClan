CREATE UNIQUE INDEX UNIQ_TIMESHEET on timesheets (user_id, on_date, type_id, COALESCE(task_id, -1), COALESCE(project_id,-1), COALESCE(task_status_id, -1) );
CREATE UNIQUE INDEX UNIQ_TIMESHEET_DRAFT on timesheets_draft (user_id, on_date, type_id, COALESCE(task_id, -1), COALESCE(project_id,-1), COALESCE(task_status_id, -1) );
