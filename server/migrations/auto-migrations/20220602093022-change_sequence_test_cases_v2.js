

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
        create sequence test_case_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id set default nextval('test_case_seq');
        alter sequence test_case_seq owned by test_case.id;
        
        create sequence test_case_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_attachments alter column id set default nextval('test_case_attachments_seq');
        alter sequence test_case_attachments_seq owned by test_case_attachments.id;
        
        create sequence test_case_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_execution alter column id set default nextval('test_case_execution_seq');
        alter sequence test_case_execution_seq owned by test_case_execution.id;
        
        create sequence test_case_execution_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_execution_attachments alter column id set default nextval('test_case_execution_attachments_seq');
        alter sequence test_case_execution_attachments_seq owned by test_case_execution_attachments.id;
        
        create sequence test_case_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_histories alter column id set default nextval('test_case_histories_seq');
        alter sequence test_case_histories_seq owned by test_case_histories.id;
        
        create sequence test_case_severity_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_severity alter column id set default nextval('test_case_severity');
        alter sequence test_case_severity_seq owned by test_case_severity.id;
        
        create sequence test_case_statuses_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_statuses alter column id set default nextval('test_case_statuses');
        alter sequence test_case_statuses_seq owned by test_case_statuses.id;
        
        create sequence test_case_step_execution_status_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_step_execution_status alter column id set default nextval('test_case_step_execution_status');
        alter sequence test_case_step_execution_status_seq owned by test_case_step_execution_status.id;
        
        create sequence test_case_steps_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case_steps alter column id set default nextval('test_case_steps');
        alter sequence test_case_steps_seq owned by test_case_steps.id;
        
        create sequence test_run_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_run alter column id set default nextval('test_run');
        alter sequence test_run_seq owned by test_run.id;
        
        create sequence test_run_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_run_execution alter column id set default nextval('test_run_execution');
        alter sequence test_run_execution_seq owned by test_run_execution.id;
        
        create sequence test_run_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_run_histories alter column id set default nextval('test_run_histories');
        alter sequence test_run_histories_seq owned by test_run_histories.id;
        
        create sequence test_run_test_cases_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_run_test_cases alter column id set default nextval('test_run_test_cases');
        alter sequence test_run_test_cases_seq owned by test_run_test_cases.id;
        
        create sequence test_step_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_step_execution alter column id set default nextval('test_step_execution');
        alter sequence test_step_execution_seq owned by test_step_execution.id;
        
        create sequence test_step_execution_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_step_execution_attachments alter column id set default nextval('test_step_execution_attachments');
        alter sequence test_step_execution_attachments_seq owned by test_step_execution_attachments.id;
        
        create sequence test_suite_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_suite alter column id set default nextval('test_suite');
        alter sequence test_suite_seq owned by test_suite.id;
        
        create sequence test_suite_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_suite_histories alter column id set default nextval('test_suite_histories');
        alter sequence test_suite_histories_seq owned by test_suite_histories.id;
    `);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`
        create sequence test_case_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
            
        alter table test_case alter column id drop default;
        drop sequence test_case_seq;
        
        create sequence test_case_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
            
        alter table test_case alter column id drop default;
        drop sequence test_case_attachments_seq;
        
        create sequence test_case_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
            
        alter table test_case alter column id drop default;
        drop sequence test_case_execution_seq;
        
        create sequence test_case_execution_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
            
        alter table test_case alter column id drop default;
        drop sequence test_case_execution_attachments_seq;
        
        create sequence test_case_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
            
        alter table test_case alter column id drop default;
        drop sequence test_case_histories_seq;
        
        create sequence test_case_severity_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_case_severity;
        
        create sequence test_case_statuses_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_case_statuses;
        
        create sequence test_case_step_execution_status_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
       
        alter table test_case alter column id drop default;
        drop sequence test_case_step_execution_status;
        
        create sequence test_case_steps_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_case_steps;
        
        create sequence test_run_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_run;
        
        create sequence test_run_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_run_execution;
        
        create sequence test_run_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_run_histories;
        
        create sequence test_run_test_cases_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_run_test_cases;
        
        create sequence test_step_execution_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_step_execution;
        
        create sequence test_step_execution_attachments_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_step_execution_attachments;
        
        create sequence test_suite_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_suite;
        
        create sequence test_suite_histories_seq
            start with 1000
            increment by 1
            no minvalue
            no maxvalue
            cache 1;
        
        alter table test_case alter column id drop default;
        drop sequence test_suite_histories;
    `);
  },
};
