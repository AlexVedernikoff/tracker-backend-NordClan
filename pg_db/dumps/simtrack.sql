--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.15
-- Dumped by pg_dump version 9.6.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: global_role_type; Type: TYPE; Schema: public; Owner: track
--

CREATE TYPE public.global_role_type AS ENUM (
    'ADMIN',
    'VISOR',
    'USER',
    'EXTERNAL_SERVICE',
    'EXTERNAL_USER',
    'DEV_OPS'
);


ALTER TYPE public.global_role_type OWNER TO track;

--
-- Name: goal_status; Type: TYPE; Schema: public; Owner: track
--

CREATE TYPE public.goal_status AS ENUM (
    'not_done',
    'done'
);


ALTER TYPE public.goal_status OWNER TO track;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Milestones; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public."Milestones" (
    id integer NOT NULL,
    name character varying(255),
    date date,
    done boolean,
    "projectId" integer,
    "typeId" integer,
    "updatedAt" timestamp with time zone,
    "deletedAt" timestamp with time zone,
    "createdAt" timestamp with time zone
);


ALTER TABLE public."Milestones" OWNER TO track;

--
-- Name: Milestones_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public."Milestones_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Milestones_id_seq" OWNER TO track;

--
-- Name: Milestones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public."Milestones_id_seq" OWNED BY public."Milestones".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO track;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    task_id integer NOT NULL,
    parent_id integer,
    author_id integer NOT NULL,
    text text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    attachment_ids text
);


ALTER TABLE public.comments OWNER TO track;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comments_id_seq OWNER TO track;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    ps_id text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.departments OWNER TO track;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.departments_id_seq OWNER TO track;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: gitlab_user_roles; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.gitlab_user_roles (
    id integer NOT NULL,
    access_level integer,
    expires_at timestamp with time zone,
    project_user_id integer,
    gitlab_project_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.gitlab_user_roles OWNER TO track;

--
-- Name: gitlab_user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.gitlab_user_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gitlab_user_roles_id_seq OWNER TO track;

--
-- Name: gitlab_user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.gitlab_user_roles_id_seq OWNED BY public.gitlab_user_roles.id;


--
-- Name: goal_sprints; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.goal_sprints (
    goal_id integer NOT NULL,
    sprint_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.goal_sprints OWNER TO track;

--
-- Name: goal_tasks; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.goal_tasks (
    goal_id integer NOT NULL,
    task_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.goal_tasks OWNER TO track;

--
-- Name: goals; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    visible text DEFAULT 'true'::text NOT NULL,
    planned_execution_time numeric(10,2) NOT NULL,
    status public.goal_status DEFAULT 'not_done'::public.goal_status NOT NULL,
    active_sprint_id integer,
    moved_to_sprint_id integer,
    parent_id integer,
    project_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.goals OWNER TO track;

--
-- Name: item_tags; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.item_tags (
    id integer NOT NULL,
    tag_id integer,
    taggable character varying(255),
    taggable_id integer,
    deleted_at timestamp without time zone
);


ALTER TABLE public.item_tags OWNER TO track;

--
-- Name: item_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.item_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_tags_id_seq OWNER TO track;

--
-- Name: item_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.item_tags_id_seq OWNED BY public.item_tags.id;


--
-- Name: jira_sync_status; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.jira_sync_status (
    id integer NOT NULL,
    simtrack_project_id integer NOT NULL,
    jira_project_id integer,
    date timestamp with time zone NOT NULL,
    status character varying(255) NOT NULL
);


ALTER TABLE public.jira_sync_status OWNER TO track;

--
-- Name: jira_sync_status_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.jira_sync_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jira_sync_status_id_seq OWNER TO track;

--
-- Name: jira_sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.jira_sync_status_id_seq OWNED BY public.jira_sync_status.id;


--
-- Name: metric_types; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.metric_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    calc_every_sprint boolean DEFAULT true NOT NULL
);


ALTER TABLE public.metric_types OWNER TO track;

--
-- Name: metrics; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.metrics (
    id integer NOT NULL,
    type_id integer,
    value text,
    created_at timestamp with time zone,
    project_id integer,
    sprint_id integer,
    user_id integer
);


ALTER TABLE public.metrics OWNER TO track;

--
-- Name: metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.metrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.metrics_id_seq OWNER TO track;

--
-- Name: metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.metrics_id_seq OWNED BY public.metrics.id;


--
-- Name: milestone_types_dictionary; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.milestone_types_dictionary (
    id integer NOT NULL,
    name character varying(25),
    code_name character varying(25),
    name_en character varying(255)
);


ALTER TABLE public.milestone_types_dictionary OWNER TO track;

--
-- Name: milestone_types_dictionary_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.milestone_types_dictionary_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.milestone_types_dictionary_id_seq OWNER TO track;

--
-- Name: milestone_types_dictionary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.milestone_types_dictionary_id_seq OWNED BY public.milestone_types_dictionary.id;


--
-- Name: task_histories; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_histories (
    id integer NOT NULL,
    entity character varying(255) NOT NULL,
    entity_id integer NOT NULL,
    task_id integer,
    field character varying(255),
    prev_value_str character varying(255),
    value_str character varying(255),
    prev_value_int integer,
    value_int integer,
    prev_value_date timestamp with time zone,
    value_date timestamp with time zone,
    value_float double precision,
    prev_value_float double precision,
    action character varying(6) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_id integer,
    value_text text,
    prev_value_text text,
    value_boolean boolean,
    prev_value_boolean boolean,
    value_decimal numeric,
    prev_value_decimal numeric
);


ALTER TABLE public.task_histories OWNER TO track;

--
-- Name: model_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.model_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.model_histories_id_seq OWNER TO track;

--
-- Name: model_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.model_histories_id_seq OWNED BY public.task_histories.id;


--
-- Name: portfolios; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.portfolios (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.portfolios OWNER TO track;

--
-- Name: portfolios_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.portfolios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.portfolios_id_seq OWNER TO track;

--
-- Name: portfolios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.portfolios_id_seq OWNED BY public.portfolios.id;


--
-- Name: project_attachments; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_attachments (
    id integer NOT NULL,
    project_id integer,
    file_name character varying(255) NOT NULL,
    path character varying(255) NOT NULL,
    "previewPath" character varying(255),
    author_id integer NOT NULL,
    size integer NOT NULL,
    type character varying(80) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.project_attachments OWNER TO track;

--
-- Name: project_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_attachments_id_seq OWNER TO track;

--
-- Name: project_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_attachments_id_seq OWNED BY public.project_attachments.id;


--
-- Name: project_events; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_events (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.project_events OWNER TO track;

--
-- Name: project_histories; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_histories (
    id integer NOT NULL,
    entity character varying(255) NOT NULL,
    entity_id integer NOT NULL,
    project_id integer,
    field character varying(255),
    prev_value_str character varying(255),
    value_str character varying(255),
    prev_value_int integer,
    value_int integer,
    prev_value_date timestamp with time zone,
    value_date timestamp with time zone,
    prev_value_float double precision,
    value_float double precision,
    prev_value_text text,
    value_text text,
    action character varying(6) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_id integer
);


ALTER TABLE public.project_histories OWNER TO track;

--
-- Name: project_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_histories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_histories_id_seq OWNER TO track;

--
-- Name: project_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_histories_id_seq OWNED BY public.project_histories.id;


--
-- Name: project_roles; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_roles (
    id integer NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(30) NOT NULL,
    name_en character varying(255)
);


ALTER TABLE public.project_roles OWNER TO track;

--
-- Name: project_statuses; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_statuses (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    name_en character varying(255)
);


ALTER TABLE public.project_statuses OWNER TO track;

--
-- Name: project_types; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_types (
    id integer NOT NULL,
    name character varying(255),
    code_name character varying(255),
    name_en character varying(255)
);


ALTER TABLE public.project_types OWNER TO track;

--
-- Name: project_types_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_types_id_seq OWNER TO track;

--
-- Name: project_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_types_id_seq OWNED BY public.project_types.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_users (
    id integer NOT NULL,
    project_id integer,
    user_id integer,
    author_id integer NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.project_users OWNER TO track;

--
-- Name: project_users_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_users_id_seq OWNER TO track;

--
-- Name: project_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_users_id_seq OWNED BY public.project_users.id;


--
-- Name: project_users_roles; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_users_roles (
    id integer NOT NULL,
    project_user_id integer NOT NULL,
    project_role_id integer NOT NULL
);


ALTER TABLE public.project_users_roles OWNER TO track;

--
-- Name: project_users_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_users_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_users_roles_id_seq OWNER TO track;

--
-- Name: project_users_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_users_roles_id_seq OWNED BY public.project_users_roles.id;


--
-- Name: project_users_subscriptions; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.project_users_subscriptions (
    id integer NOT NULL,
    project_user_id integer NOT NULL,
    project_event_id integer NOT NULL
);


ALTER TABLE public.project_users_subscriptions OWNER TO track;

--
-- Name: project_users_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.project_users_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_users_subscriptions_id_seq OWNER TO track;

--
-- Name: project_users_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.project_users_subscriptions_id_seq OWNED BY public.project_users_subscriptions.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    prefix character varying(8),
    status_id integer DEFAULT 1,
    notbillable integer DEFAULT 1,
    budget double precision,
    risk_budget double precision,
    attaches integer[],
    portfolio_id integer,
    author_id integer,
    finished_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    completed_at timestamp without time zone,
    created_by_system_user boolean DEFAULT false NOT NULL,
    gitlab_project_ids integer[],
    type_id integer,
    qa_percent integer,
    jira_hostname character varying(255),
    external_id character varying(255),
    jira_project_name character varying(255),
    jira_token character varying(255)
);


ALTER TABLE public.projects OWNER TO track;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO track;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: sprint_statuses; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.sprint_statuses (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    name_en character varying(255)
);


ALTER TABLE public.sprint_statuses OWNER TO track;

--
-- Name: sprint_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.sprint_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sprint_statuses_id_seq OWNER TO track;

--
-- Name: sprint_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.sprint_statuses_id_seq OWNED BY public.sprint_statuses.id;


--
-- Name: sprints; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.sprints (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    status_id integer DEFAULT 1,
    fact_start_date date,
    fact_finish_date date,
    allotted_time numeric(10,2),
    author_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    project_id integer,
    budget numeric(10,2) DEFAULT NULL::numeric,
    risk_budget numeric(10,2) DEFAULT NULL::numeric,
    qa_percent integer,
    external_id character varying(255),
    entities_last_update timestamp with time zone,
    metric_last_update timestamp with time zone
);


ALTER TABLE public.sprints OWNER TO track;

--
-- Name: sprints_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.sprints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sprints_id_seq OWNER TO track;

--
-- Name: sprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.sprints_id_seq OWNED BY public.sprints.id;


--
-- Name: system_tokens; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.system_tokens (
    id integer NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone
);


ALTER TABLE public.system_tokens OWNER TO track;

--
-- Name: system_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.system_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_tokens_id_seq OWNER TO track;

--
-- Name: system_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.system_tokens_id_seq OWNED BY public.system_tokens.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.tags OWNER TO track;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO track;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: task_attachments; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_attachments (
    id integer NOT NULL,
    task_id integer,
    file_name character varying(255) NOT NULL,
    path character varying(255) NOT NULL,
    "previewPath" character varying(255),
    author_id integer NOT NULL,
    size integer NOT NULL,
    type character varying(80) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.task_attachments OWNER TO track;

--
-- Name: task_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_attachments_id_seq OWNER TO track;

--
-- Name: task_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_attachments_id_seq OWNED BY public.task_attachments.id;


--
-- Name: task_statuses; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_statuses (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    name_en character varying(255)
);


ALTER TABLE public.task_statuses OWNER TO track;

--
-- Name: task_statuses_association; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_statuses_association (
    id integer NOT NULL,
    project_id integer,
    external_status_id integer,
    internal_status_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.task_statuses_association OWNER TO track;

--
-- Name: task_statuses_association_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_statuses_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_statuses_association_id_seq OWNER TO track;

--
-- Name: task_statuses_association_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_statuses_association_id_seq OWNED BY public.task_statuses_association.id;


--
-- Name: task_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_statuses_id_seq OWNER TO track;

--
-- Name: task_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_statuses_id_seq OWNED BY public.task_statuses.id;


--
-- Name: task_tasks; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_tasks (
    id integer NOT NULL,
    linked_task_id integer,
    task_id integer,
    deleted_at timestamp without time zone
);


ALTER TABLE public.task_tasks OWNER TO track;

--
-- Name: task_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_tasks_id_seq OWNER TO track;

--
-- Name: task_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_tasks_id_seq OWNED BY public.task_tasks.id;


--
-- Name: task_types; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_types (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    name_en character varying(255)
);


ALTER TABLE public.task_types OWNER TO track;

--
-- Name: task_types_association; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.task_types_association (
    id integer NOT NULL,
    project_id integer,
    external_task_type_id integer,
    internal_task_type_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.task_types_association OWNER TO track;

--
-- Name: task_types_association_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_types_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_types_association_id_seq OWNER TO track;

--
-- Name: task_types_association_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_types_association_id_seq OWNED BY public.task_types_association.id;


--
-- Name: task_types_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.task_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_types_id_seq OWNER TO track;

--
-- Name: task_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.task_types_id_seq OWNED BY public.task_types.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type_id integer DEFAULT 1 NOT NULL,
    status_id integer DEFAULT 1 NOT NULL,
    description text,
    planned_execution_time numeric(10,2),
    fact_execution_time numeric(10,2),
    attaches integer[],
    priorities_id integer DEFAULT 3,
    author_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    sprint_id integer,
    project_id integer NOT NULL,
    parent_id integer,
    performer_id integer,
    is_task_by_client boolean DEFAULT false NOT NULL,
    gitlab_branch_ids json,
    external_id character varying(255),
    is_dev_ops boolean
);


ALTER TABLE public.tasks OWNER TO track;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO track;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: timesheets; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.timesheets (
    id integer NOT NULL,
    sprint_id integer,
    task_id integer,
    user_id integer NOT NULL,
    on_date date NOT NULL,
    type_id integer NOT NULL,
    spent_time numeric(10,2) NOT NULL,
    comment text,
    is_billable boolean NOT NULL,
    user_role_id text,
    task_status_id integer,
    status_id integer,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    project_id integer,
    external_id character varying(255)
);


ALTER TABLE public.timesheets OWNER TO track;

--
-- Name: timesheets_draft; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.timesheets_draft (
    id integer NOT NULL,
    task_id integer,
    user_id integer NOT NULL,
    type_id integer NOT NULL,
    task_status_id integer,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    on_date date,
    project_id integer
);


ALTER TABLE public.timesheets_draft OWNER TO track;

--
-- Name: timesheets_draft_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.timesheets_draft_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.timesheets_draft_id_seq OWNER TO track;

--
-- Name: timesheets_draft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.timesheets_draft_id_seq OWNED BY public.timesheets_draft.id;


--
-- Name: timesheets_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.timesheets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.timesheets_id_seq OWNER TO track;

--
-- Name: timesheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.timesheets_id_seq OWNED BY public.timesheets.id;


--
-- Name: timesheets_statuses; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.timesheets_statuses (
    id integer NOT NULL,
    name character varying(15) NOT NULL,
    name_ru character varying(15) NOT NULL,
    is_blocked boolean NOT NULL
);


ALTER TABLE public.timesheets_statuses OWNER TO track;

--
-- Name: timesheets_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.timesheets_statuses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.timesheets_statuses_id_seq OWNER TO track;

--
-- Name: timesheets_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.timesheets_statuses_id_seq OWNED BY public.timesheets_statuses.id;


--
-- Name: timesheets_types; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.timesheets_types (
    id integer NOT NULL,
    name character varying(25),
    code_name character varying(25),
    is_magic_activity boolean,
    "order" integer,
    name_en character varying(255)
);


ALTER TABLE public.timesheets_types OWNER TO track;

--
-- Name: timesheets_types_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.timesheets_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.timesheets_types_id_seq OWNER TO track;

--
-- Name: timesheets_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.timesheets_types_id_seq OWNED BY public.timesheets_types.id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.tokens (
    id integer NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone,
    user_id integer
);


ALTER TABLE public.tokens OWNER TO track;

--
-- Name: tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tokens_id_seq OWNER TO track;

--
-- Name: tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.tokens_id_seq OWNED BY public.tokens.id;


--
-- Name: user_departments; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.user_departments (
    id integer NOT NULL,
    department_id integer,
    user_id integer
);


ALTER TABLE public.user_departments OWNER TO track;

--
-- Name: user_departments_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.user_departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_departments_id_seq OWNER TO track;

--
-- Name: user_departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.user_departments_id_seq OWNED BY public.user_departments.id;


--
-- Name: user_email_association; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.user_email_association (
    id integer NOT NULL,
    project_id integer,
    external_user_email character varying(255),
    internal_user_id integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_email_association OWNER TO track;

--
-- Name: user_email_association_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.user_email_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_email_association_id_seq OWNER TO track;

--
-- Name: user_email_association_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.user_email_association_id_seq OWNED BY public.user_email_association.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: track
--

CREATE TABLE public.users (
    id integer NOT NULL,
    ldap_login text NOT NULL,
    login character varying(255) NOT NULL,
    last_name_en character varying(255),
    first_name_en character varying(255),
    last_name_ru character varying(255),
    first_name_ru character varying(255),
    active integer,
    photo character varying(255),
    email_primary character varying(255),
    email_secondary character varying(255),
    phone character varying(255),
    mobile character varying(255),
    skype character varying(255),
    city character varying(255),
    birth_date date,
    create_date timestamp with time zone,
    delete_date timestamp with time zone,
    ps_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    full_name_ru character varying(200),
    full_name_en character varying(50),
    fullnameen character varying(50),
    global_role public.global_role_type DEFAULT 'USER'::public.global_role_type,
    password character varying(100),
    set_password_token character varying(100),
    set_password_expired timestamp with time zone,
    expired_date character varying(100),
    "isActive" integer,
    description text,
    is_test boolean DEFAULT false NOT NULL,
    gitlab_user_id integer,
    employment_date timestamp with time zone,
    dismissal_date timestamp with time zone
);


ALTER TABLE public.users OWNER TO track;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: track
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO track;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: track
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: Milestones id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public."Milestones" ALTER COLUMN id SET DEFAULT nextval('public."Milestones_id_seq"'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: gitlab_user_roles id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.gitlab_user_roles ALTER COLUMN id SET DEFAULT nextval('public.gitlab_user_roles_id_seq'::regclass);


--
-- Name: item_tags id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.item_tags ALTER COLUMN id SET DEFAULT nextval('public.item_tags_id_seq'::regclass);


--
-- Name: jira_sync_status id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.jira_sync_status ALTER COLUMN id SET DEFAULT nextval('public.jira_sync_status_id_seq'::regclass);


--
-- Name: metrics id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metrics ALTER COLUMN id SET DEFAULT nextval('public.metrics_id_seq'::regclass);


--
-- Name: milestone_types_dictionary id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.milestone_types_dictionary ALTER COLUMN id SET DEFAULT nextval('public.milestone_types_dictionary_id_seq'::regclass);


--
-- Name: portfolios id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.portfolios ALTER COLUMN id SET DEFAULT nextval('public.portfolios_id_seq'::regclass);


--
-- Name: project_attachments id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_attachments ALTER COLUMN id SET DEFAULT nextval('public.project_attachments_id_seq'::regclass);


--
-- Name: project_histories id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_histories ALTER COLUMN id SET DEFAULT nextval('public.project_histories_id_seq'::regclass);


--
-- Name: project_types id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_types ALTER COLUMN id SET DEFAULT nextval('public.project_types_id_seq'::regclass);


--
-- Name: project_users id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users ALTER COLUMN id SET DEFAULT nextval('public.project_users_id_seq'::regclass);


--
-- Name: project_users_roles id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_roles ALTER COLUMN id SET DEFAULT nextval('public.project_users_roles_id_seq'::regclass);


--
-- Name: project_users_subscriptions id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.project_users_subscriptions_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: sprint_statuses id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprint_statuses ALTER COLUMN id SET DEFAULT nextval('public.sprint_statuses_id_seq'::regclass);


--
-- Name: sprints id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprints ALTER COLUMN id SET DEFAULT nextval('public.sprints_id_seq'::regclass);


--
-- Name: system_tokens id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.system_tokens ALTER COLUMN id SET DEFAULT nextval('public.system_tokens_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: task_attachments id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_attachments ALTER COLUMN id SET DEFAULT nextval('public.task_attachments_id_seq'::regclass);


--
-- Name: task_histories id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_histories ALTER COLUMN id SET DEFAULT nextval('public.model_histories_id_seq'::regclass);


--
-- Name: task_statuses id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses ALTER COLUMN id SET DEFAULT nextval('public.task_statuses_id_seq'::regclass);


--
-- Name: task_statuses_association id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses_association ALTER COLUMN id SET DEFAULT nextval('public.task_statuses_association_id_seq'::regclass);


--
-- Name: task_tasks id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_tasks ALTER COLUMN id SET DEFAULT nextval('public.task_tasks_id_seq'::regclass);


--
-- Name: task_types id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types ALTER COLUMN id SET DEFAULT nextval('public.task_types_id_seq'::regclass);


--
-- Name: task_types_association id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types_association ALTER COLUMN id SET DEFAULT nextval('public.task_types_association_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: timesheets id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets ALTER COLUMN id SET DEFAULT nextval('public.timesheets_id_seq'::regclass);


--
-- Name: timesheets_draft id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft ALTER COLUMN id SET DEFAULT nextval('public.timesheets_draft_id_seq'::regclass);


--
-- Name: timesheets_statuses id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_statuses ALTER COLUMN id SET DEFAULT nextval('public.timesheets_statuses_id_seq'::regclass);


--
-- Name: timesheets_types id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_types ALTER COLUMN id SET DEFAULT nextval('public.timesheets_types_id_seq'::regclass);


--
-- Name: tokens id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tokens ALTER COLUMN id SET DEFAULT nextval('public.tokens_id_seq'::regclass);


--
-- Name: user_departments id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_departments ALTER COLUMN id SET DEFAULT nextval('public.user_departments_id_seq'::regclass);


--
-- Name: user_email_association id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_email_association ALTER COLUMN id SET DEFAULT nextval('public.user_email_association_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: Milestones; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public."Milestones" (id, name, date, done, "projectId", "typeId", "updatedAt", "deletedAt", "createdAt") FROM stdin;
\.


--
-- Name: Milestones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public."Milestones_id_seq"', 223, true);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public."SequelizeMeta" (name) FROM stdin;
20171229111705-create-milestone.js
20180311121300-timesheets-types-fix.js
20180326113010-change-task-tasks-constraint.js
20180404165400-external-user.js
20180409173800-user-active-colums.js
20180528102900-project-gitlab-column.js
20180530162600-project-types-table.js
20180530172500-project-type-column.js
20180531122310-projects-typeIds-default.js
20180609105102-task-by_client-column.js
20180613112510-delete-unused-task-type.js
20180613164625-qa-percent-column.js
20180623155500-create-milestone-type-enum.js
20180703151650-history-boolean-columns.js
201807051200-project-metric-types.js
201807051228-project-roles.js
20180802103612-timesheets-types-namesEn.js
20180802135300-milestone-types-namesEn.js
20180802140800-task-types-nameEn.js
201808101600-update-uploads-type.js
20180815093429-project_roles_en.js
20180815094623-task_statuses_en.js
20180815112232-sprint_statuses_en.js
20180815113832-project_statuses_en.js
201808161415-add-bug-metric-type.js
20180910151200-user-description.js
20180913162200-project-types-en-column.js
20180919164800-add-task-types-metrics.js
20180921171400-add-out-of-plan-metric-value.js
201808221310-add-gitlab-branches.js
20180927112000-comment-attachment-id.js
20170904104610-create-issues-types-association-tables.js
20170904104710-create-statuses-association-tables.js
20170930210000-create-users-association-tables.js
20181010100000-add-jira-hostname-to-project.js
20181016110403-add-external-id.js
201809271200-project-metric-types.js
20181024115400-add-devops-global-role.js
20181024141300-add-is_dev_ops-column.js
201811021901-update-user-association-table.js
201812031747-edit-metrics-types.js
201812071114-add-lastMetricCalc-to-sprint.js
201812100000-jira-project-name.js
20190110-add-indexes.js
20190111-test-user.js
20181221015605-gitlab-user-roles.js
20181229074309-user-gitlab-id.js
20190201141700-add-jira-token-column.js
201902051200-create-jira-sync-status-tables.js
201902071200-change-external-id-constraint.js
201904051200-create-jira-sync-status-tables.js
201902111200-jira-tti-user.js
20190214170000-change-type-description-column-user.js
201903011200-project-histories-delete-constraint.js
20190222170000-add-column-deleteat-in-milestone.js
20181224070443-create-goals.js
201904171400-add-task-history-decimal-value.js
20190903105131-add_firing_and_hiring_date.js
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.comments (id, task_id, parent_id, author_id, text, created_at, updated_at, deleted_at, attachment_ids) FROM stdin;
888	3095	\N	1	Рассылки<br>krasnov.aleksandr@nordclan.com<br>noskov.aleksandr@nordclan.com<br>customer@nordclan.com<br><br>созданы	2019-06-13 09:21:02.97+00	2019-06-13 09:21:02.97+00	\N	\N
889	3105	\N	186	готово -> ldap-ui.nordclan/	2019-06-13 11:57:37.558+00	2019-06-13 11:57:37.558+00	\N	\N
890	3098	\N	239	http://docker.nordclan:8000/2019/06/13/microservices/	2019-06-13 15:00:17.01+00	2019-06-13 15:00:17.01+00	2019-06-13 15:00:25.641+00	\N
891	3109	\N	239	http://track.docker.nordclan/projects/471/tasks/3109	2019-06-13 15:00:53.228+00	2019-06-13 15:00:53.228+00	\N	\N
892	3113	\N	102	Итог общения с RatesNet (13.06.2019)<br>1) Информации от нас ему достаточно, на данном этапе<br>2) В понедельник 17.06 будет совещание всех заинтересованных в проекте участников и вынесено решение со стороны RatesNet.<br>3) Во вторник 18.06 он сообщит фидбек<br>4) Выяснили что рассматривают несколько вариантов:<br>- Нас для проекта под ключ<br>- Иного подрядчика под ключ (Предложили 80 000 USD)<br>- Продолжать текущей командой + потенциально усилять ее	2019-06-13 15:05:51.207+00	2019-06-13 15:05:51.207+00	\N	\N
893	3114	\N	102	11.06.2019 Созвон с клиентом. \nУ клиента этап раннего пресейла. Требуется примерная оценка со списком фич с ограничениями и примерной оценкой.\nСрок - понедельник, вторник	2019-06-13 15:08:13.893+00	2019-06-13 15:08:39.318+00	\N	\N
894	3114	\N	102	13.06.2019  UCP<br>Оценка только трудозатрат системы, без интеграций - https://docs.google.com/spreadsheets/d/1jFfXtad-p64fRCyWFYwDS-qlaezg4aan50LTnBRSfvQ/edit#gid=389944903	2019-06-13 15:09:39.114+00	2019-06-13 15:09:39.114+00	\N	\N
895	3115	\N	102	11.06.2019 Созвон с клиентом. Презентация оценки. Клиент расширил функциональность	2019-06-13 15:14:22.853+00	2019-06-13 15:14:22.853+00	\N	\N
896	3115	\N	102	12.06.2019 Переоценка, новое КП с часами от 469,52	2019-06-13 15:14:58.477+00	2019-06-13 15:14:58.477+00	\N	\N
897	3115	\N	102	13.06.2019 Отказ клиента	2019-06-13 15:15:07.245+00	2019-06-13 15:15:07.245+00	\N	\N
898	3116	\N	183	да, дело в nginx	2019-06-13 21:58:45.756+00	2019-06-13 21:58:45.756+00	\N	\N
899	3116	\N	183	client_max_body_size 1M -> client_max_body_size 100M; в /etc/nginx/nginx.conf	2019-06-13 21:59:04.715+00	2019-06-13 22:00:02.136+00	\N	\N
900	3117	\N	102	13.06.2019 <br>1) диалоги будут разрабатывать сами, обращений к API Skyeng пока не надо, хотя в будущем может понадобиться<br>2) персонаж появляется в определенном квадратном блоке контента, например, там где сейчас у нас отображается видео преподавателя<br>3) есть дизайн, но не 3D; моделирование будут отдельно рассматривать, у нас или у других фрилансеров	2019-06-14 06:50:06.857+00	2019-06-14 06:50:06.857+00	\N	\N
901	3117	\N	102	13.06.2019<br>по движку сейчас рассматривается несколько вариантов, включая Watson, DialogFlow, Наносемантика, Just AI	2019-06-14 06:50:45.253+00	2019-06-14 06:50:45.253+00	\N	\N
902	3111	\N	239	Фотографии в блоке "Напишите нам"	2019-06-14 08:00:21.304+00	2019-06-14 08:00:21.304+00	\N	\N
903	3121	\N	239	Сделаны пункты 1, 3, 4	2019-06-14 09:32:55.537+00	2019-06-14 09:32:55.537+00	\N	\N
904	3121	\N	239	Подменю услуги на десктопе сделано шире (чтобы все пункты меню умещались в одну строку)	2019-06-14 09:34:51.919+00	2019-06-14 09:34:51.919+00	\N	\N
905	3121	\N	239	На мобильных устройствах (ширина экрана меньше 767px) уменьшен шрифт заголовка "<br>Создаем уникальное программное обеспечение для процветания вашего бизнеса"	2019-06-14 10:03:51.72+00	2019-06-14 10:03:51.72+00	\N	\N
906	3121	\N	239	Желтый цвет заменен на FFE392	2019-06-14 10:10:04.693+00	2019-06-14 10:10:04.693+00	\N	\N
907	3119	\N	239	ссылки заменены на ссылки вида /%category%/%postname%/	2019-06-14 10:26:59.9+00	2019-06-14 10:26:59.9+00	\N	\N
908	3118	\N	102	14.06.19 - созвон с клиентом. <br>высылаем резюме команды java+react|angular + ставки	2019-06-14 10:59:24.195+00	2019-06-14 10:59:24.195+00	\N	\N
909	3121	\N	239	В статьях уменьшен отступ снизу и сверху. ширина контента увеличена до 1110px.	2019-06-14 11:06:17.305+00	2019-06-14 11:06:17.305+00	\N	\N
910	3121	\N	239	Исправлен пункт 2	2019-06-14 11:50:48.993+00	2019-06-14 11:50:48.993+00	\N	\N
911	3132	\N	266	Меню скрыто	2019-06-14 18:28:01.432+00	2019-06-14 18:28:01.432+00	\N	\N
912	3136	\N	266	Отредактированы заголовки, список	2019-06-14 18:29:29.546+00	2019-06-14 18:29:29.546+00	\N	\N
913	3131	\N	266	Заголовки, картинка, разделители добавлены	2019-06-14 18:30:47.871+00	2019-06-14 18:30:47.871+00	\N	\N
914	3125	\N	266	Сделано:\n- 1 смена иконок\n- Отредактированы фотки\n- тексты в кавычках\nНе сделано:\n- Блок заголовка ВЫШЕ фоточек\n- вертикальная полоса на другой стороне от фото(дубликат)	2019-06-14 18:50:54.515+00	2019-06-14 18:51:30.465+00	\N	\N
915	3125	\N	239	Сделано:<br>Пункт 2;<br>Пункт 3 (вертикальная полоса на другой стороне от фото);	2019-06-14 21:18:20.718+00	2019-06-14 21:18:20.718+00	\N	\N
916	3121	\N	239	Пункт 5 - сделано в рамках http://track.docker.nordclan/projects/471/tasks/3121\nПункт 6 -  не сделано. Будет сделано в рамках http://track.docker.nordclan/projects/471/tasks/3128	2019-06-14 21:19:53.573+00	2019-06-14 21:21:19.676+00	\N	\N
917	3133	\N	239	На страницу Портфолио добавлен заголовок	2019-06-14 23:06:02.506+00	2019-06-14 23:06:02.506+00	\N	\N
918	3128	\N	239	Указать звездочки возле обязательных полей - сделано <br><br>Ограничения на кол-во символов нет или оно оооооч большое  - сделано (максимальная длина 250 символов для имени, названия компании, телефона и почты, максимальная длина для комментария - 1000 символов )	2019-06-15 21:04:32.647+00	2019-06-15 21:04:32.647+00	\N	\N
919	3134	\N	266	Заменила	2019-06-15 21:28:12.466+00	2019-06-15 21:28:12.466+00	\N	\N
920	3124	\N	212	Если я правильно понял, то страницу services нужно убрать. И ссылка "услуги" должна быть некликабельна	2019-06-16 07:32:27.215+00	2019-06-16 07:32:27.215+00	\N	\N
921	3128	\N	239	Маски на email и телефон - сделано	2019-06-16 09:52:31.525+00	2019-06-16 09:52:31.525+00	\N	\N
922	3135	\N	186	http://docker.nordclan:8000/projects/foodtech/	2019-06-16 11:19:39.601+00	2019-06-16 11:19:39.601+00	\N	\N
923	3138	\N	336	На людей времени не хватило, возможно сделать позже.	2019-06-16 11:21:59.481+00	2019-06-16 11:21:59.481+00	\N	\N
924	3135	\N	266	Проверено	2019-06-16 11:29:41.647+00	2019-06-16 11:29:41.647+00	\N	\N
925	3126	\N	239	(не актуально)	2019-06-16 17:49:09.957+00	2019-06-16 17:49:09.957+00	\N	\N
926	3144	\N	239	https://nordclan.com/	2019-06-16 19:24:35.149+00	2019-06-16 19:24:35.149+00	\N	\N
927	3145	\N	239	https://nordclan.com/	2019-06-16 19:25:05.536+00	2019-06-16 19:25:05.536+00	\N	\N
928	3147	\N	239	https://nordclan.com/	2019-06-16 21:23:21.026+00	2019-06-16 21:23:21.026+00	\N	\N
929	3158	\N	239	https://nordclan.com/	2019-06-16 21:23:52.458+00	2019-06-16 21:23:52.458+00	\N	\N
930	3152	\N	239	https://nordclan.com	2019-06-16 22:00:16.604+00	2019-06-16 22:00:16.604+00	\N	\N
931	3151	\N	239	https://nordclan.com	2019-06-16 22:01:06.681+00	2019-06-16 22:01:06.681+00	\N	\N
932	3159	\N	239	https://nordclan.com/contacts/	2019-06-16 22:17:42.309+00	2019-06-16 22:17:42.309+00	\N	\N
933	3163	\N	102	Созвон вторник 18.06	2019-06-17 06:27:39.321+00	2019-06-17 06:27:39.321+00	\N	\N
934	3162	\N	266	Исправлено на боевом	2019-06-17 07:20:53.735+00	2019-06-17 07:20:53.735+00	\N	\N
935	3154	\N	239	Поддерживаем safari 10,11, 12. safari 9 - не поддерживаем	2019-06-17 09:27:08.719+00	2019-06-17 09:27:08.719+00	\N	\N
936	3165	\N	266	https://metrika.yandex.ru/dashboard?group=day&period=week&id=54093205	2019-06-17 09:56:07.857+00	2019-06-17 09:56:07.857+00	\N	\N
937	3165	\N	266	метрика заведена на <br>corpsite@nordclan.com	2019-06-17 09:56:24.572+00	2019-06-17 09:56:24.572+00	\N	\N
938	3165	\N	266	До завершения задачи на запрос обработки персональных данных в урезанном виде	2019-06-17 09:57:54.921+00	2019-06-17 09:57:54.921+00	\N	\N
939	3164	\N	239	Меню на главной (рядом с маяком) - добавлена анимация, увеличено расстояние между пунктами	2019-06-17 10:50:07.867+00	2019-06-17 10:50:07.867+00	\N	\N
940	3172	\N	266	Размер всех основных картинок максимум до 200 Кб	2019-06-17 11:09:35.422+00	2019-06-17 11:09:46.515+00	\N	\N
941	3174	\N	239	При  hover-е на инпуте не появляется маска (маска появляется только при фокусе).	2019-06-17 11:13:40.592+00	2019-06-17 11:13:40.592+00	\N	\N
942	3177	\N	266	Созданы<br>Контактная информация сотрудников nordclan http://xwiki.nordclan/bin/view/Main/%D0%92%D0%BD%D1%83%D1%82%D1%80%D0%B5%D0%BD%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA%20email%20%D1%81%D0%BE%D1%82%D1%80%D1%83%D0%B4%D0%BD%D0%B8%D0%BA%D0%BE%D0%B2%20nordclan/<br>Корпоративный сайт<br>http://xwiki.nordclan/bin/view/Main/4.%20%D0%92%D0%BD%D0%B5%D1%88%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B/%D0%9A%D0%BE%D1%80%D0%BF%D0%BE%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9%20%D1%81%D0%B0%D0%B9%D1%82/	2019-06-18 07:00:37.047+00	2019-06-18 07:00:37.047+00	\N	\N
943	3114	\N	102	оценка - http://bucksman.docker.nordclan/estimates/5d07540b4fd92217a7868d6a	2019-06-18 08:35:04.797+00	2019-06-18 08:35:04.797+00	\N	\N
944	3114	\N	102	Тех.концепция<br><br>Назначение приложения<br>Платформа для коммуникации с клиентами.<br><br>Архитектура приложения<br>Система разрабатывается в виде веб-приложения. <br>Пользователи работают с приложением через веб-браузер, таким образом, приложение доступно пользователям с различными операционными системами. <br>Поддержка браузеров - Chrome 72+, Firefox 65+, IE 11+, Safari 12+<br>Верстка приложения на стандартных ui компонентах, без уникального дизайна, неадаптивная.<br><br>Для MVP версии включена следующая функциональность: <br>Авторизация в приложении доступна администраторам. В базовой версии приложения в систему включены до 5 пользователей, без возможности регистрации в системе новых пользователей.<br>Управление контентом рассылок осуществляется с помощью стандартного wiziwig-редактора, который будет подобран на этапе аналитики. <br>Возможно управление только заранее утвержденными и добавленными в систему каналами коммуникации.<br>В оценку включены настройки готового бизнес-процесса, зашитого в функциональность приложения, с возможностью изменения числовых параметров процесса. <br>Полное изменение бизнес-процесса работы системы из элементов интерфейса не возможно.<br>В оценку включено не более 10 простых и 15 сложных экранных форм.<br>Требования к системе для обеспечения стабильности приложения будет осуществляться на этапе аналитики приложения.	2019-06-18 08:35:43.573+00	2019-06-18 08:35:43.573+00	\N	\N
945	3179	\N	266	Добавлена в xwiki статья "Теория SEO"\nhttp://xwiki.nordclan/bin/view/Main/5.%20%D0%A2%D0%B5%D0%BE%D1%80%D0%B8%D1%8F/SEO/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA%20%D0%B4%D0%BB%D1%8F%20%D0%B8%D0%B7%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F/\nДоработан блок SEO в статье "Корпоративный сайт"\nhttp://xwiki.nordclan/bin/view/Main/4.%20%D0%92%D0%BD%D0%B5%D1%88%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B/%D0%9A%D0%BE%D1%80%D0%BF%D0%BE%D1%80%D0%B0%D1%82%D0%B8%D0%B2%D0%BD%D1%8B%D0%B9%20%D1%81%D0%B0%D0%B9%D1%82/	2019-06-18 08:38:05.242+00	2019-06-18 08:38:36.676+00	\N	\N
946	3176	\N	266	Текст исправлен на боевом	2019-06-18 09:34:49.311+00	2019-06-18 09:34:49.311+00	\N	\N
947	3176	\N	266	На внутренней странице подменю "услуги" раскрывать при наведении  - если реализовать не будет работать на планшетах ховер	2019-06-18 09:35:17.3+00	2019-06-18 09:35:39.295+00	\N	\N
948	3099	\N	183	http://xwiki.nordclan/bin/view/Main/%D0%92%D0%BD%D1%83%D1%82%D1%80%D0%B5%D0%BD%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81%D1%8B/	2019-06-18 11:14:20.842+00	2019-06-18 11:14:20.842+00	\N	\N
949	3196	\N	205	j8xGfKpkwuUs3GV	2019-06-18 14:03:22.076+00	2019-06-18 14:03:22.076+00	\N	\N
950	3196	\N	205	info.nordclan@yandex.ru\nj8xGfKpkwuUs3GV	2019-06-18 14:45:08.649+00	2019-06-18 14:45:24.784+00	\N	\N
951	3114	\N	102	Leonid Pletnev, [18.06.19 18:14]<br>Получил, фид бэк дам на след неделе	2019-06-19 05:57:52.679+00	2019-06-19 05:57:52.679+00	\N	\N
952	3194	\N	266	Настроено превью для facebook, vk. Текущее превью прикреплено скриншотом\nog:title="Создаем уникальное программное обеспечение для процветания вашего бизнеса">\nog:url="https://nordclan.com/"/>	2019-06-19 09:12:53.499+00	2019-06-19 09:13:29.119+00	\N	\N
953	3194	\N	266	В xwiki добавлены ссылки для сброса кеша превью в facebook, vk	2019-06-19 09:14:51.281+00	2019-06-19 09:14:51.281+00	\N	\N
954	3207	\N	35	{@102} сделай тексты, вчера!	2019-06-19 11:29:04.689+00	2019-06-19 11:29:04.689+00	2019-06-19 11:34:42.905+00	\N
955	3207	\N	35	нужны картинки к текстам	2019-06-19 11:31:34.005+00	2019-06-19 11:31:34.005+00	2019-06-19 11:34:45.809+00	\N
956	3168	\N	266	Сделано. Влито на тестовый и боевой	2019-06-19 14:09:36.595+00	2019-06-19 14:09:36.595+00	\N	\N
957	3163	\N	102	19.06 Собеседование с клиентом, Френкель+Краснов. Итог в понедельник.<br>Предварительно - Андрей подходит. Требуется согласование с ЛПР(поскольку есть аппрув только на найм в штат, на подряд - требуется дополнительно) <br>Заинтересовались в QA экспертизе, договорились выслать предложения по обеспечению качества и нашей экспертизой	2019-06-19 14:43:13.94+00	2019-06-19 14:43:13.94+00	\N	\N
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.comments_id_seq', 957, true);


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.departments (id, name, ps_id, created_at, updated_at, deleted_at) FROM stdin;
2	*Направление Java	o2k187g0000lh58rbh10000000	2017-06-30 10:33:23.164+00	2017-06-30 10:33:23.164+00	\N
3	*Направление Аналитики	o2k007g0000jjksd9m30000000	2017-06-30 10:33:23.164+00	2017-06-30 10:33:23.164+00	\N
4	*Направление PHP	o2k187g0000lgoe7gos0000000	2017-06-30 10:33:23.164+00	2017-06-30 10:33:23.164+00	\N
11	*Направление C++	o2k007g0000jcktnngp0000000	2017-06-30 10:33:23.194+00	2017-06-30 10:33:23.194+00	\N
7	*Направление .Net	o2k187g0000lgkhv2ckg000000	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
5	*Направление Frontend/JS	o2k187g0000lgoekeh9g000000	2017-06-30 10:33:23.164+00	2017-06-30 10:33:23.164+00	\N
8	*Направление Bitrix	o2k187g0000lgoe24igg000000	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
6	*Направление мобильной разработки	o2k007g0000jcktq5td0000000	2017-06-30 10:33:23.177+00	2017-06-30 10:33:23.177+00	\N
13	*Направление Ruby	o2k187g0000lgkho90fg000000	2017-06-30 10:33:23.194+00	2017-06-30 10:33:23.194+00	\N
9	*Направление Дизайна	o2k187g0000l7j0u3840000000	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
12	*Направление Python	o2k187g0000lgoe4rp60000000	2017-06-30 10:33:23.194+00	2017-06-30 10:33:23.194+00	\N
1	*Направление Разработки в тестировании	o2k187g0000lh1fp702g000000	2017-06-30 10:33:23.163+00	2017-06-30 10:33:23.163+00	\N
10	*Направление QA	o2k187g0000lgkhmfg6g000000	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
15	*Топ меннеджмент	14	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
16	*Клиентская служба	15	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
17	*Отдел продаж	16	2017-06-30 10:33:23.178+00	2017-06-30 10:33:23.178+00	\N
\.


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.departments_id_seq', 17, true);


--
-- Data for Name: gitlab_user_roles; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.gitlab_user_roles (id, access_level, expires_at, project_user_id, gitlab_project_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: gitlab_user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.gitlab_user_roles_id_seq', 1175, true);


--
-- Data for Name: goal_sprints; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.goal_sprints (goal_id, sprint_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: goal_tasks; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.goal_tasks (goal_id, task_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.goals (id, name, description, visible, planned_execution_time, status, active_sprint_id, moved_to_sprint_id, parent_id, project_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: item_tags; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.item_tags (id, tag_id, taggable, taggable_id, deleted_at) FROM stdin;
\.


--
-- Name: item_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.item_tags_id_seq', 848, true);


--
-- Data for Name: jira_sync_status; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.jira_sync_status (id, simtrack_project_id, jira_project_id, date, status) FROM stdin;
\.


--
-- Name: jira_sync_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.jira_sync_status_id_seq', 1, false);


--
-- Data for Name: metric_types; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.metric_types (id, name, calc_every_sprint) FROM stdin;
1	Дата начала проекта	f
2	Дата завершения проекта	f
3	Бюджет проекта без РР (часы)	f
4	Бюджет проекта с РР (часы)	f
5	Burndown по проекту без РР	f
6	Burndown по проекту с РР	f
7	Количество открытых багов	f
8	Количество открытых багов от Заказчика	f
9	Количество открытых регрессионных багов	f
10	% часов затраченных на роль 1(Account)	f
11	% часов затраченных на роль 2(PM)	f
12	% часов затраченных на роль 3(UX)	f
13	% часов затраченных на роль 4(Аналитик)	f
14	% часов затраченных на роль 5(Back)	f
15	% часов затраченных на роль 6(Front)	f
16	% часов затраченных на роль 7(Mobile)	f
17	% часов затраченных на роль 8(TeamLead(Code review))	f
18	% часов затраченных на роль 9(QA)	f
19	% часов затраченных на роль 10(Unbillable)	f
20	Часы затраченные на роль 1(Account)	f
21	Часы затраченные на роль 2(PM)	f
22	Часы затраченные на роль 3(UX)	f
23	Часы затраченные на роль 4(Аналитик)	f
24	Часы затраченные на роль 5(Back)	f
25	Часы затраченные на роль 6(Front)	f
26	Часы затраченные на роль 7(Mobile)	f
27	Часы затраченные на роль 8(TeamLead(Code review))	f
28	Часы затраченные на роль 9(QA)	f
29	Часы затраченные на роль 10(Unbillable)	f
57	Часы затраченные на фикс багов	f
30	Burndown по спринтам без РР	t
31	Burndown по спринтам с РР	t
32	Динамика закрытия фич (с учетом трудозатрат)	t
33	Трудозатрат на фичи без оценки	t
34	Динамика списания времени на фичи	t
35	Количество открытых задач типа 1(Фича)	t
36	Количество открытых задач типа 2(Доп. Фича)	t
37	Количество открытых задач типа 3(Баг)	t
38	Количество открытых задач типа 4(Регрес. Баг)	t
39	Количество открытых задач типа 5(Баг от клиента)	t
40	Количество фич без оценки	t
51	% часов затраченных на роль 11(Android)	t
52	% часов затраченных на роль 12 (iOS)	t
53	Часы затраченные на роль 11(Android)	t
54	Часы затраченные на роль 12(iOS)	t
55	% часов затраченных на роль 13(DevOps)	t
56	Часы затраченные на роль 13(DevOps)	t
58	Количество открытых задач от клиента	t
59	Количество открытых доп.фич от клиента	t
60	Количество открытых регрессионных багов от клиента	t
41	Количество открытых фич вне плана	t
61	Метрика по комманде. UserId, кол-во выполненных задач, кол-во возвратов задач, кол-во пофикшенных багов, кол-во возвратов багов, кол-во связанных багов	t
\.


--
-- Data for Name: metrics; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.metrics (id, type_id, value, created_at, project_id, sprint_id, user_id) FROM stdin;
\.


--
-- Name: metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.metrics_id_seq', 194173, true);


--
-- Data for Name: milestone_types_dictionary; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.milestone_types_dictionary (id, name, code_name, name_en) FROM stdin;
3	Внутренняя демо	DEMO_INSIDE	Inner demo
4	Демо Клиенту	DEMO_CLIENT	Other
2	Другое	OTHER	Demo for client
1	Получение отзыва	GET_REVIEW	Get feedback
\.


--
-- Name: milestone_types_dictionary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.milestone_types_dictionary_id_seq', 4, true);


--
-- Name: model_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.model_histories_id_seq', 24791, true);


--
-- Data for Name: portfolios; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.portfolios (id, name, author_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: portfolios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.portfolios_id_seq', 12, true);


--
-- Data for Name: project_attachments; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_attachments (id, project_id, file_name, path, "previewPath", author_id, size, type, created_at, deleted_at) FROM stdin;
\.


--
-- Name: project_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_attachments_id_seq', 71, true);


--
-- Data for Name: project_events; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_events (id, name) FROM stdin;
1	Новая задача в проекте
2	Присвоена новая задача
3	Новый комментарий к задаче
4	Изменен статус задачи
5	Новое упоминание в комментарии к задаче
\.


--
-- Data for Name: project_histories; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_histories (id, entity, entity_id, project_id, field, prev_value_str, value_str, prev_value_int, value_int, prev_value_date, value_date, prev_value_float, value_float, prev_value_text, value_text, action, created_at, user_id) FROM stdin;
5206	Project	470	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-10 20:53:23.41+00	183
5207	ProjectUser	764	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 07:56:05.691+00	183
5208	ProjectUser	765	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 07:57:33.343+00	183
5209	ProjectUser	766	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 07:59:45.478+00	183
5210	Project	471	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:05:18.331+00	102
5211	ProjectUser	767	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:06:04.588+00	102
5212	ProjectUser	768	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:06:16.345+00	102
5213	ProjectUser	769	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:06:27.124+00	102
5214	ProjectUser	770	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:06:36.415+00	102
5215	Sprint	424	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:27:14.826+00	183
5216	Sprint	424	470	statusId	\N	\N	1	2	\N	\N	\N	\N	\N	\N	update	2019-06-11 08:27:16.383+00	183
5217	ProjectUser	771	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:28:33.35+00	183
5218	ProjectUser	772	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:28:59.746+00	183
5219	ProjectUser	773	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:30:10.053+00	183
5220	ProjectUser	774	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:35:02.294+00	183
5221	ProjectUser	775	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:39:19.027+00	102
5222	ProjectUser	776	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:39:41.572+00	102
5223	ProjectUser	777	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:39:49.674+00	102
5224	ProjectUser	778	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:39:59.369+00	102
5225	Sprint	425	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:40:58.74+00	102
5226	Sprint	425	471	statusId	\N	\N	1	2	\N	\N	\N	\N	\N	\N	update	2019-06-11 08:54:32.977+00	183
5227	Project	470	470	name	track	Tracker	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:53:31.595+00	102
5228	Project	470	470	name	Tracker	InfraStructure	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:54:32.705+00	102
5229	Project	470	470	prefix	track	IS	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:55:13.783+00	102
5230	ProjectUser	779	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 18:28:42.941+00	102
5231	ProjectUser	780	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:35:00.386+00	102
5232	ProjectUser	781	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 11:55:51.112+00	1
5233	Project	472	472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:58:18.138+00	102
5234	ProjectUser	782	472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:58:32.817+00	102
5235	Sprint	426	472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:58:52.402+00	102
5236	Sprint	426	472	statusId	\N	\N	1	2	\N	\N	\N	\N	\N	\N	update	2019-06-13 14:58:55.022+00	102
5237	ProjectUser	783	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 10:15:53.684+00	102
5238	ProjectUser	784	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 15:19:39.028+00	1
5239	Sprint	427	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 09:17:42.323+00	102
5240	Project	470	470	name	InfraStructure	NordClan	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 08:03:26.92+00	102
5241	Project	470	470	prefix	IS	NC	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 08:03:26.92+00	102
5242	ProjectUser	785	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:03:45.254+00	102
5243	ProjectUser	786	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:03:53.281+00	102
5244	ProjectUser	787	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:04:06.178+00	102
5245	ProjectUser	788	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:04:13.871+00	102
5246	Sprint	424	470	name	sptint1	Спринт 1	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 08:05:13.545+00	102
5247	Sprint	424	470	factStartDate	\N	\N	\N	\N	2019-06-10 00:00:00+00	2019-06-10 00:00:00+00	\N	\N	\N	\N	update	2019-06-18 08:05:13.545+00	102
5248	Sprint	424	470	factFinishDate	\N	\N	\N	\N	2019-06-26 00:00:00+00	2019-06-26 00:00:00+00	\N	\N	\N	\N	update	2019-06-18 08:05:13.545+00	102
5249	Project	473	473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:11:22.915+00	102
5250	ProjectUser	789	473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:11:30.588+00	102
5251	ProjectUser	790	473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:11:36.146+00	102
5252	ProjectUser	791	473	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:11:41.733+00	102
5253	Sprint	428	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:13:09.198+00	102
5254	Sprint	428	470	name	Доработки ST	Доработки внутр.проектов	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 08:24:14.45+00	102
5255	Sprint	428	470	factStartDate	\N	\N	\N	\N	2019-06-10 00:00:00+00	2019-06-10 00:00:00+00	\N	\N	\N	\N	update	2019-06-18 08:24:14.45+00	102
5256	Sprint	428	470	factFinishDate	\N	\N	\N	\N	2019-06-30 00:00:00+00	2019-06-30 00:00:00+00	\N	\N	\N	\N	update	2019-06-18 08:24:14.45+00	102
5257	Sprint	428	470	statusId	\N	\N	1	2	\N	\N	\N	\N	\N	\N	update	2019-06-18 08:25:16.346+00	102
5258	Sprint	425	471	statusId	\N	\N	2	1	\N	\N	\N	\N	\N	\N	update	2019-06-18 12:59:18.626+00	102
5259	Sprint	427	471	statusId	\N	\N	1	2	\N	\N	\N	\N	\N	\N	update	2019-06-18 12:59:19.11+00	102
5260	ProjectUser	792	472	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 06:02:31.911+00	102
5261	ProjectUser	793	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:41:37.728+00	102
5262	ProjectUser	794	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:41:43.832+00	102
5263	ProjectUser	795	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:41:50.73+00	102
5264	ProjectUser	796	471	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 10:29:17.09+00	102
5265	ProjectUser	797	470	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 11:32:24.407+00	35
5266	Project	474	474	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-07-04 15:43:20.682+00	186
5267	Project	474	474	deleted_at	\N	\N	\N	\N	\N	2019-07-04 15:50:36.045+00	\N	\N	\N	\N	update	2019-07-04 15:50:36.057+00	186
\.


--
-- Name: project_histories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_histories_id_seq', 5267, true);


--
-- Data for Name: project_roles; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_roles (id, code, name, name_en) FROM stdin;
2	pm	PM	PM
1	account	Account	Account
3	ux	UX	UX
4	analyst	Аналитик	Analyst
5	back	Back	Back
6	front	Front	Front
7	mobile	Mobile	Mobile
8	teamLead	TeamLead(Code review)	TeamLead(Code review)
9	qa	QA	QA
10	unbillable	Unbillable	Unbillable
11	customer	Customer	Customer
12	android	Android	Android
13	ios	IOS	IOS
14	devops	DevOps	DevOps
\.


--
-- Data for Name: project_statuses; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_statuses (id, name, name_en) FROM stdin;
2	Приостановлен	Paused
1	В процессе	In progress
3	Завершен	Finished
\.


--
-- Data for Name: project_types; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_types (id, name, code_name, name_en) FROM stdin;
1	Без типа	UNDEFINED	No type
2	Продуктовый	PRODUCT	Product
3	Стажировка	INTERNSHIP	Intenrship
4	Внутренний	INTERNAL	Internal
\.


--
-- Name: project_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_types_id_seq', 4, true);


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_users (id, project_id, user_id, author_id, deleted_at, created_at) FROM stdin;
764	470	102	183	\N	2019-06-11 07:56:05.493+00
765	470	1	183	\N	2019-06-11 07:57:33.337+00
766	470	336	183	\N	2019-06-11 07:59:45.471+00
767	471	266	102	\N	2019-06-11 08:06:04.583+00
768	471	212	102	\N	2019-06-11 08:06:16.339+00
774	470	183	183	\N	2019-06-11 08:35:02.289+00
775	471	183	102	\N	2019-06-11 08:39:19.022+00
776	471	186	102	\N	2019-06-11 08:39:41.566+00
777	471	239	102	\N	2019-06-11 08:39:49.669+00
778	471	205	102	\N	2019-06-11 08:39:59.364+00
779	470	239	102	\N	2019-06-11 18:28:42.927+00
780	471	1	102	\N	2019-06-13 08:35:00.287+00
781	470	186	1	\N	2019-06-13 11:55:51.045+00
782	472	102	102	\N	2019-06-13 14:58:32.774+00
783	471	336	102	\N	2019-06-16 10:15:52.58+00
784	471	35	1	\N	2019-06-16 15:19:38.998+00
785	470	205	102	\N	2019-06-18 08:03:44.007+00
786	470	266	102	\N	2019-06-18 08:03:53.276+00
787	470	212	102	\N	2019-06-18 08:04:06.174+00
788	470	45	102	\N	2019-06-18 08:04:13.868+00
789	473	344	102	\N	2019-06-18 08:11:30.584+00
790	473	183	102	\N	2019-06-18 08:11:36.143+00
791	473	239	102	\N	2019-06-18 08:11:41.729+00
792	472	205	102	\N	2019-06-19 06:02:31.459+00
793	470	344	102	\N	2019-06-19 07:41:37.536+00
794	470	357	102	\N	2019-06-19 07:41:43.829+00
795	470	2696	102	\N	2019-06-19 07:41:50.727+00
796	471	102	102	\N	2019-06-19 10:29:17.07+00
797	470	35	35	\N	2019-06-19 11:32:24.376+00
\.


--
-- Name: project_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_users_id_seq', 798, true);


--
-- Data for Name: project_users_roles; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_users_roles (id, project_user_id, project_role_id) FROM stdin;
4413	764	2
4418	765	2
4421	767	9
4422	768	9
4430	775	8
4431	776	5
4432	777	6
4433	778	4
4434	779	6
4435	766	6
4436	780	8
4439	782	2
4440	783	6
4443	784	3
4444	781	5
4445	785	4
4446	786	9
4447	787	9
4448	788	5
4449	774	6
4450	789	1
4451	790	6
4452	791	6
4453	792	4
4454	793	3
4455	794	3
4456	795	3
4457	796	2
4458	797	3
\.


--
-- Name: project_users_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_users_roles_id_seq', 4458, true);


--
-- Data for Name: project_users_subscriptions; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.project_users_subscriptions (id, project_user_id, project_event_id) FROM stdin;
3406	764	1
3407	764	2
3408	764	3
3409	764	4
3410	764	5
3411	765	1
3412	765	2
3413	765	3
3414	765	4
3415	765	5
3416	766	1
3417	766	2
3418	766	3
3419	766	4
3420	766	5
3421	767	1
3422	767	2
3423	767	3
3424	767	4
3425	767	5
3426	768	1
3427	768	2
3428	768	3
3429	768	4
3430	768	5
3431	774	1
3432	774	2
3433	774	3
3434	774	4
3435	774	5
3436	775	1
3437	775	2
3438	775	3
3439	775	4
3440	775	5
3441	776	1
3442	776	2
3443	776	3
3444	776	4
3445	776	5
3446	777	1
3447	777	2
3448	777	3
3449	777	4
3450	777	5
3451	778	1
3452	778	2
3453	778	3
3454	778	4
3455	778	5
3456	779	1
3457	779	2
3458	779	3
3459	779	4
3460	779	5
3461	780	1
3462	780	2
3463	780	3
3464	780	4
3465	780	5
3466	781	1
3467	781	2
3468	781	3
3469	781	4
3470	781	5
3471	782	1
3472	782	2
3473	782	3
3474	782	4
3475	782	5
3476	783	1
3477	783	2
3478	783	3
3479	783	4
3480	783	5
3481	784	1
3482	784	2
3483	784	3
3484	784	4
3485	784	5
3486	785	1
3487	785	2
3488	785	3
3489	785	4
3490	785	5
3491	786	1
3492	786	2
3493	786	3
3494	786	4
3495	786	5
3496	787	1
3497	787	2
3498	787	3
3499	787	4
3500	787	5
3501	788	1
3502	788	2
3503	788	3
3504	788	4
3505	788	5
3506	789	1
3507	789	2
3508	789	3
3509	789	4
3510	789	5
3511	790	1
3512	790	2
3513	790	3
3514	790	4
3515	790	5
3516	791	1
3517	791	2
3518	791	3
3519	791	4
3520	791	5
3521	792	1
3522	792	2
3523	792	3
3524	792	4
3525	792	5
3526	793	1
3527	793	2
3528	793	3
3529	793	4
3530	793	5
3531	794	1
3532	794	2
3533	794	3
3534	794	4
3535	794	5
3536	795	1
3537	795	2
3538	795	3
3539	795	4
3540	795	5
3541	796	1
3542	796	2
3543	796	3
3544	796	4
3545	796	5
3546	797	1
3547	797	2
3548	797	3
3549	797	4
3550	797	5
\.


--
-- Name: project_users_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.project_users_subscriptions_id_seq', 3550, true);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.projects (id, name, description, prefix, status_id, notbillable, budget, risk_budget, attaches, portfolio_id, author_id, finished_at, created_at, updated_at, deleted_at, completed_at, created_by_system_user, gitlab_project_ids, type_id, qa_percent, jira_hostname, external_id, jira_project_name, jira_token) FROM stdin;
471	Site NC	\N	SNC	1	1	\N	\N	\N	\N	102	\N	2019-06-11 08:05:18.27+00	2019-06-11 08:05:18.27+00	\N	\N	f	{}	2	30	\N	\N	\N	\N
472	Leads NC	\N	LNC	1	1	\N	\N	\N	\N	102	\N	2019-06-13 14:58:18.073+00	2019-06-13 14:58:18.073+00	\N	\N	f	{}	1	30	\N	\N	\N	\N
470	NordClan	\N	NC	1	1	\N	\N	\N	\N	183	\N	2019-06-10 20:53:23.37+00	2019-06-18 08:03:26.902+00	\N	\N	f	{}	4	30	\N	\N	\N	\N
473	ГорПарковки	\N	GP	1	1	\N	\N	\N	\N	102	\N	2019-06-18 08:11:22.566+00	2019-06-18 08:11:22.566+00	\N	\N	f	{}	1	30	\N	\N	\N	\N
474	test	\N	test	1	1	\N	\N	\N	\N	186	\N	2019-07-04 15:43:20.549+00	2019-07-04 15:43:20.549+00	2019-07-04 15:50:36.045+00	\N	f	{}	1	30	\N	\N	\N	\N
\.


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.projects_id_seq', 474, true);


--
-- Data for Name: sprint_statuses; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.sprint_statuses (id, name, name_en) FROM stdin;
1	Не в процессе	Stopped
2	В процессе	In progress
\.


--
-- Name: sprint_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.sprint_statuses_id_seq', 1, false);


--
-- Data for Name: sprints; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.sprints (id, name, status_id, fact_start_date, fact_finish_date, allotted_time, author_id, created_at, updated_at, deleted_at, project_id, budget, risk_budget, qa_percent, external_id, entities_last_update, metric_last_update) FROM stdin;
425	Выпуск сайта	1	2019-06-10	2019-06-14	\N	102	2019-06-11 08:40:58.605+00	2019-06-19 09:16:29.505+00	\N	471	0.00	0.00	30	\N	2019-06-19 09:16:29.505+00	\N
424	Спринт 1	2	2019-06-10	2019-06-26	\N	183	2019-06-11 08:27:14.694+00	2019-07-02 11:36:19.179+00	\N	470	0.00	0.00	30	\N	2019-07-02 11:36:19.179+00	\N
427	Релиз 2	2	2019-06-18	2019-06-28	\N	102	2019-06-17 09:17:42.216+00	2019-07-02 11:36:20.83+00	\N	471	0.00	0.00	30	\N	2019-07-02 11:36:20.83+00	\N
428	Доработки внутр.проектов	2	2019-06-10	2019-06-30	\N	102	2019-06-18 08:13:09.182+00	2019-07-10 08:14:39.124+00	\N	470	0.00	0.00	30	\N	2019-07-10 08:14:39.124+00	\N
426	Июнь	2	2019-06-01	2019-06-30	\N	102	2019-06-13 14:58:52.381+00	2019-07-02 07:32:19.324+00	\N	472	0.00	0.00	30	\N	2019-07-02 07:32:19.324+00	\N
\.


--
-- Name: sprints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.sprints_id_seq', 428, true);


--
-- Data for Name: system_tokens; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.system_tokens (id, token, expires) FROM stdin;
1	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTAtMTZUMTI6NDc6MjkuMzk5WiI.uZL3EvASr67C-QHEhSmk_q00FytJxqsu3VfCrIadW6laVRza8gdsJc6JCbvLwrLyWxh66ALZCiuqcbv9cvFQ4A	2027-10-16 12:47:29+00
2	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTAtMTZUMTc6NDM6MTYuNjA3WiI.Rp2BQaLZRu5IdiBsGkXpBSipOUDHkjkRoAOham_8NPqCNuQUbkMd1pZzRWGo_ZqqQLNoyP3lZSOr7Ml_YnXKqw	2027-10-16 17:43:16+00
3	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTAtMTZUMTc6NTA6MzYuNDc0WiI.P4aw52msaw55nRYTe3jRehZ9TUfKQug4yZS-1MKLQ7w3iJwC-4WWIyF_AUXJklDAV2V4tnc3Bk9wpQ_IbkBhSg	2027-10-16 17:50:36+00
4	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTAtMTZUMTc6NTk6MDIuNTU4WiI.Ur0wdzmSYnzLOcBtN2v5zaRSFDj9E1zHDKfbtwWyZmdIrImuEw1z13f2zc93BzD5hGP5lQmAzBEZ9sMFWbPgDA	2027-10-16 17:59:02+00
5	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTAtMTZUMTg6MDQ6MzUuMjg0WiI.IxBHzBroc8JQSKati7fWVCW3YiMSuO31yHmO5IVKdvFTjEeBIRzzf8pq63sJ6mZVatdPSBuIQRPiDtToaOzalA	2027-10-16 18:04:35+00
6	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTFUMTE6MDE6MTcuOTgyWiI.BSC3UuhHEUBtTs40hEkOCm8TMv3ISYRQqsHuo9v5cKyJnKHuHQsrE9G7ktR_MOm9qCbBJ7spOcz055Y6yb03ig	2027-11-11 11:01:17+00
7	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTNUMDk6MDc6MTguODU4WiI.w2Zf3R4SMH36S7aeo4f0_UmV2UIUvQDAcEvPI5ufor0wfadzJ4G1sA49tU8nKxv_3HfmLCkQApv-ciEIBCfRng	2027-11-13 09:07:18+00
8	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTRUMDU6NTE6NTkuNDgyWiI.IcLLJjePP-npFv_IJGaVCpvYZdKgkQvVYk7V3wYZO5DybDIMCK3IfXf26Sn2JYceCevcLUKfzaYtcjYkEfiDEA	2027-11-14 05:51:59+00
9	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTRUMDk6NDg6MzEuMTQ0WiI.KxYKIRn2FzEqnvC1gg54gzQj0NSyUPYaKY0np7S_xn3hPF072wnAaPr6Z4_Eck7RA63pZycxzOTnZPHSYbo75A	2027-11-14 09:48:31+00
10	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTRUMTE6MjQ6MDUuNTQ1WiI.GUduUfdv1boHcodiRjcCfjcsl_AYI9lhYqa07IZoPmvB87P947tgTJ6s0bBGx-SuPCQdrdo1oXKG22yos3enFg	2027-11-14 11:24:05+00
11	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTRUMTk6NTE6MTkuMjY1WiI.Euqj2NaMcmA8KSuodhcAZQZrFQ4Z9IQbVgkapa69aEHeIM6lwmw_VOtrJrvD8ROkvrAVAeL_n9TUPWjezTRiyg	2027-11-14 19:51:19+00
12	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMThUMTU6MzA6MzcuNTcyWiI.qlQ8cNwJAJja_oQeE3qq9ABjY5dRlHObqinw9NKxkGOQr_Yt5Y694etlPKkraM-xTwQbyaMn-GPkthO7B5_Oyg	2027-11-18 15:30:37+00
13	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMThUMTU6MzE6MjIuMjA3WiI.oiDIC1UFSJyfpnFpPq0XuclGXG2Clfpi7-SmaOErfLlpn1tNwGe_Y7hK3aGC9BUYz0oNIrtzZW-ZBeHp1suXhg	2027-11-18 15:31:22+00
14	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMThUMTU6MzE6MjUuMTgwWiI.s1PvB2cVTU1_1hCN5X1hvCjf1Wh2EIb9OIdkXpLdWfasyAX_AhLeJY8jgDLSbIxla_8_uWylqDwg779iMR0P0g	2027-11-18 15:31:25+00
15	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTlUMDU6NDg6NDIuMjUyWiI.iMdNGR6IQjwdbAemtKo-6wN3_X8xGrFkGeg3HmFfAjSuQuEF6lROag8IYObMQO9DKVSOVAzLhArpuqH0sq2rqg	2027-11-19 05:48:42+00
16	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTlUMDU6NTY6MjkuOTUxWiI.F_dMZzmMHD1TNcFp92inJLwfypgVS9wT9a1MTwVPxN5IhLWrs6kENN7GUAqAZqd-gOG562s6DCQ6xHj1jC4i3A	2027-11-19 05:56:29+00
17	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMTlUMTM6MTQ6NTQuODA5WiI.hOmSoqyTAtbi6pud0U26UsUfjH2-7vamkzBPNk7dsPDSLnswfZ58aMu0VmJzZSsUqrbIYvWKdC7pZ5kZ31jl7w	2027-11-19 13:14:54+00
18	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjJUMTI6NDE6MzkuMDc1WiI.A-aL_qowk6tcfsLV8OircdKGG41lWirhcj2Fmpk9JCHzC3oeq23VjA9SdyiVPSfbrN9IZ2CTXyq48rkzTXjXLw	2027-11-22 12:41:39+00
19	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjJUMTU6MzU6MTcuNzc5WiI.I_5s25GmnzaAzuosxA3pWGpRUC4PNNvHVdmu2kMMPvEE7x7fC7gluJiX6eOiMn2sdhzUUjyqFjmAmTupgI7DIg	2027-11-22 15:35:17+00
20	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjVUMDk6Mzg6MDYuMzg0WiI.j5wEqWui1Vn2oWvTfO9467JiiljLA5l3ioduNAx07i7Ac-Uz3FYisAQqHRsaIkhI9Q-LfapwWKyRPmvLtIwMTw	2027-11-25 09:38:06+00
21	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjZUMDE6MTc6NTguMDExWiI.xtxjK-xbu0Q305gbJkN70A9rgPDKeru_CBjLOh1SNKkaKkS784E9IdPX5vmIxvAiQQ_d0SryNaU0uZ8Aoz7mdw	2027-11-26 01:17:58+00
22	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjZUMTA6NDA6MTIuNjA1WiI.XU-khbNnZ8f5bK7UpPc35dM-bthX2EVhsvet1F1NmYg3BNjikYvHvr7j_c5NldjRgehvtfUlkUwIQuGdIdJ33Q	2027-11-26 10:40:12+00
23	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjZUMTA6NDA6MjcuMjM5WiI.kKB58GFFbrqOSt-eIuGF9qta3CxAeLNM-Qz6Hor3zMGfwF0MVLwjqEAqt0UlU5nxDUSnacTJVlotQV328fiC-Q	2027-11-26 10:40:27+00
24	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjdUMTc6NTA6MTIuNzA1WiI.IWTvc564oL_JUWwSTTgJ5QISE8XiWG97pKp7YSQFRWci3_gv2xEweI2evRmSBFyU0NKazBF6oJbtR4WKZdduRw	2027-11-27 17:50:12+00
25	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjhUMDc6NDQ6NTMuNDQ2WiI.1boT8N6y473p6_PsFMHSTA5-PrWWQpQlTgscZotrN1JZTGuz9U6gIdHc3JUytxIZ-Wro7Aw05S4DxgK5nRqoXA	2027-11-28 07:44:53+00
26	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTEtMjhUMDk6MTI6MDEuNDIwWiI.sgQ9i3SYns6AVjPxuvu6yeM807IbqoYq8Z5xZw0R_a0RVI0o5mj8AsCsaGS5pmEiSDBbDig2hDg67Ycocj4xWw	2027-11-28 09:12:01+00
27	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTItMTlUMDk6MTE6MDguNDQyWiI.Q833MhpqriaUEGH5J1ac-ONqVGcCMSeBVDKkHifJArP6balmpWvpCKEheLC1DuaLChDq35H2ZOPWyViF2Ot_ow	2027-12-19 09:11:08+00
28	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTItMTlUMTA6MDY6NTEuMzU4WiI.7YWwPLWSV4jJT-vMzsJagXePUz6_BhosHXHS8t6pmSURwjH-Cuzb2QK_JLi3bDHd-oGF5U0avf_D7VbUMaw7rw	2027-12-19 10:06:51+00
29	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTItMjNUMDc6MTY6NTYuOTE4WiI.MXl4C-ia3pbN5vsdIN_Lpstr_d0zO3Dm5djT-m4rFqbI4Wo6Nl9Hnf8ZRMmMFb3AwusGb7IqkS-Xgm2BwDPglA	2027-12-23 07:16:56+00
30	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjctMTItMjNUMDc6MTc6MTEuNDExWiI.Cd_XQWzGhG3M7atR3QTsOsIdEjbbJoFTR_JQiD0XcpkWrpnsi7VMGqs6q5GQNhIJGAT9Id0PA_LZhHR6MHn-Yw	2027-12-23 07:17:11+00
31	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjktMDQtMjhUMjI6NDU6MTMuMTYxWiI.l-QugBwuw77O5ZkkclpuVxmAVeGDLkcLFxzvCogBtalHlIOdMjUr_a1aq3RbsHAU1pN_9Majquj3u1WBYxqabQ	2029-04-28 22:45:13+00
32	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjktMDUtMDRUMTM6MTA6MzQuNjc0WiI.b2HPsEg2sRi4Th_Dm4qqEhTnejPnXo71hkgzHxvD5uHQoINflL5MHixprKjDXUNt5AY7Rb36TG3KJM6wimwz9Q	2029-05-04 13:10:34+00
33	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjktMDUtMDVUMDk6Mjk6NDYuNzYzWiI.lviPXt7We2bzN76GWt6UNkaQ6f7IHU6njlTj6qekrt4QoTNvV5tVoFYltJ-IL7FxUhMo4zXqZrnYh88kMvvucw	2029-05-05 09:29:46+00
34	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.IjIwMjktMDUtMTFUMTg6MDQ6MjYuNTc4WiI.4EvGoP2dXfa8RFUrf76M5ZkD_Z--Sq2rza6u1nsHx9opJSXPr6fJGDszWaD-cyboDIxbB1x9vOUtyYbxZds2sg	2029-05-11 18:04:26+00
\.


--
-- Name: system_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.system_tokens_id_seq', 34, true);


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.tags (id, name) FROM stdin;
\.


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.tags_id_seq', 381, true);


--
-- Data for Name: task_attachments; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_attachments (id, task_id, file_name, path, "previewPath", author_id, size, type, created_at, deleted_at) FROM stdin;
1714	3093	главная и услуги.odt	uploads/tasksAttachments/3093/GPY/главная и услуги-1560414336903.odt	\N	102	26270	application/octet-stream	2019-06-13 08:25:36.903+00	\N
1715	3102	Снимок.PNG	uploads/tasksAttachments/3102/SKE/Снимок-1560421573601.PNG	uploads/tasksAttachments/3102/SKE/200-Снимок-1560421573601.PNG	212	26512	image/png	2019-06-13 10:26:14.773+00	\N
1716	3103	До.PNG	uploads/tasksAttachments/3103/M5P/До-1560422667175.PNG	uploads/tasksAttachments/3103/M5P/200-До-1560422667175.PNG	212	29453	image/png	2019-06-13 10:44:27.315+00	\N
1717	3103	После.PNG	uploads/tasksAttachments/3103/4HB/После-1560422667175.PNG	uploads/tasksAttachments/3103/4HB/200-После-1560422667175.PNG	212	38295	image/png	2019-06-13 10:44:27.321+00	\N
1718	3109	2019-06-13_16-24-35.png	uploads/tasksAttachments/3109/9M4/2019-06-13_16-24-35-1560428655344.png	uploads/tasksAttachments/3109/9M4/200-2019-06-13_16-24-35-1560428655344.png	266	93909	image/png	2019-06-13 12:24:15.986+00	\N
1719	3113	CP RatesNet v4 (2).ppt	uploads/tasksAttachments/3113/JS5/CP RatesNet v4 (2)-1560438322499.ppt	\N	102	684032	application/octet-stream	2019-06-13 15:05:22.5+00	\N
1720	3115	prox_psp_xml_1.1.1.pdf	uploads/tasksAttachments/3115/143/prox_psp_xml_1.1.1-1560438649819.pdf	\N	102	399096	application/pdf	2019-06-13 15:10:49.819+00	\N
1721	3115	PSP specification.pdf	uploads/tasksAttachments/3115/01I/PSP specification-1560438655732.pdf	\N	102	88164	application/pdf	2019-06-13 15:10:55.733+00	\N
1722	3083	5dH7JWgEzSs.jpg	uploads/tasksAttachments/3083/D58/5dH7JWgEzSs-1560462701195.jpg	uploads/tasksAttachments/3083/D58/200-5dH7JWgEzSs-1560462701195.jpg	183	27428	image/jpeg	2019-06-13 21:51:42.492+00	2019-06-13 21:55:54.406+00
1723	3116	karbit.png	uploads/tasksAttachments/3116/QTR/karbit-1560463112872.png	uploads/tasksAttachments/3116/QTR/200-karbit-1560463112872.png	183	4931031	image/png	2019-06-13 21:58:33.922+00	\N
1724	3119	Снимок.PNG	uploads/tasksAttachments/3119/O6Y/Снимок-1560500020944.PNG	uploads/tasksAttachments/3119/O6Y/200-Снимок-1560500020944.PNG	212	7215	image/png	2019-06-14 08:13:42.281+00	\N
1725	3120	Снимок2.PNG	uploads/tasksAttachments/3120/E85/Снимок2-1560502221858.PNG	uploads/tasksAttachments/3120/E85/200-Снимок2-1560502221858.PNG	212	5839	image/png	2019-06-14 08:50:22.239+00	\N
1726	3131	2019-06-13 17-12-10 (94).jpeg	uploads/tasksAttachments/3131/5EL/2019-06-13 17-12-10 (94)-1560517730574.jpeg	uploads/tasksAttachments/3131/5EL/200-2019-06-13 17-12-10 (94)-1560517730574.jpeg	102	2246908	image/jpeg	2019-06-14 13:08:57.46+00	\N
1727	3137	photo_2019-06-14_17-23-29.jpg	uploads/tasksAttachments/3137/CQT/photo_2019-06-14_17-23-29-1560518621818.jpg	uploads/tasksAttachments/3137/CQT/200-photo_2019-06-14_17-23-29-1560518621818.jpg	102	136074	image/jpeg	2019-06-14 13:23:44.842+00	\N
1728	3138	photo_2019-06-14_17-41-47.jpg	uploads/tasksAttachments/3138/0VJ/photo_2019-06-14_17-41-47-1560519728110.jpg	uploads/tasksAttachments/3138/0VJ/200-photo_2019-06-14_17-41-47-1560519728110.jpg	102	20791	image/jpeg	2019-06-14 13:42:09.811+00	\N
1729	3143	Снимок3.PNG	uploads/tasksAttachments/3143/5CD/Снимок3-1560674755003.PNG	uploads/tasksAttachments/3143/5CD/200-Снимок3-1560674755003.PNG	212	66622	image/png	2019-06-16 08:45:56.088+00	\N
1730	3137	photo_2019-06-14_17-23-29.jpg	uploads/tasksAttachments/3137/GTY/photo_2019-06-14_17-23-29-1560689030973.jpg	uploads/tasksAttachments/3137/GTY/200-photo_2019-06-14_17-23-29-1560689030973.jpg	336	267850	image/jpeg	2019-06-16 12:43:51.175+00	\N
1731	3147	photo_2019-06-16_20-09-08.jpg	uploads/tasksAttachments/3147/2FG/photo_2019-06-16_20-09-08-1560706423707.jpg	uploads/tasksAttachments/3147/2FG/200-photo_2019-06-16_20-09-08-1560706423707.jpg	239	11502	image/jpeg	2019-06-16 17:33:43.736+00	\N
1732	3149	photo_2019-06-16_20-14-15.jpg	uploads/tasksAttachments/3149/06L/photo_2019-06-16_20-14-15-1560706570466.jpg	uploads/tasksAttachments/3149/06L/200-photo_2019-06-16_20-14-15-1560706570466.jpg	239	61112	image/jpeg	2019-06-16 17:36:10.507+00	\N
1733	3171	1.PNG	uploads/tasksAttachments/3171/CC8/1-1560764614244.PNG	uploads/tasksAttachments/3171/CC8/200-1-1560764614244.PNG	212	69659	image/png	2019-06-17 09:43:35.06+00	\N
1734	3171	2.PNG	uploads/tasksAttachments/3171/JTE/2-1560765667935.PNG	uploads/tasksAttachments/3171/JTE/200-2-1560765667935.PNG	212	91618	image/png	2019-06-17 10:01:07.978+00	\N
1735	3171	3.PNG	uploads/tasksAttachments/3171/B0B/3-1560765710649.PNG	uploads/tasksAttachments/3171/B0B/200-3-1560765710649.PNG	212	64388	image/png	2019-06-17 10:01:50.693+00	\N
1736	3173	4.PNG	uploads/tasksAttachments/3173/7DC/4-1560766018203.PNG	uploads/tasksAttachments/3173/7DC/200-4-1560766018203.PNG	212	17930	image/png	2019-06-17 10:06:58.241+00	\N
1737	3174	5.PNG	uploads/tasksAttachments/3174/69J/5-1560767219349.PNG	uploads/tasksAttachments/3174/69J/200-5-1560767219349.PNG	212	19042	image/png	2019-06-17 10:26:59.394+00	\N
1738	3114	Техническая концепия.docx	uploads/tasksAttachments/3114/8JL/Техническая концепия-1560847678182.docx	\N	102	13248	application/octet-stream	2019-06-18 08:47:58.182+00	\N
1739	3195	Снимок экрана 2019-06-18 в 16.19.35.png	uploads/tasksAttachments/3195/ESI/Снимок экрана 2019-06-18 в 16.19.35-1560860401456.png	uploads/tasksAttachments/3195/ESI/200-Снимок экрана 2019-06-18 в 16.19.35-1560860401456.png	183	152428	image/png	2019-06-18 12:20:07.07+00	\N
1740	3195	Снимок экрана 2019-06-18 в 16.24.59.png	uploads/tasksAttachments/3195/6VR/Снимок экрана 2019-06-18 в 16.24.59-1560860728021.png	uploads/tasksAttachments/3195/6VR/200-Снимок экрана 2019-06-18 в 16.24.59-1560860728021.png	183	103378	image/png	2019-06-18 12:25:31.178+00	\N
1741	3194	photo_2019-06-19_13-12-39.jpg	uploads/tasksAttachments/3194/JU9/photo_2019-06-19_13-12-39-1560935481086.jpg	uploads/tasksAttachments/3194/JU9/200-photo_2019-06-19_13-12-39-1560935481086.jpg	266	43112	image/jpeg	2019-06-19 09:11:21.385+00	\N
1742	3168	2019-06-19_18-09-32.png	uploads/tasksAttachments/3168/44P/2019-06-19_18-09-32-1560953307631.png	uploads/tasksAttachments/3168/44P/200-2019-06-19_18-09-32-1560953307631.png	266	22161	image/png	2019-06-19 14:08:28.812+00	\N
\.


--
-- Name: task_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_attachments_id_seq', 1742, true);


--
-- Data for Name: task_histories; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_histories (id, entity, entity_id, task_id, field, prev_value_str, value_str, prev_value_int, value_int, prev_value_date, value_date, value_float, prev_value_float, action, created_at, user_id, value_text, prev_value_text, value_boolean, prev_value_boolean, value_decimal, prev_value_decimal) FROM stdin;
24046	Task	3080	3080	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 07:56:30.733+00	183	\N	\N	\N	\N	\N	\N
24047	Task	3081	3081	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 07:57:48.011+00	183	\N	\N	\N	\N	\N	\N
24048	Task	3082	3082	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:27:41.899+00	183	\N	\N	\N	\N	\N	\N
24049	Task	3083	3083	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 08:35:24.791+00	336	\N	\N	\N	\N	\N	\N
24050	Task	3084	3084	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:32:43.579+00	102	\N	\N	\N	\N	\N	\N
24051	Task	3082	3082	name	qwer123	Придумать название проекту	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:53:54.617+00	102	\N	\N	\N	\N	\N	\N
24052	Task	3082	3082	name	Придумать название проекту	Придумать название SimTrack	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:55:26.511+00	102	\N	\N	\N	\N	\N	\N
24053	Task	3082	3082	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:55:32.894+00	102	<p><br></p>	<p>qw</p>	\N	\N	\N	\N
24054	Task	3083	3083	name	zdfz	500 Ошибка на многих страницах ST	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:55:58.842+00	102	\N	\N	\N	\N	\N	\N
24055	Task	3083	3083	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-11 17:56:23.249+00	102	<p>Аватарки, история проекта</p>	<p>asdfadsf</p>	\N	\N	\N	\N
24056	Task	3085	3085	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:56:40.331+00	102	\N	\N	\N	\N	\N	\N
24057	Task	3086	3086	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:56:53.48+00	102	\N	\N	\N	\N	\N	\N
24058	Task	3087	3087	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:57:09.492+00	102	\N	\N	\N	\N	\N	\N
24059	Task	3088	3088	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:57:23.67+00	102	\N	\N	\N	\N	\N	\N
24060	Task	3089	3089	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:57:41.677+00	102	\N	\N	\N	\N	\N	\N
24061	Task	3090	3090	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 17:57:57.909+00	102	\N	\N	\N	\N	\N	\N
24062	Task	3090	3090	performerId	\N	\N	\N	1	\N	\N	\N	\N	update	2019-06-11 18:28:27.285+00	102	\N	\N	\N	\N	\N	\N
24063	Task	3086	3086	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-11 18:28:55.408+00	102	\N	\N	\N	\N	\N	\N
24064	Task	3089	3089	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-11 18:29:11.182+00	102	\N	\N	\N	\N	\N	\N
24065	Task	3088	3088	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-11 18:29:16.075+00	102	\N	\N	\N	\N	\N	\N
24066	Task	3087	3087	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-11 18:29:28.99+00	102	\N	\N	\N	\N	\N	\N
24067	Task	3085	3085	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-11 18:29:34.323+00	102	\N	\N	\N	\N	\N	\N
24068	Task	3091	3091	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-11 18:30:06.445+00	102	\N	\N	\N	\N	\N	\N
24069	Task	3090	3090	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-12 17:51:42.204+00	1	\N	\N	\N	\N	\N	\N
24070	Task	3090	3090	statusId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-12 17:52:10.877+00	1	\N	\N	\N	\N	\N	\N
24071	Task	3090	3090	statusId	\N	\N	2	3	\N	\N	\N	\N	update	2019-06-12 19:25:42.721+00	1	\N	\N	\N	\N	\N	\N
24072	Task	3092	3092	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-12 19:32:00.421+00	1	\N	\N	\N	\N	\N	\N
24073	Task	3084	3084	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 08:00:07.643+00	239	\N	\N	\N	\N	\N	\N
24074	Task	3093	3093	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:25:02.251+00	102	\N	\N	\N	\N	\N	\N
24075	TaskAttachment	1714	3093	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:25:37.115+00	102	\N	\N	\N	\N	\N	\N
24076	Task	3093	3093	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-13 08:25:49.421+00	102	\N	\N	\N	\N	\N	\N
24077	Task	3094	3094	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:30:18.946+00	102	\N	\N	\N	\N	\N	\N
24078	Task	3095	3095	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:34:45.452+00	102	\N	\N	\N	\N	\N	\N
24079	Task	3095	3095	performerId	\N	\N	\N	1	\N	\N	\N	\N	update	2019-06-13 08:35:10.443+00	102	\N	\N	\N	\N	\N	\N
24080	Task	3096	3096	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:35:57.781+00	102	\N	\N	\N	\N	\N	\N
24081	Task	3097	3097	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:56:31.717+00	102	\N	\N	\N	\N	\N	\N
24082	Task	3098	3098	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 08:57:28.376+00	102	\N	\N	\N	\N	\N	\N
24083	Task	3097	3097	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 08:59:30.876+00	239	\N	\N	\N	\N	\N	\N
24084	Task	3095	3095	statusId	\N	\N	1	8	\N	\N	\N	\N	update	2019-06-13 09:21:09.788+00	1	\N	\N	\N	\N	\N	\N
24085	Task	3095	3095	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-13 09:21:11.637+00	1	\N	\N	\N	\N	\N	\N
24086	Task	3095	3095	statusId	\N	\N	10	1	\N	\N	\N	\N	update	2019-06-13 09:21:18.546+00	1	\N	\N	\N	\N	\N	\N
24087	Task	3095	3095	statusId	\N	\N	1	8	\N	\N	\N	\N	update	2019-06-13 09:21:20.421+00	1	\N	\N	\N	\N	\N	\N
24088	Task	3099	3099	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 09:33:38.396+00	1	\N	\N	\N	\N	\N	\N
24089	Task	3097	3097	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 09:42:00.704+00	239	\N	\N	\N	\N	\N	\N
24090	Task	3097	3097	performerId	\N	\N	239	\N	\N	\N	\N	\N	update	2019-06-13 09:42:00.704+00	239	\N	\N	\N	\N	\N	\N
24091	Task	3097	3097	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-13 09:42:14.319+00	239	\N	\N	\N	\N	\N	\N
24092	Task	3096	3096	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 09:44:03.704+00	239	\N	\N	\N	\N	\N	\N
24093	Task	3100	3100	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 09:47:43.406+00	102	\N	\N	\N	\N	\N	\N
24094	Task	3100	3095	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 09:47:43.406+00	102	\N	\N	\N	\N	\N	\N
24095	Task	3101	3101	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 09:49:28.85+00	102	\N	\N	\N	\N	\N	\N
24096	Task	3096	3096	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 09:50:39.011+00	239	\N	\N	\N	\N	\N	\N
24097	Task	3101	3101	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 09:56:44.453+00	266	\N	\N	\N	\N	\N	\N
24098	Task	3101	3101	performerId	\N	\N	266	\N	\N	\N	\N	\N	update	2019-06-13 09:56:44.453+00	266	\N	\N	\N	\N	\N	\N
24099	Task	3101	3101	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-13 09:56:56.569+00	266	\N	\N	\N	\N	\N	\N
24100	Task	3101	3101	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 09:58:30.18+00	266	\N	\N	\N	\N	\N	\N
24101	Task	3093	3093	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 09:59:50.841+00	266	\N	\N	\N	\N	\N	\N
24102	Task	3101	3101	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-13 10:00:25.58+00	266	\N	\N	\N	\N	\N	\N
24103	Task	3098	3098	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 10:01:22.326+00	212	\N	\N	\N	\N	\N	\N
24104	Task	3084	3084	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 10:07:50.741+00	239	\N	\N	\N	\N	\N	\N
24105	Task	3094	3094	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 10:08:47.48+00	239	\N	\N	\N	\N	\N	\N
24106	Task	3102	3102	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:23:37.628+00	212	\N	\N	\N	\N	\N	\N
24107	TaskAttachment	1715	3102	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:26:14.783+00	212	\N	\N	\N	\N	\N	\N
24108	Task	3101	3101	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 10:27:32.47+00	212	\N	\N	\N	\N	\N	\N
24109	Task	3103	3103	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:32:00.761+00	212	\N	\N	\N	\N	\N	\N
24110	Task	3102	3102	prioritiesId	\N	\N	5	1	\N	\N	\N	\N	update	2019-06-13 10:32:12.743+00	212	\N	\N	\N	\N	\N	\N
24111	Task	3102	3102	statusId	\N	\N	1	10	\N	\N	\N	\N	update	2019-06-13 10:32:23.35+00	212	\N	\N	\N	\N	\N	\N
24112	Task	3102	3102	statusId	\N	\N	10	1	\N	\N	\N	\N	update	2019-06-13 10:33:34.413+00	212	\N	\N	\N	\N	\N	\N
24113	TaskAttachment	1716	3103	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:44:27.335+00	212	\N	\N	\N	\N	\N	\N
24114	TaskAttachment	1717	3103	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:44:27.343+00	212	\N	\N	\N	\N	\N	\N
24115	Task	3104	3104	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 10:48:31.094+00	212	\N	\N	\N	\N	\N	\N
24116	Task	3094	3094	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 11:00:54.126+00	239	\N	\N	\N	\N	\N	\N
24117	Task	3100	3100	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:11:27.059+00	239	\N	\N	\N	\N	\N	\N
24118	Task	3103	3103	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:22:30.03+00	239	\N	\N	\N	\N	\N	\N
24119	Task	3103	3103	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-13 11:22:30.03+00	239	\N	\N	\N	\N	\N	\N
24120	Task	3102	3102	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:23:11.739+00	239	\N	\N	\N	\N	\N	\N
24121	Task	3102	3102	performerId	\N	\N	212	239	\N	\N	\N	\N	update	2019-06-13 11:23:11.739+00	239	\N	\N	\N	\N	\N	\N
24122	Task	3105	3105	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 11:56:58.449+00	186	\N	\N	\N	\N	\N	\N
24123	Task	3105	3105	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-13 11:57:04.452+00	186	\N	\N	\N	\N	\N	\N
24124	Task	3106	3106	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 11:58:01.552+00	186	\N	\N	\N	\N	\N	\N
24125	Task	3107	3107	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 11:58:28.434+00	186	\N	\N	\N	\N	\N	\N
24126	Task	3107	3107	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:58:33.133+00	186	\N	\N	\N	\N	\N	\N
24127	Task	3108	3108	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 11:59:02.974+00	186	\N	\N	\N	\N	\N	\N
24128	Task	3108	3108	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:59:06.448+00	186	\N	\N	\N	\N	\N	\N
24129	Task	3108	3108	statusId	\N	\N	3	9	\N	\N	\N	\N	update	2019-06-13 11:59:42.271+00	186	\N	\N	\N	\N	\N	\N
24130	Task	3099	3099	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 11:59:54.403+00	186	\N	\N	\N	\N	\N	\N
24131	Task	3099	3099	performerId	\N	\N	\N	186	\N	\N	\N	\N	update	2019-06-13 11:59:54.403+00	186	\N	\N	\N	\N	\N	\N
24132	Task	3102	3102	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 12:08:32.385+00	239	\N	\N	\N	\N	\N	\N
24133	Task	3102	3102	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:08:32.385+00	239	\N	\N	\N	\N	\N	\N
24134	Task	3102	3102	statusId	\N	\N	7	3	\N	\N	\N	\N	update	2019-06-13 12:08:42.159+00	239	\N	\N	\N	\N	\N	\N
24135	Task	3102	3102	performerId	\N	\N	212	239	\N	\N	\N	\N	update	2019-06-13 12:08:42.159+00	239	\N	\N	\N	\N	\N	\N
24136	Task	3102	3102	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 12:08:54.576+00	239	\N	\N	\N	\N	\N	\N
24137	Task	3102	3102	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:08:54.576+00	239	\N	\N	\N	\N	\N	\N
24138	Task	3103	3103	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 12:09:20.665+00	239	\N	\N	\N	\N	\N	\N
24139	Task	3103	3103	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:09:20.665+00	239	\N	\N	\N	\N	\N	\N
24140	Task	3096	3096	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:19:10.059+00	239	\N	\N	\N	\N	\N	\N
24141	Task	3094	3094	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:19:20.183+00	239	\N	\N	\N	\N	\N	\N
24142	Task	3084	3084	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:21:29.658+00	239	\N	\N	\N	\N	\N	\N
24143	Task	3097	3097	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 12:21:38.659+00	239	\N	\N	\N	\N	\N	\N
24144	Task	3109	3109	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 12:22:22.546+00	266	\N	\N	\N	\N	\N	\N
24145	TaskAttachment	1718	3109	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 12:24:15.997+00	266	\N	\N	\N	\N	\N	\N
24146	Task	3103	3103	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 12:26:13.881+00	212	\N	\N	\N	\N	\N	\N
24147	Task	3110	3110	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 12:27:43.259+00	266	\N	\N	\N	\N	\N	\N
24148	Task	3102	3102	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 12:30:13.849+00	212	\N	\N	\N	\N	\N	\N
24149	Task	3096	3096	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 12:31:38.568+00	212	\N	\N	\N	\N	\N	\N
24150	Task	3110	3110	name	Реализовать выпадающее меню для услуг	Реализовать выпадающее меню для услуг с 4 услугами	\N	\N	\N	\N	\N	\N	update	2019-06-13 12:53:01.606+00	266	\N	\N	\N	\N	\N	\N
24151	Task	3097	3097	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 13:30:25.429+00	212	\N	\N	\N	\N	\N	\N
24152	Task	3084	3084	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 13:40:55.936+00	212	\N	\N	\N	\N	\N	\N
24153	Task	3094	3094	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 13:43:11.027+00	212	\N	\N	\N	\N	\N	\N
24154	Task	3104	3104	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 14:08:10.35+00	239	\N	\N	\N	\N	\N	\N
24155	Task	3104	3104	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-13 14:08:10.35+00	239	\N	\N	\N	\N	\N	\N
24156	Task	3104	3104	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 14:22:22.609+00	239	\N	\N	\N	\N	\N	\N
24157	Task	3104	3104	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 14:22:22.609+00	239	\N	\N	\N	\N	\N	\N
24158	Task	3104	3104	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-13 14:23:28.479+00	212	\N	\N	\N	\N	\N	\N
24159	Task	3098	3098	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 14:23:44.337+00	212	\N	\N	\N	\N	\N	\N
24160	Task	3109	3109	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 14:24:55.815+00	239	\N	\N	\N	\N	\N	\N
24161	Task	3111	3111	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:41:26.973+00	102	\N	\N	\N	\N	\N	\N
24162	Task	3110	3110	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 14:42:48.551+00	239	\N	\N	\N	\N	\N	\N
24163	Task	3112	3112	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:55:34.557+00	102	\N	\N	\N	\N	\N	\N
24164	Task	3113	3113	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 14:59:21.033+00	102	\N	\N	\N	\N	\N	\N
24165	Task	3109	3109	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-13 14:59:57.216+00	239	\N	\N	\N	\N	\N	\N
24166	Task	3109	3109	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-13 14:59:57.216+00	239	\N	\N	\N	\N	\N	\N
24167	Task	3113	3113	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-13 15:02:03.972+00	102	<p>Клиент: Артем Бойко</p>\n<p>Тип: желтый</p>\n<p>Финансист, 16 лет в сфере финансов</p>\n<p><br></p>\n<p>Цель: создать стартап, заменяющий оффлайн работу. маркет-плейс для физ/юр лиц, стоимость инвестиции от 2000$</p>\n<p><br></p>\n<p>Исходников проекта нет, &nbsp;над проектом работали 2 фрилансера.</p>	<p><br></p>	\N	\N	\N	\N
24168	Task	3113	3113	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-13 15:05:06.061+00	102	<p>Клиент: Артем Бойко</p>\n<p>Тип: желтый</p>\n<p>Финансист, 16 лет в сфере финансов</p>\n<p><br></p>\n<p>Цель: создать стартап, заменяющий оффлайн работу. маркет-плейс для физ/юр лиц, стоимость инвестиции от 2000$</p>\n<p><br></p>\n<p>Исходников проекта нет, &nbsp;над проектом работали 2 фрилансера.</p>\n<p><br></p>\n<p>Закон о защите персональных данных :&nbsp;</p>\n<p>https://docs.google.com/document/d/1oREA7r4ylyQb2UUQu1ZILN78hLuYeMWcAE66n5wPvqQ/edit</p>\n<p><br></p>\n<p>UCP(для клиента): https://docs.google.com/document/d/17--2hcp7nKtp1oi90jkIXc-IsvuNgUU6UD1MNfIk1cM/edit</p>\n<p>&nbsp;</p>	<p>Клиент: Артем Бойко</p>\n<p>Тип: желтый</p>\n<p>Финансист, 16 лет в сфере финансов</p>\n<p><br></p>\n<p>Цель: создать стартап, заменяющий оффлайн работу. маркет-плейс для физ/юр лиц, стоимость инвестиции от 2000$</p>\n<p><br></p>\n<p>Исходников проекта нет, &nbsp;над проектом работали 2 фрилансера.</p>	\N	\N	\N	\N
24169	TaskAttachment	1719	3113	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 15:05:22.509+00	102	\N	\N	\N	\N	\N	\N
24170	Task	3113	3113	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 15:06:03.756+00	102	\N	\N	\N	\N	\N	\N
24171	Task	3113	3113	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-13 15:06:03.756+00	102	\N	\N	\N	\N	\N	\N
24172	Task	3114	3114	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 15:07:03.311+00	102	\N	\N	\N	\N	\N	\N
24173	Task	3114	3114	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-13 15:09:44.641+00	102	\N	\N	\N	\N	\N	\N
24174	Task	3113	3113	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-13 15:09:56.774+00	102	\N	\N	\N	\N	\N	\N
24175	Task	3115	3115	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 15:10:16.764+00	102	\N	\N	\N	\N	\N	\N
24176	TaskAttachment	1720	3115	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 15:10:49.85+00	102	\N	\N	\N	\N	\N	\N
24177	TaskAttachment	1721	3115	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 15:10:55.762+00	102	\N	\N	\N	\N	\N	\N
24178	Task	3115	3115	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-13 15:12:44.229+00	102	<p>Тип: красный</p>\n<p><br></p>\n<p>Концепция: https://docs.google.com/document/d/1NeY0C2zHByAlCXuXE5S7uei_dbQ3O_Sy8tGhoDQN3Jc/edit</p>\n<p>Роудмап: https://docs.google.com/document/d/10iawmR0vP6ycTFUkw_VWHEFQ7Z7kX6B6-Tqve4s10Ow/edit</p>\n<p>Оценка: https://docs.google.com/spreadsheets/d/1mSs74MB4datr2i-MjTyXZSuGBb6yiyAU0En6npE9ECY/edit#gid=902801002</p>\n<p><br></p>	<p><br></p>	\N	\N	\N	\N
24179	Task	3115	3115	statusId	\N	\N	1	8	\N	\N	\N	\N	update	2019-06-13 15:15:13.494+00	102	\N	\N	\N	\N	\N	\N
24180	TaskAttachment	1722	3083	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 21:51:42.561+00	183	\N	\N	\N	\N	\N	\N
24181	TaskAttachment	1722	3083	deleted_at	\N	\N	\N	\N	\N	2019-06-13 21:55:54.406+00	\N	\N	update	2019-06-13 21:55:54.427+00	183	\N	\N	\N	\N	\N	\N
24182	Task	3116	3116	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 21:56:21.675+00	183	\N	\N	\N	\N	\N	\N
24183	TaskAttachment	1723	3116	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 21:58:33.932+00	183	\N	\N	\N	\N	\N	\N
24184	Task	3116	3116	statusId	\N	\N	1	8	\N	\N	\N	\N	update	2019-06-13 21:59:16.865+00	183	\N	\N	\N	\N	\N	\N
24185	TaskTask	352	3083	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 22:00:23.47+00	183	\N	\N	\N	\N	\N	\N
24186	TaskTask	353	3106	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-13 22:00:23.475+00	183	\N	\N	\N	\N	\N	\N
24187	Task	3117	3117	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 06:48:17.704+00	102	\N	\N	\N	\N	\N	\N
24188	Task	3117	3117	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 06:50:50.826+00	102	\N	\N	\N	\N	\N	\N
24189	Task	3117	3117	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-14 06:50:50.826+00	102	\N	\N	\N	\N	\N	\N
24190	Task	3118	3118	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 06:51:30.452+00	102	\N	\N	\N	\N	\N	\N
24191	Task	3118	3118	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-14 06:51:36.52+00	102	\N	\N	\N	\N	\N	\N
24192	Task	3109	3109	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 07:26:48.845+00	212	\N	\N	\N	\N	\N	\N
24193	Task	3111	3111	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-14 08:00:26.958+00	239	\N	\N	\N	\N	\N	\N
24194	Task	3111	3111	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 08:00:26.958+00	239	\N	\N	\N	\N	\N	\N
24195	Task	3111	3111	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 08:02:24.142+00	212	\N	\N	\N	\N	\N	\N
24196	Task	3110	3110	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 08:03:33.196+00	239	\N	\N	\N	\N	\N	\N
24197	Task	3110	3110	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 08:03:33.196+00	239	\N	\N	\N	\N	\N	\N
24198	Task	3112	3112	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-14 08:05:56.077+00	239	\N	\N	\N	\N	\N	\N
24199	Task	3112	3112	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 08:06:09.731+00	239	\N	\N	\N	\N	\N	\N
24200	Task	3100	3100	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 08:08:14.677+00	239	\N	\N	\N	\N	\N	\N
24201	Task	3100	3100	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 08:08:14.677+00	239	\N	\N	\N	\N	\N	\N
24202	Task	3112	3112	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 08:08:25.56+00	212	\N	\N	\N	\N	\N	\N
24203	Task	3119	3119	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 08:13:32.381+00	212	\N	\N	\N	\N	\N	\N
24204	TaskAttachment	1724	3119	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 08:13:42.297+00	212	\N	\N	\N	\N	\N	\N
24205	Task	3110	3110	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 08:16:35.251+00	212	\N	\N	\N	\N	\N	\N
24206	Task	3120	3120	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 08:50:12.398+00	212	\N	\N	\N	\N	\N	\N
24207	TaskAttachment	1725	3120	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 08:50:22.3+00	212	\N	\N	\N	\N	\N	\N
24208	Task	3121	3121	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 08:57:47.666+00	102	\N	\N	\N	\N	\N	\N
24209	Task	3121	3121	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 09:03:49.934+00	102	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. Отзеркалить фотку Носкова, чтобы продавцы смотрели друг на друга, сделать крупнее фоточки</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. Отзеркалить фотку Носкова, чтобы продавцы смотрели друг на друга</p>\n<p><br></p>	\N	\N	\N	\N
24210	Task	3121	3121	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 09:04:21.474+00	102	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. Отзеркалить фотку Носкова, чтобы продавцы смотрели друг на друга, сделать крупнее фоточки</p>\n<p><br></p>\n<p>7. http://joxi.ru/VrwLZVLi7544Pm то есть если фотка справа, то полоска слева и наоборот</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. Отзеркалить фотку Носкова, чтобы продавцы смотрели друг на друга, сделать крупнее фоточки</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	\N	\N	\N	\N
24211	Task	3121	3121	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 09:04:32.715+00	102	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. http://joxi.ru/VrwLZVLi7544Pm то есть если фотка справа, то полоска слева и наоборот</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. Отзеркалить фотку Носкова, чтобы продавцы смотрели друг на друга, сделать крупнее фоточки</p>\n<p><br></p>\n<p>7. http://joxi.ru/VrwLZVLi7544Pm то есть если фотка справа, то полоска слева и наоборот</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	\N	\N	\N	\N
24212	Task	3121	3121	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 09:14:00.535+00	239	\N	\N	\N	\N	\N	\N
24213	Task	3122	3122	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 10:25:58.294+00	102	\N	\N	\N	\N	\N	\N
24214	Task	3119	3119	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-14 10:27:17.204+00	239	\N	\N	\N	\N	\N	\N
24215	Task	3123	3123	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 10:32:45.141+00	102	\N	\N	\N	\N	\N	\N
24333	Task	3140	3140	performerId	\N	\N	239	\N	\N	\N	\N	\N	update	2019-06-15 07:37:54.956+00	239	\N	\N	\N	\N	\N	\N
24335	Task	3120	3120	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-15 20:43:25.575+00	239	\N	\N	\N	\N	\N	\N
24216	Task	3123	3123	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:33:00.089+00	102	<p>1. убиваем страницу http://docker.nordclan:8000/mvp/ и данный пункт меню</p>\n<p>2. Делаем один пункт меню "Разработка ПО и создание MVP"</p>\n<p>ссылка http://docker.nordclan:8000/development/</p>	<p>1. убиваем страницу http://docker.nordclan:8000/mvp/</p>\n<p>2. Делаем один пункт меню "Разработка ПО и создание MVP"</p>\n<p>ссылка http://docker.nordclan:8000/development/</p>	\N	\N	\N	\N
24217	Task	3123	3123	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:33:13.388+00	102	<p>1. убиваем страницу http://docker.nordclan:8000/mvp/ и данный пункт меню</p>\n<p>2. Делаем один пункт меню "Разработка ПО и создание MVP"</p>\n<p>ссылка http://docker.nordclan:8000/development/</p>\n<p>Идет первым</p>	<p>1. убиваем страницу http://docker.nordclan:8000/mvp/ и данный пункт меню</p>\n<p>2. Делаем один пункт меню "Разработка ПО и создание MVP"</p>\n<p>ссылка http://docker.nordclan:8000/development/</p>	\N	\N	\N	\N
24218	Task	3124	3124	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 10:40:26.16+00	102	\N	\N	\N	\N	\N	\N
24219	Task	3123	3123	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 10:42:52.2+00	266	\N	\N	\N	\N	\N	\N
24220	Task	3123	3123	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 10:43:12.807+00	266	\N	\N	\N	\N	\N	\N
24221	Task	3123	3123	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 10:43:24.248+00	266	\N	\N	\N	\N	\N	\N
24222	Task	3124	3124	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 10:43:47.721+00	102	\N	\N	\N	\N	\N	\N
24223	Task	3113	3113	name	Rates.net	Носков. Rates.net	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:57:38.398+00	102	\N	\N	\N	\N	\N	\N
24224	Task	3115	3115	name	PSP Весы	Краснов. PSP Весы	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:57:47.998+00	102	\N	\N	\N	\N	\N	\N
24225	Task	3115	3115	name	Краснов. PSP Весы	Краснов. PSP Весы - отказ	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:57:55.055+00	102	\N	\N	\N	\N	\N	\N
24226	Task	3117	3117	name	SkyEng	Артамонов. SkyEng	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:58:09.379+00	102	\N	\N	\N	\N	\N	\N
24227	Task	3114	3114	name	Леонид Плетнев	Краснов. Леонид Плетнев	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:58:25.362+00	102	\N	\N	\N	\N	\N	\N
24228	Task	3118	3118	name	DiaSoft	Краснов. DiaSoft	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:58:36.786+00	102	\N	\N	\N	\N	\N	\N
24229	Task	3118	3118	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 10:59:53.281+00	102	<p>https://www.diasoft.ru/</p>\n<p><br></p>\n<p>Будут делать внутренний продукт, mvp. Сейчас в процессе получения аппрува на разработку</p>	<p>https://www.diasoft.ru/</p>	\N	\N	\N	\N
24230	Task	3118	3118	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 11:00:07.164+00	102	\N	\N	\N	\N	\N	\N
24231	Task	3123	3123	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 11:05:03.344+00	212	\N	\N	\N	\N	\N	\N
24232	Task	3119	3119	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 11:28:19.699+00	212	\N	\N	\N	\N	\N	\N
24233	Task	3122	3122	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-14 11:40:25.884+00	239	\N	\N	\N	\N	\N	\N
24234	Task	3122	3122	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 11:40:25.884+00	239	\N	\N	\N	\N	\N	\N
24235	Task	3122	3122	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 11:41:36.797+00	212	\N	\N	\N	\N	\N	\N
24236	Task	3100	3100	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 11:51:27.681+00	212	\N	\N	\N	\N	\N	\N
24237	Task	3125	3125	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 12:51:50.744+00	102	\N	\N	\N	\N	\N	\N
24238	Task	3125	3125	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 12:58:06.493+00	102	<p>1. Блок Услуги</p>\n<p>сменить иконки. http://joxi.ru/5mdxedxt3KqoJm</p>\n<p>В "Нас выбирают, потому что" все картинки оставляем как есть</p>\n<p><br></p>\n<p>2. http://joxi.ru/bmoGjxGS3jOg7m</p>\n<p>Блок заголовка ВЫШЕ фоточек</p>\n<p><br></p>\n<p>3.&nbsp;</p>\n<p><br></p>	<p>1. Блок Услуги</p>\n<p>сменить иконки. http://joxi.ru/5mdxedxt3KqoJm</p>\n<p>В "Нас выбирают, потому что" все картинки оставляем как есть</p>\n<p><br></p>	\N	\N	\N	\N
24239	Task	3126	3126	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 12:59:36.871+00	102	\N	\N	\N	\N	\N	\N
24240	Task	3127	3127	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 12:59:51.561+00	102	\N	\N	\N	\N	\N	\N
24241	Task	3128	3128	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:01:06.032+00	102	\N	\N	\N	\N	\N	\N
24242	Task	3125	3125	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:02:12.653+00	102	<p>1. Блок Услуги</p>\n<p>сменить иконки. http://joxi.ru/5mdxedxt3KqoJm</p>\n<p>В "Нас выбирают, потому что" все картинки оставляем как есть</p>\n<p><br></p>\n<p>2. http://joxi.ru/bmoGjxGS3jOg7m</p>\n<p>Блок заголовка ВЫШЕ фоточек</p>\n<p><br></p>\n<p>3.&nbsp;Страница о нас:</p>\n<p>- фотки выровнять по верху цитаты</p>\n<p>- тексты в кавычках все, которые от людей</p>\n<p>- вертикальная полоса на другой стороне от фото(дубликат)</p>\n<p><br></p>\n<p><br></p>	<p>1. Блок Услуги</p>\n<p>сменить иконки. http://joxi.ru/5mdxedxt3KqoJm</p>\n<p>В "Нас выбирают, потому что" все картинки оставляем как есть</p>\n<p><br></p>\n<p>2. http://joxi.ru/bmoGjxGS3jOg7m</p>\n<p>Блок заголовка ВЫШЕ фоточек</p>\n<p><br></p>\n<p>3.&nbsp;</p>\n<p><br></p>	\N	\N	\N	\N
24243	Task	3129	3129	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:02:29.502+00	102	\N	\N	\N	\N	\N	\N
24244	Task	3129	3129	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-14 13:02:34.21+00	102	\N	\N	\N	\N	\N	\N
24245	Task	3129	3129	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:04:13.72+00	102	<p>Текст о нас.&nbsp;</p>\n<p>Отбивка на новую строку и bold - ом</p>\n<p>- Я сделал вывод, что формирование отношений &nbsp;win-win, между исполнителем и заказчиком — это проактивный процесс.</p>\n<p>- Мы бережем время, свое и своих клиентов, поскольку считаем, что это бесценный ресурс.</p>\n<p>- Мы имеем преимущество на рынке за счет фокуса на оказании услуг по разработке программного обеспечения для финтеха, фудтеха, медицины и сельского хозяйства.</p>	<p><br></p>	\N	\N	\N	\N
24249	Task	3131	3131	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:08:01.513+00	102	\N	\N	\N	\N	\N	\N
24250	Task	3129	3129	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-14 13:08:09.737+00	266	\N	\N	\N	\N	\N	\N
24251	Task	3129	3129	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 13:08:09.737+00	266	\N	\N	\N	\N	\N	\N
24252	Task	3129	3129	statusId	\N	\N	7	3	\N	\N	\N	\N	update	2019-06-14 13:08:23.395+00	266	\N	\N	\N	\N	\N	\N
24253	Task	3129	3129	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-14 13:08:23.395+00	266	\N	\N	\N	\N	\N	\N
24256	TaskAttachment	1726	3131	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:08:57.668+00	102	\N	\N	\N	\N	\N	\N
24258	Task	3132	3132	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:09:34.083+00	102	\N	\N	\N	\N	\N	\N
24260	Task	3134	3134	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:11:55.439+00	102	\N	\N	\N	\N	\N	\N
24261	Task	3131	3131	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 13:12:47.652+00	266	\N	\N	\N	\N	\N	\N
24265	Task	3131	3131	statusId	\N	\N	2	3	\N	\N	\N	\N	update	2019-06-14 13:12:57.943+00	266	\N	\N	\N	\N	\N	\N
24266	Task	3131	3131	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 13:13:08.25+00	266	\N	\N	\N	\N	\N	\N
24268	Task	3135	3135	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:15:13.9+00	102	\N	\N	\N	\N	\N	\N
24270	Task	3136	3136	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:16:42.994+00	102	\N	\N	\N	\N	\N	\N
24334	Task	3140	3140	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-15 07:38:01.416+00	239	\N	\N	\N	\N	\N	\N
24246	Task	3129	3129	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:05:02.274+00	102	<p>Текст о нас.&nbsp;</p>\n<p><br></p>\n<p><br></p>\n<p>С кем мы работаем? - заголовком, большой текст</p>\n<p><br></p>\n<p><br></p>\n<p>Отбивка на новую строку и bold - ом</p>\n<p>- Я сделал вывод, что формирование отношений &nbsp;win-win, между исполнителем и заказчиком — это проактивный процесс.</p>\n<p>- Мы бережем время, свое и своих клиентов, поскольку считаем, что это бесценный ресурс.</p>\n<p>- Мы имеем преимущество на рынке за счет фокуса на оказании услуг по разработке программного обеспечения для финтеха, фудтеха, медицины и сельского хозяйства.</p>	<p>Текст о нас.&nbsp;</p>\n<p>Отбивка на новую строку и bold - ом</p>\n<p>- Я сделал вывод, что формирование отношений &nbsp;win-win, между исполнителем и заказчиком — это проактивный процесс.</p>\n<p>- Мы бережем время, свое и своих клиентов, поскольку считаем, что это бесценный ресурс.</p>\n<p>- Мы имеем преимущество на рынке за счет фокуса на оказании услуг по разработке программного обеспечения для финтеха, фудтеха, медицины и сельского хозяйства.</p>	\N	\N	\N	\N
24247	Task	3130	3130	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:05:33.99+00	102	\N	\N	\N	\N	\N	\N
24248	Task	3130	3130	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:05:53.746+00	102	<p>http://docker.nordclan:8000/contacts/</p>\n<p>Нужна подложка для</p>\n<p>"Однажды поработав с нами, 95% клиентов обращаются повторно — это значит, что с нами они уверены в получении лучшего ИТ-решения для нужд своего бизнеса!</p>\n<p>Половина наших новых клиентов — это обращения по рекомендациям.</p>\n<p>Обычно рекомендуют тех, чьей работой остались довольны."</p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>	<p>http://docker.nordclan:8000/contacts/</p>\n<p><br></p>\n<p>"Однажды поработав с нами, 95% клиентов обращаются повторно — это значит, что с нами они уверены в получении лучшего ИТ-решения для нужд своего бизнеса!</p>\n<p><br></p>\n<p>Половина наших новых клиентов — это обращения по рекомендациям.</p>\n<p><br></p>\n<p>Обычно рекомендуют тех, чьей работой остались довольны."</p>\n<p><br></p>\n<p><br></p>	\N	\N	\N	\N
24254	Task	3129	3129	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 13:08:32.335+00	266	\N	\N	\N	\N	\N	\N
24255	Task	3129	3129	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 13:08:38.385+00	266	\N	\N	\N	\N	\N	\N
24257	Task	3131	3131	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:09:00.092+00	102	<p>http://docker.nordclan:8000/our-work/</p>\n<p>заголовки&nbsp;</p>\n<p>"Вы всегда знаете, что происходит с продуктом и проектом:" и ниже подобные(всего 6 штук)</p>\n<p>шрифт большой, как заголовок.</p>\n<p>Разделители между ними как на главной http://joxi.ru/Vm6MV6Mt4X3Z1r</p>\n<p><br></p>\n<p>Добавить картинку у доски</p>	<p>http://docker.nordclan:8000/our-work/</p>\n<p>заголовки&nbsp;</p>\n<p>"Вы всегда знаете, что происходит с продуктом и проектом:" и ниже подобные(всего 6 штук)</p>\n<p>шрифт большой, как заголовок.</p>\n<p>Разделители между ними как на главной http://joxi.ru/Vm6MV6Mt4X3Z1r</p>	\N	\N	\N	\N
24259	Task	3133	3133	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:10:49.277+00	102	\N	\N	\N	\N	\N	\N
24262	Task	3131	3131	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 13:12:54.552+00	266	\N	\N	\N	\N	\N	\N
24263	Task	3131	3131	performerId	\N	\N	239	266	\N	\N	\N	\N	update	2019-06-14 13:12:54.552+00	266	\N	\N	\N	\N	\N	\N
24264	Task	3131	3131	statusId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:12:56.681+00	266	\N	\N	\N	\N	\N	\N
24267	Task	3134	3134	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:13:44.273+00	102	<p>Убрать этот текст с картинки полностью</p>\n<p>http://joxi.ru/E2p0Qz0t78vRX2</p>\n<p>убрать картинку</p>	<p>Убрать этот текст с картинки полностью</p>	\N	\N	\N	\N
24269	Task	3133	3133	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 13:16:06.713+00	266	\N	\N	\N	\N	\N	\N
24271	Task	3136	3136	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:23:00.642+00	102	<p>http://joxi.ru/zANNvdNTvV1pXA</p>\n<p>Напишите нам - это первый пункт меню. итого их 5</p>\n<p><br></p>\n<p>http://joxi.ru/eAOJvLJU97vyb2</p>\n<p>от Идеи - заголовок.&nbsp;</p>\n<p>Развить готовую систему - заголовок</p>	<p>http://joxi.ru/zANNvdNTvV1pXA</p>\n<p>Напишите нам - это первый пункт меню. итого их 5</p>	\N	\N	\N	\N
24272	Task	3137	3137	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:23:20.033+00	102	\N	\N	\N	\N	\N	\N
24273	TaskAttachment	1727	3137	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:23:45.236+00	102	\N	\N	\N	\N	\N	\N
24277	Task	3131	3131	performerId	\N	\N	239	266	\N	\N	\N	\N	update	2019-06-14 13:25:50.23+00	266	\N	\N	\N	\N	\N	\N
24278	Task	3140	3140	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:28:04.755+00	102	\N	\N	\N	\N	\N	\N
24274	Task	3137	3137	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:24:21.178+00	102	<p>Размещаем http://docker.nordclan:8000/contacts/</p>\n<p>- фотку отзеркалить и заблюрить фон</p>	<p><br></p>	\N	\N	\N	\N
24275	Task	3138	3138	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:25:20.308+00	102	\N	\N	\N	\N	\N	\N
24276	Task	3139	3139	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:25:49.222+00	102	\N	\N	\N	\N	\N	\N
24279	Task	3140	3140	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-14 13:28:10.929+00	102	\N	\N	\N	\N	\N	\N
24280	Task	3128	3128	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-14 13:28:19.97+00	102	\N	\N	\N	\N	\N	\N
24281	Task	3127	3127	name	Выделить форму обратной связи дизайном	Юдин. Выделить форму обратной связи дизайном	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:28:33.994+00	102	\N	\N	\N	\N	\N	\N
24282	Task	3125	3125	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-14 13:28:57.959+00	102	\N	\N	\N	\N	\N	\N
24283	Task	3136	3136	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 13:29:06.225+00	266	\N	\N	\N	\N	\N	\N
24284	Task	3124	3124	prioritiesId	\N	\N	2	1	\N	\N	\N	\N	update	2019-06-14 13:33:39.373+00	102	\N	\N	\N	\N	\N	\N
24285	Task	3134	3134	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:33:49.123+00	102	\N	\N	\N	\N	\N	\N
24286	Task	3120	3120	prioritiesId	\N	\N	3	4	\N	\N	\N	\N	update	2019-06-14 13:34:05.397+00	102	\N	\N	\N	\N	\N	\N
24287	Task	3133	3133	performerId	\N	\N	239	266	\N	\N	\N	\N	update	2019-06-14 13:34:20.879+00	102	\N	\N	\N	\N	\N	\N
24288	Task	3132	3132	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 13:34:26.803+00	266	\N	\N	\N	\N	\N	\N
24352	Task	3142	3142	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-16 08:24:54.709+00	212	\N	\N	\N	\N	\N	\N
24353	Task	3134	3134	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 08:26:16.178+00	212	\N	\N	\N	\N	\N	\N
24354	Task	3143	3143	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 08:45:45.551+00	212	\N	\N	\N	\N	\N	\N
24355	TaskAttachment	1729	3143	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 08:45:56.231+00	212	\N	\N	\N	\N	\N	\N
24289	Task	3135	3135	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:34:46.094+00	102	<p>Необходимо в портфолио добавить технические сведения</p>\n<p>по аналогии &nbsp;с&nbsp;</p>\n<p>Особенности проекта</p>\n<p><br></p>\n<p>Наличие комплекса NDVI (нормализованный относительный индекс растительности).</p>\n<p>Графическая поддержка карт точного земледелия.</p>\n<p>Интеграция с мессенджерами и сервисами погоды.</p>\n<p>Визуализация данных с использованием технологии Canvas для высокой производительности при отрисовке большого количества данных.</p>\n<p>Использование векторной графики при построении карт для детализации изображений без потери качества.</p>\n<p>Стек технологий OpenStreetMap, Java, Spring, React, Postgres.</p>	<p>Необходимо в кейсы добавить технические сведения</p>\n<p>по аналогии &nbsp;с&nbsp;</p>\n<p>Особенности проекта</p>\n<p><br></p>\n<p>Наличие комплекса NDVI (нормализованный относительный индекс растительности).</p>\n<p>Графическая поддержка карт точного земледелия.</p>\n<p>Интеграция с мессенджерами и сервисами погоды.</p>\n<p>Визуализация данных с использованием технологии Canvas для высокой производительности при отрисовке большого количества данных.</p>\n<p>Использование векторной графики при построении карт для детализации изображений без потери качества.</p>\n<p>Стек технологий OpenStreetMap, Java, Spring, React, Postgres.</p>	\N	\N	\N	\N
24290	Task	3135	3135	name	Добавить технологии и особенности проекта	Добавить технологии и особенности проекта ФудТех	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:35:19.008+00	102	\N	\N	\N	\N	\N	\N
24291	Task	3141	3141	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:35:53.966+00	102	\N	\N	\N	\N	\N	\N
24292	Task	3120	3120	performerId	\N	\N	212	239	\N	\N	\N	\N	update	2019-06-14 13:37:34.428+00	212	\N	\N	\N	\N	\N	\N
24293	Task	3128	3128	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:39:49.525+00	102	\N	\N	\N	\N	\N	\N
24294	Task	3140	3140	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:39:57.833+00	102	\N	\N	\N	\N	\N	\N
24295	Task	3137	3137	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:40:51.387+00	102	\N	\N	\N	\N	\N	\N
24296	Task	3138	3138	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-14 13:41:04.503+00	102	\N	\N	\N	\N	\N	\N
24297	Task	3137	3137	prioritiesId	\N	\N	2	4	\N	\N	\N	\N	update	2019-06-14 13:41:12.369+00	102	\N	\N	\N	\N	\N	\N
24298	Task	3129	3129	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-14 13:41:53.567+00	212	\N	\N	\N	\N	\N	\N
24299	TaskAttachment	1728	3138	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-14 13:42:09.966+00	102	\N	\N	\N	\N	\N	\N
24300	Task	3138	3138	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-14 13:43:03.996+00	102	<p>из воды - морской дьявол или щупальца.</p>\n<p>щупальца держат двух людей.</p>	<p>из воды - морской дьявол или щупальца)))</p>	\N	\N	\N	\N
24301	Task	3126	3126	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-14 13:43:41.618+00	102	\N	\N	\N	\N	\N	\N
24302	Task	3132	3132	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 18:28:01.577+00	266	\N	\N	\N	\N	\N	\N
24303	Task	3132	3132	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 18:28:01.577+00	266	\N	\N	\N	\N	\N	\N
24304	Task	3136	3136	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 18:29:29.573+00	266	\N	\N	\N	\N	\N	\N
24305	Task	3136	3136	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 18:29:29.573+00	266	\N	\N	\N	\N	\N	\N
24306	Task	3131	3131	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 18:30:47.891+00	266	\N	\N	\N	\N	\N	\N
24307	Task	3131	3131	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 18:30:47.891+00	266	\N	\N	\N	\N	\N	\N
24308	Task	3093	3093	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 18:31:29.354+00	266	\N	\N	\N	\N	\N	\N
24309	Task	3093	3093	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-14 18:31:29.354+00	266	\N	\N	\N	\N	\N	\N
24310	Task	3125	3125	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 18:34:48.632+00	266	\N	\N	\N	\N	\N	\N
24311	Task	3125	3125	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 18:51:43.321+00	266	\N	\N	\N	\N	\N	\N
24312	Task	3133	3133	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 18:52:01.345+00	266	\N	\N	\N	\N	\N	\N
24313	Task	3139	3139	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 19:00:01.913+00	266	\N	\N	\N	\N	\N	\N
24314	Task	3124	3124	performerId	\N	\N	266	239	\N	\N	\N	\N	update	2019-06-14 19:00:16.645+00	266	\N	\N	\N	\N	\N	\N
24315	Task	3134	3134	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 19:02:51.669+00	266	\N	\N	\N	\N	\N	\N
24316	Task	3124	3124	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 19:53:19.824+00	239	\N	\N	\N	\N	\N	\N
24317	Task	3124	3124	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 19:53:30.006+00	239	\N	\N	\N	\N	\N	\N
24318	Task	3124	3124	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 19:53:30.006+00	239	\N	\N	\N	\N	\N	\N
24319	Task	3125	3125	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 21:16:27.13+00	239	\N	\N	\N	\N	\N	\N
24320	Task	3125	3125	performerId	\N	\N	239	\N	\N	\N	\N	\N	update	2019-06-14 21:16:27.13+00	239	\N	\N	\N	\N	\N	\N
24321	Task	3125	3125	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-14 21:16:34.491+00	239	\N	\N	\N	\N	\N	\N
24322	Task	3121	3121	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 21:21:27.477+00	239	\N	\N	\N	\N	\N	\N
24323	Task	3121	3121	performerId	\N	\N	239	\N	\N	\N	\N	\N	update	2019-06-14 21:21:27.477+00	239	\N	\N	\N	\N	\N	\N
24324	Task	3121	3121	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-14 21:21:34.594+00	239	\N	\N	\N	\N	\N	\N
24325	Task	3140	3140	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 21:22:22.333+00	239	\N	\N	\N	\N	\N	\N
24326	Task	3139	3139	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 21:22:26.04+00	239	\N	\N	\N	\N	\N	\N
24327	Task	3133	3133	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-14 21:34:30.674+00	239	\N	\N	\N	\N	\N	\N
24328	Task	3139	3139	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 22:32:27.514+00	239	\N	\N	\N	\N	\N	\N
24329	Task	3139	3139	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 22:32:27.514+00	239	\N	\N	\N	\N	\N	\N
24330	Task	3133	3133	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-14 23:06:14.49+00	239	\N	\N	\N	\N	\N	\N
24331	Task	3133	3133	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-14 23:06:14.49+00	239	\N	\N	\N	\N	\N	\N
24332	Task	3140	3140	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-15 07:37:54.956+00	239	\N	\N	\N	\N	\N	\N
24336	Task	3120	3120	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-15 20:43:41.615+00	239	\N	\N	\N	\N	\N	\N
24337	Task	3120	3120	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-15 20:43:41.615+00	239	\N	\N	\N	\N	\N	\N
24338	Task	3128	3128	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-15 20:46:49.92+00	239	\N	\N	\N	\N	\N	\N
24339	Task	3126	3126	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-15 21:26:03.816+00	239	\N	\N	\N	\N	\N	\N
24340	Task	3134	3134	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-15 21:28:21.866+00	266	\N	\N	\N	\N	\N	\N
24341	Task	3134	3134	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-15 21:28:21.866+00	266	\N	\N	\N	\N	\N	\N
24342	Task	3124	3124	statusId	\N	\N	7	3	\N	\N	\N	\N	update	2019-06-16 07:32:43.398+00	212	\N	\N	\N	\N	\N	\N
24343	Task	3124	3124	performerId	\N	\N	212	239	\N	\N	\N	\N	update	2019-06-16 07:32:43.398+00	212	\N	\N	\N	\N	\N	\N
24344	Task	3132	3132	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 07:33:26.011+00	212	\N	\N	\N	\N	\N	\N
24345	Task	3120	3120	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 07:37:31.978+00	212	\N	\N	\N	\N	\N	\N
24346	Task	3133	3133	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 07:44:37.521+00	212	\N	\N	\N	\N	\N	\N
24347	Task	3124	3124	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 07:52:20.297+00	212	\N	\N	\N	\N	\N	\N
24348	Task	3124	3124	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 07:52:20.297+00	212	\N	\N	\N	\N	\N	\N
24349	Task	3124	3124	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 07:55:19.194+00	212	\N	\N	\N	\N	\N	\N
24350	Task	3136	3136	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 08:03:43.062+00	212	\N	\N	\N	\N	\N	\N
24351	Task	3142	3142	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 08:24:31.986+00	212	\N	\N	\N	\N	\N	\N
24356	Task	3143	3143	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-16 08:46:06.63+00	212	\N	\N	\N	\N	\N	\N
24357	Task	3125	3125	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 08:47:17.327+00	212	\N	\N	\N	\N	\N	\N
24358	Task	3093	3093	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 08:53:23.31+00	212	\N	\N	\N	\N	\N	\N
24359	Task	3139	3139	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 08:55:27.911+00	212	\N	\N	\N	\N	\N	\N
24360	Task	3141	3141	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 08:58:55.755+00	212	\N	\N	\N	\N	\N	\N
24361	Task	3121	3121	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 09:20:46.176+00	212	\N	\N	\N	\N	\N	\N
24362	Task	3140	3140	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 09:52:22.296+00	212	\N	\N	\N	\N	\N	\N
24363	Task	3128	3128	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 09:52:54.66+00	239	\N	\N	\N	\N	\N	\N
24364	Task	3128	3128	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 09:52:54.66+00	239	\N	\N	\N	\N	\N	\N
24365	Task	3143	3143	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-16 09:59:10.418+00	239	\N	\N	\N	\N	\N	\N
24366	Task	3143	3143	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 09:59:10.418+00	239	\N	\N	\N	\N	\N	\N
24367	Task	3142	3142	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 09:59:36.566+00	239	\N	\N	\N	\N	\N	\N
24368	Task	3128	3128	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 10:03:46.132+00	212	\N	\N	\N	\N	\N	\N
24369	Task	3143	3143	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 10:04:59.902+00	212	\N	\N	\N	\N	\N	\N
24370	Task	3131	3131	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 10:05:55.848+00	212	\N	\N	\N	\N	\N	\N
24371	Task	3138	3138	performerId	\N	\N	\N	336	\N	\N	\N	\N	update	2019-06-16 10:18:19.357+00	336	\N	\N	\N	\N	\N	\N
24372	Task	3127	3127	performerId	\N	\N	\N	336	\N	\N	\N	\N	update	2019-06-16 10:18:26.364+00	336	\N	\N	\N	\N	\N	\N
24373	Task	3130	3130	performerId	\N	\N	\N	336	\N	\N	\N	\N	update	2019-06-16 10:18:32.79+00	336	\N	\N	\N	\N	\N	\N
24374	Task	3137	3137	performerId	\N	\N	\N	336	\N	\N	\N	\N	update	2019-06-16 10:18:37.93+00	336	\N	\N	\N	\N	\N	\N
24375	Task	3138	3138	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 10:18:52.055+00	336	\N	\N	\N	\N	\N	\N
24376	Task	3141	3141	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 10:18:55.238+00	212	\N	\N	\N	\N	\N	\N
24377	Task	3127	3127	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 10:18:57.087+00	336	\N	\N	\N	\N	\N	\N
24378	Task	3127	3127	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-16 10:19:09.27+00	336	\N	\N	\N	\N	\N	\N
24379	Task	3127	3127	performerId	\N	\N	336	\N	\N	\N	\N	\N	update	2019-06-16 10:19:09.27+00	336	\N	\N	\N	\N	\N	\N
24380	Task	3135	3135	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 10:47:48.121+00	186	\N	\N	\N	\N	\N	\N
24381	Task	3135	3135	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 11:19:50.604+00	186	\N	\N	\N	\N	\N	\N
24382	Task	3135	3135	performerId	\N	\N	186	212	\N	\N	\N	\N	update	2019-06-16 11:19:50.604+00	186	\N	\N	\N	\N	\N	\N
24383	Task	3127	3127	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-16 11:20:57.132+00	336	\N	\N	\N	\N	\N	\N
24384	Task	3127	3127	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-16 11:21:11.956+00	336	\N	\N	\N	\N	\N	\N
24385	Task	3138	3138	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 11:22:07.47+00	336	\N	\N	\N	\N	\N	\N
24386	Task	3138	3138	performerId	\N	\N	336	212	\N	\N	\N	\N	update	2019-06-16 11:22:07.47+00	336	\N	\N	\N	\N	\N	\N
24387	Task	3142	3142	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 11:25:19.7+00	239	\N	\N	\N	\N	\N	\N
24388	Task	3142	3142	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 11:25:19.7+00	239	\N	\N	\N	\N	\N	\N
24389	Task	3135	3135	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-16 11:28:43.777+00	266	\N	\N	\N	\N	\N	\N
24390	Task	3135	3135	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 11:29:41.69+00	266	\N	\N	\N	\N	\N	\N
24391	Task	3141	3141	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-16 11:38:11.474+00	266	\N	\N	\N	\N	\N	\N
24392	Task	3141	3141	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 11:41:27.16+00	266	\N	\N	\N	\N	\N	\N
24393	Task	3142	3142	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-16 11:41:54.526+00	266	\N	\N	\N	\N	\N	\N
24394	Task	3142	3142	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-16 11:42:04.017+00	266	\N	\N	\N	\N	\N	\N
24395	Task	3137	3137	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 12:02:24.403+00	266	\N	\N	\N	\N	\N	\N
24396	Task	3137	3137	performerId	\N	\N	336	266	\N	\N	\N	\N	update	2019-06-16 12:02:24.403+00	266	\N	\N	\N	\N	\N	\N
24397	Task	3137	3137	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 12:02:48.393+00	266	\N	\N	\N	\N	\N	\N
24398	Task	3137	3137	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-16 12:02:48.393+00	266	\N	\N	\N	\N	\N	\N
24399	Task	3137	3137	name	Юдин. Заблюрить фон на фото	Заблюрить фон на фото	\N	\N	\N	\N	\N	\N	update	2019-06-16 12:03:22.007+00	266	\N	\N	\N	\N	\N	\N
24400	Task	3137	3137	name	Юдин. Заблюрить фон на фото	Заблюрить фон на фото	\N	\N	\N	\N	\N	\N	update	2019-06-16 12:03:22.065+00	266	\N	\N	\N	\N	\N	\N
24401	Task	3130	3130	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-16 12:41:54.638+00	336	\N	\N	\N	\N	\N	\N
24402	Task	3130	3130	performerId	\N	\N	336	212	\N	\N	\N	\N	update	2019-06-16 12:41:54.638+00	336	\N	\N	\N	\N	\N	\N
24403	TaskAttachment	1730	3137	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 12:43:51.197+00	336	\N	\N	\N	\N	\N	\N
24404	Task	3144	3144	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:30:00.938+00	239	\N	\N	\N	\N	\N	\N
24405	Task	3145	3145	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:30:37.236+00	239	\N	\N	\N	\N	\N	\N
24406	Task	3146	3146	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:31:34.081+00	239	\N	\N	\N	\N	\N	\N
24407	Task	3147	3147	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:32:38.077+00	239	\N	\N	\N	\N	\N	\N
24408	TaskAttachment	1731	3147	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:33:43.755+00	239	\N	\N	\N	\N	\N	\N
24409	Task	3148	3148	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:34:47.243+00	239	\N	\N	\N	\N	\N	\N
24410	Task	3149	3149	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:35:35.657+00	239	\N	\N	\N	\N	\N	\N
24411	TaskAttachment	1732	3149	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:36:10.52+00	239	\N	\N	\N	\N	\N	\N
24412	Task	3150	3150	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:36:57.367+00	239	\N	\N	\N	\N	\N	\N
24413	Task	3151	3151	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:37:47.573+00	239	\N	\N	\N	\N	\N	\N
24414	Task	3152	3152	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:38:18.721+00	239	\N	\N	\N	\N	\N	\N
24415	Task	3153	3153	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:39:06.967+00	239	\N	\N	\N	\N	\N	\N
24416	Task	3154	3154	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:39:44.106+00	239	\N	\N	\N	\N	\N	\N
24417	Task	3155	3155	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 17:40:32.728+00	239	\N	\N	\N	\N	\N	\N
24418	Task	3126	3126	sprintId	\N	\N	425	\N	\N	\N	\N	\N	update	2019-06-16 17:48:49.219+00	239	\N	\N	\N	\N	\N	\N
24419	Task	3144	3144	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 17:51:37.674+00	239	\N	\N	\N	\N	\N	\N
24420	Task	3145	3145	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 17:51:44.949+00	239	\N	\N	\N	\N	\N	\N
24421	Task	3155	3155	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 18:01:47.891+00	266	\N	\N	\N	\N	\N	\N
24422	Task	3149	3149	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 18:02:03.79+00	266	\N	\N	\N	\N	\N	\N
24423	Task	3155	3155	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 18:02:50.896+00	266	\N	\N	\N	\N	\N	\N
24424	Task	3155	3155	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-16 18:02:50.896+00	266	\N	\N	\N	\N	\N	\N
24425	Task	3149	3149	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 18:08:54.655+00	266	\N	\N	\N	\N	\N	\N
24426	Task	3149	3149	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-16 18:11:09.046+00	266	\N	\N	\N	\N	\N	\N
24427	Task	3150	3150	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 18:17:04.98+00	266	\N	\N	\N	\N	\N	\N
24428	Task	3150	3150	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 18:17:10.93+00	266	\N	\N	\N	\N	\N	\N
24429	Task	3150	3150	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-16 18:17:10.93+00	266	\N	\N	\N	\N	\N	\N
24430	Task	3156	3156	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 18:20:13.568+00	266	\N	\N	\N	\N	\N	\N
24431	Task	3157	3157	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 18:20:54.082+00	266	\N	\N	\N	\N	\N	\N
24432	Task	3158	3158	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 18:21:22.904+00	266	\N	\N	\N	\N	\N	\N
24433	Task	3159	3159	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-16 18:22:14.768+00	266	\N	\N	\N	\N	\N	\N
24434	Task	3144	3144	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 19:24:44.429+00	239	\N	\N	\N	\N	\N	\N
24435	Task	3144	3144	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 19:24:44.429+00	239	\N	\N	\N	\N	\N	\N
24436	Task	3145	3145	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 19:25:05.573+00	239	\N	\N	\N	\N	\N	\N
24437	Task	3145	3145	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 19:25:05.573+00	239	\N	\N	\N	\N	\N	\N
24438	Task	3147	3147	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 19:28:05.664+00	239	\N	\N	\N	\N	\N	\N
24439	Task	3158	3158	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 20:47:24.624+00	239	\N	\N	\N	\N	\N	\N
24440	Task	3151	3151	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 20:47:29.015+00	239	\N	\N	\N	\N	\N	\N
24441	Task	3152	3152	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 20:47:32.915+00	239	\N	\N	\N	\N	\N	\N
24442	Task	3159	3159	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-16 20:47:41.807+00	239	\N	\N	\N	\N	\N	\N
24443	Task	3147	3147	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 21:23:32.213+00	239	\N	\N	\N	\N	\N	\N
24444	Task	3147	3147	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 21:23:32.213+00	239	\N	\N	\N	\N	\N	\N
24445	Task	3158	3158	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 21:32:47.917+00	239	\N	\N	\N	\N	\N	\N
24446	Task	3158	3158	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 21:32:47.917+00	239	\N	\N	\N	\N	\N	\N
24447	Task	3152	3152	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 22:00:31.754+00	239	\N	\N	\N	\N	\N	\N
24448	Task	3152	3152	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 22:00:31.754+00	239	\N	\N	\N	\N	\N	\N
24449	Task	3151	3151	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 22:01:01.209+00	239	\N	\N	\N	\N	\N	\N
24450	Task	3151	3151	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 22:01:01.209+00	239	\N	\N	\N	\N	\N	\N
24451	Task	3159	3159	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-16 22:17:51.913+00	239	\N	\N	\N	\N	\N	\N
24452	Task	3159	3159	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-16 22:17:51.913+00	239	\N	\N	\N	\N	\N	\N
24453	Task	3160	3160	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 06:13:53.499+00	102	\N	\N	\N	\N	\N	\N
24454	Task	3161	3161	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 06:14:44.853+00	102	\N	\N	\N	\N	\N	\N
24455	Task	3162	3162	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 06:17:52.4+00	102	\N	\N	\N	\N	\N	\N
24456	Task	3161	3161	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-17 06:20:00.816+00	212	\N	\N	\N	\N	\N	\N
24457	Task	3161	3161	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 06:20:09.415+00	212	\N	\N	\N	\N	\N	\N
24458	Task	3161	3161	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 06:20:12.423+00	212	\N	\N	\N	\N	\N	\N
24459	Task	3161	3161	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:20:15.373+00	212	\N	\N	\N	\N	\N	\N
24460	Task	3088	3088	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-17 06:20:34.196+00	102	<p>http://joxi.ru/VrwLZVLi75wyVm</p>	<p><br></p>	\N	\N	\N	\N
24461	Task	3150	3150	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:20:47.513+00	212	\N	\N	\N	\N	\N	\N
24462	Task	3151	3151	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:21:07.028+00	212	\N	\N	\N	\N	\N	\N
24463	Task	3163	3163	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 06:22:09.208+00	102	\N	\N	\N	\N	\N	\N
24464	Task	3163	3163	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 06:22:14.732+00	102	\N	\N	\N	\N	\N	\N
24465	Task	3163	3163	performerId	\N	\N	\N	102	\N	\N	\N	\N	update	2019-06-17 06:22:14.732+00	102	\N	\N	\N	\N	\N	\N
24466	Task	3152	3152	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:22:19.14+00	212	\N	\N	\N	\N	\N	\N
24467	Task	3159	3159	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:24:24.09+00	212	\N	\N	\N	\N	\N	\N
24468	Task	3158	3158	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:38:09.819+00	212	\N	\N	\N	\N	\N	\N
24469	Task	3127	3127	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:38:33.91+00	212	\N	\N	\N	\N	\N	\N
24470	Task	3149	3149	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:40:28.126+00	212	\N	\N	\N	\N	\N	\N
24471	Task	3147	3147	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:41:10.148+00	212	\N	\N	\N	\N	\N	\N
24472	Task	3154	3154	prioritiesId	\N	\N	3	1	\N	\N	\N	\N	update	2019-06-17 06:42:41.617+00	102	\N	\N	\N	\N	\N	\N
24473	Task	3145	3145	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:43:29.796+00	212	\N	\N	\N	\N	\N	\N
24474	Task	3146	3146	prioritiesId	\N	\N	5	1	\N	\N	\N	\N	update	2019-06-17 06:44:18.743+00	102	\N	\N	\N	\N	\N	\N
24475	Task	3137	3137	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 06:44:23.835+00	212	\N	\N	\N	\N	\N	\N
24476	Task	3146	3146	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-17 06:44:27.067+00	102	\N	\N	\N	\N	\N	\N
24477	Task	3146	3146	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 06:51:26.438+00	212	\N	\N	\N	\N	\N	\N
24478	Task	3162	3162	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 07:20:28.653+00	266	\N	\N	\N	\N	\N	\N
24479	Task	3162	3162	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 07:21:02.758+00	266	\N	\N	\N	\N	\N	\N
24480	Task	3162	3162	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-17 07:21:02.758+00	266	\N	\N	\N	\N	\N	\N
24481	Task	3153	3153	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 07:21:53.537+00	239	\N	\N	\N	\N	\N	\N
24482	Task	3154	3154	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 07:22:12.718+00	239	\N	\N	\N	\N	\N	\N
24483	Task	3162	3162	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 07:23:07.965+00	212	\N	\N	\N	\N	\N	\N
24484	Task	3164	3164	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 07:31:22.84+00	102	\N	\N	\N	\N	\N	\N
24485	Task	3165	3165	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 07:32:03.238+00	102	\N	\N	\N	\N	\N	\N
24486	Task	3165	3165	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-17 07:32:11.794+00	102	\N	\N	\N	\N	\N	\N
24487	Task	3166	3166	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 07:32:53.726+00	102	\N	\N	\N	\N	\N	\N
24488	Task	3144	3144	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 07:54:47.602+00	212	\N	\N	\N	\N	\N	\N
24489	Task	3155	3155	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 07:55:30.574+00	212	\N	\N	\N	\N	\N	\N
24490	Task	3146	3146	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 08:38:53.868+00	212	\N	\N	\N	\N	\N	\N
24491	Task	3146	3146	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 08:39:00.981+00	212	\N	\N	\N	\N	\N	\N
24492	Task	3138	3138	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 08:39:59.172+00	212	\N	\N	\N	\N	\N	\N
24493	Task	3167	3167	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 08:42:26.889+00	102	\N	\N	\N	\N	\N	\N
24494	Task	3168	3168	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 08:42:52.762+00	102	\N	\N	\N	\N	\N	\N
24495	Task	3160	3160	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-17 08:43:09.71+00	266	\N	\N	\N	\N	\N	\N
24496	Task	3130	3130	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 08:45:54.266+00	212	\N	\N	\N	\N	\N	\N
24497	Task	3160	3160	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 08:50:52.679+00	239	\N	\N	\N	\N	\N	\N
24498	Task	3169	3169	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 08:59:45.895+00	102	\N	\N	\N	\N	\N	\N
24499	Task	3170	3170	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 09:16:30.629+00	102	\N	\N	\N	\N	\N	\N
24500	Task	3148	3148	statusId	\N	\N	1	9	\N	\N	\N	\N	update	2019-06-17 09:16:40.901+00	102	\N	\N	\N	\N	\N	\N
24501	Task	3169	3169	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:02.721+00	102	\N	\N	\N	\N	\N	\N
24502	Task	3167	3167	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:08.92+00	102	\N	\N	\N	\N	\N	\N
24503	Task	3166	3166	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:14.128+00	102	\N	\N	\N	\N	\N	\N
24504	Task	3157	3157	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:21.086+00	102	\N	\N	\N	\N	\N	\N
24505	Task	3168	3168	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:26.743+00	102	\N	\N	\N	\N	\N	\N
24506	Task	3156	3156	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-17 09:18:31.435+00	102	\N	\N	\N	\N	\N	\N
24507	Task	3126	3126	statusId	\N	\N	3	9	\N	\N	\N	\N	update	2019-06-17 09:19:08.849+00	102	\N	\N	\N	\N	\N	\N
24508	Task	3160	3160	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 09:26:07.363+00	239	\N	\N	\N	\N	\N	\N
24509	Task	3160	3160	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-17 09:26:07.363+00	239	\N	\N	\N	\N	\N	\N
24510	Task	3154	3154	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 09:27:28.616+00	239	\N	\N	\N	\N	\N	\N
24511	Task	3154	3154	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-17 09:27:28.616+00	239	\N	\N	\N	\N	\N	\N
24512	Task	3160	3160	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 09:28:21.929+00	212	\N	\N	\N	\N	\N	\N
24513	Task	3164	3164	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 09:38:37.004+00	239	\N	\N	\N	\N	\N	\N
24514	Task	3171	3171	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 09:39:00.287+00	212	\N	\N	\N	\N	\N	\N
24515	Task	3153	3153	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 09:40:14.006+00	239	\N	\N	\N	\N	\N	\N
24516	Task	3153	3153	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-17 09:40:14.006+00	239	\N	\N	\N	\N	\N	\N
24517	Task	3153	3153	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 09:41:58+00	212	\N	\N	\N	\N	\N	\N
24518	Task	3154	3154	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 09:42:01.208+00	212	\N	\N	\N	\N	\N	\N
24519	Task	3171	3171	performerId	\N	\N	212	239	\N	\N	\N	\N	update	2019-06-17 09:42:14.448+00	212	\N	\N	\N	\N	\N	\N
24520	TaskAttachment	1733	3171	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 09:43:35.102+00	212	\N	\N	\N	\N	\N	\N
24521	Task	3172	3172	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 09:44:47.197+00	183	\N	\N	\N	\N	\N	\N
24522	Task	3165	3165	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 09:55:25.868+00	266	\N	\N	\N	\N	\N	\N
24523	Task	3165	3165	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 09:56:07.892+00	266	\N	\N	\N	\N	\N	\N
24524	Task	3165	3165	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-17 09:56:07.892+00	266	\N	\N	\N	\N	\N	\N
24525	Task	3172	3172	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-17 10:00:11.19+00	266	\N	\N	\N	\N	\N	\N
24526	Task	3172	3172	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 10:00:23.48+00	266	\N	\N	\N	\N	\N	\N
24527	TaskAttachment	1734	3171	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:01:07.985+00	212	\N	\N	\N	\N	\N	\N
24528	TaskAttachment	1735	3171	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:01:50.707+00	212	\N	\N	\N	\N	\N	\N
24529	Task	3173	3173	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:06:52.488+00	212	\N	\N	\N	\N	\N	\N
24530	TaskAttachment	1736	3173	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:06:58.253+00	212	\N	\N	\N	\N	\N	\N
24531	Task	3173	3173	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-17 10:07:06.403+00	212	\N	\N	\N	\N	\N	\N
24532	Task	3171	3171	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-17 10:10:12.565+00	212	<p>Версия браузера - 11.765.17134.0</p>	<p><br></p>	\N	\N	\N	\N
24533	Task	3173	3173	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-17 10:10:24.445+00	212	<p>В IE при отправке формы обратной связи и незаполненном обязательном поле неправильно подсвечиваются поля, которые нужно заполнить. Выделяются абсолютно все поля, даже заполненные корректно.</p>\n<p>Версия браузера - 11.765.17134.0</p>	<p>В IE при отправке формы обратной связи и незаполненном обязательном поле неправильно подсвечиваются поля, которые нужно заполнить. Выделяются абсолютно все поля, даже заполненные корректно.</p>	\N	\N	\N	\N
24534	Task	3174	3174	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:26:51.998+00	212	\N	\N	\N	\N	\N	\N
24535	TaskAttachment	1737	3174	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 10:26:59.405+00	212	\N	\N	\N	\N	\N	\N
24536	Task	3174	3174	performerId	\N	\N	\N	239	\N	\N	\N	\N	update	2019-06-17 10:27:06.03+00	212	\N	\N	\N	\N	\N	\N
24537	Task	3164	3164	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 10:48:11.219+00	239	\N	\N	\N	\N	\N	\N
24538	Task	3164	3164	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-17 10:48:11.219+00	239	\N	\N	\N	\N	\N	\N
24539	Task	3174	3174	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 10:50:29.218+00	239	\N	\N	\N	\N	\N	\N
24540	Task	3172	3172	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 11:10:39.902+00	266	\N	\N	\N	\N	\N	\N
24541	Task	3172	3172	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-17 11:10:39.902+00	266	\N	\N	\N	\N	\N	\N
24542	Task	3170	3170	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-17 11:12:38.345+00	266	\N	\N	\N	\N	\N	\N
24543	Task	3174	3174	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 11:13:53.389+00	239	\N	\N	\N	\N	\N	\N
24544	Task	3174	3174	performerId	\N	\N	239	\N	\N	\N	\N	\N	update	2019-06-17 11:13:53.389+00	239	\N	\N	\N	\N	\N	\N
24545	Task	3174	3174	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-17 11:14:00.356+00	239	\N	\N	\N	\N	\N	\N
24546	Task	3170	3170	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-17 11:44:14.908+00	266	\N	\N	\N	\N	\N	\N
24547	Task	3170	3170	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-17 11:44:14.908+00	266	\N	\N	\N	\N	\N	\N
24548	Task	3164	3164	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 11:44:54.305+00	212	\N	\N	\N	\N	\N	\N
24549	Task	3174	3174	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 11:48:22.083+00	212	\N	\N	\N	\N	\N	\N
24550	Task	3170	3170	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 11:58:29.775+00	212	\N	\N	\N	\N	\N	\N
24551	Task	3105	3105	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-17 17:58:14.134+00	1	\N	\N	\N	\N	\N	\N
24552	Task	3092	3092	performerId	\N	\N	\N	186	\N	\N	\N	\N	update	2019-06-17 17:59:14.263+00	1	\N	\N	\N	\N	\N	\N
24553	Task	3175	3175	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-17 18:07:27.69+00	1	\N	\N	\N	\N	\N	\N
24554	Task	3176	3176	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 06:20:04.35+00	205	\N	\N	\N	\N	\N	\N
24555	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:22:13.867+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li><br></li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."<br>\n</li>\n</ul>	<p>https://nordclan.com/development/:<br>\n- заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."<br>\n- заменить "Развить готовую систему" на &nbsp;</p>	\N	\N	\N	\N
24592	Task	3165	3165	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:27:56.537+00	266	\N	\N	\N	\N	\N	\N
24594	Task	3177	3177	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-18 08:28:29.302+00	266	\N	\N	\N	\N	\N	\N
24595	Task	3172	3172	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:28:39.418+00	266	\N	\N	\N	\N	\N	\N
24596	Task	3098	3098	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:28:50.9+00	266	\N	\N	\N	\N	\N	\N
24597	Task	3179	3179	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 08:36:26.694+00	266	\N	\N	\N	\N	\N	\N
24598	Task	3179	3179	statusId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-18 08:39:36.782+00	266	\N	\N	\N	\N	\N	\N
24599	TaskAttachment	1738	3114	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 08:47:58.289+00	102	\N	\N	\N	\N	\N	\N
24600	Task	3114	3114	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-18 08:48:03.855+00	102	\N	\N	\N	\N	\N	\N
24601	Task	3180	3180	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:00:51.888+00	205	\N	\N	\N	\N	\N	\N
24602	Task	3181	3181	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:02:02.076+00	205	\N	\N	\N	\N	\N	\N
24603	Task	3182	3182	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:02:29.241+00	205	\N	\N	\N	\N	\N	\N
24604	Task	3183	3183	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:03:21.355+00	205	\N	\N	\N	\N	\N	\N
24605	Task	3184	3184	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:04:32.158+00	205	\N	\N	\N	\N	\N	\N
24556	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:23:36.035+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."<br>\n</li>\n</ul>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li><br></li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."<br>\n</li>\n</ul>	\N	\N	\N	\N
24557	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:25:39.044+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."<br>\n</li>\n</ul>	\N	\N	\N	\N
24558	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:30:24.716+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/ - единообразно регалии нужно оформить</p>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p><br>\n</p>	\N	\N	\N	\N
24559	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:35:34.687+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/ - единообразно регалии нужно оформить</p>\n<p><br>\n</p>	\N	\N	\N	\N
24560	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:45:02.23+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/&nbsp;</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p><br>\n</p>	\N	\N	\N	\N
24593	Task	3177	3177	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-18 08:28:29.302+00	266	\N	\N	\N	\N	\N	\N
24606	Task	3185	3185	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:05:48.845+00	205	\N	\N	\N	\N	\N	\N
24607	Task	3176	3176	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-18 09:36:15.862+00	266	\N	\N	\N	\N	\N	\N
24608	Task	3176	3176	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-18 09:36:15.862+00	266	\N	\N	\N	\N	\N	\N
24609	Task	3186	3186	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:46:06.108+00	183	\N	\N	\N	\N	\N	\N
24610	Task	3187	3187	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:46:51.638+00	183	\N	\N	\N	\N	\N	\N
24611	Task	3107	3107	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-18 09:54:24.523+00	186	\N	\N	\N	\N	\N	\N
24612	Task	3188	3188	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 09:58:26.623+00	186	\N	\N	\N	\N	\N	\N
24613	Task	3106	3106	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 09:58:40.848+00	266	\N	\N	\N	\N	\N	\N
24614	Task	3090	3090	statusId	\N	\N	3	8	\N	\N	\N	\N	update	2019-06-18 10:00:20.216+00	1	\N	\N	\N	\N	\N	\N
24615	Task	3189	3189	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 10:02:01.876+00	1	\N	\N	\N	\N	\N	\N
24616	Task	3190	3190	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 10:14:04.926+00	102	\N	\N	\N	\N	\N	\N
24617	Task	3191	3191	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 10:15:58.069+00	102	\N	\N	\N	\N	\N	\N
24618	Task	3191	3191	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-18 10:18:43.241+00	102	\N	\N	\N	\N	\N	\N
24741	Task	3211	3211	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:25:18.212+00	266	\N	\N	\N	\N	\N	\N
24742	Task	3211	3211	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 07:25:24.962+00	266	\N	\N	\N	\N	\N	\N
24744	Task	3205	3205	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:25:42.853+00	266	\N	\N	\N	\N	\N	\N
24561	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:46:46.816+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp;https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/&nbsp;</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p><br>\n</p>	\N	\N	\N	\N
24562	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:48:44.84+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp;https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p>На внутренней странице подменю "услуги" раскрывать при наведении - записала, нужно обсудить</p>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp;https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p><br>\n</p>	\N	\N	\N	\N
24563	Task	3176	3176	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 06:52:49.115+00	205	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp; https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p>На внутренней странице подменю "услуги" раскрывать при наведении - записала, нужно обсудить</p>\n<p><br>\n</p>	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp;https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p>На внутренней странице подменю "услуги" раскрывать при наведении - записала, нужно обсудить</p>\n<p><br>\n</p>	\N	\N	\N	\N
24564	Task	3177	3177	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 06:59:44.663+00	266	\N	\N	\N	\N	\N	\N
24565	Task	3177	3177	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 07:00:54.174+00	266	\N	\N	\N	\N	\N	\N
24566	Task	3177	3177	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-18 07:01:10.465+00	266	\N	\N	\N	\N	\N	\N
24567	Task	3177	3177	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-18 07:01:51.304+00	266	\N	\N	\N	\N	\N	\N
24568	Task	3178	3178	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 07:34:30.83+00	266	\N	\N	\N	\N	\N	\N
24569	Task	3178	3178	prioritiesId	\N	\N	3	4	\N	\N	\N	\N	update	2019-06-18 07:34:36.654+00	266	\N	\N	\N	\N	\N	\N
24570	Task	3176	3176	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-18 07:34:48.827+00	266	\N	\N	\N	\N	\N	\N
24571	Task	3176	3176	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 07:35:18.983+00	266	\N	\N	\N	\N	\N	\N
24572	Task	3176	3176	statusId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-18 07:35:22.075+00	266	\N	\N	\N	\N	\N	\N
24573	Task	3179	3179	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 07:37:17.377+00	266	\N	\N	\N	\N	\N	\N
24574	Task	3106	3106	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-18 08:05:27.82+00	102	\N	\N	\N	\N	\N	\N
24575	Task	3106	3106	prioritiesId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-18 08:08:25.849+00	102	\N	\N	\N	\N	\N	\N
24576	Task	3089	3089	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 08:08:39.024+00	102	\N	\N	\N	\N	\N	\N
24577	Task	3083	3083	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:13:20.971+00	102	\N	\N	\N	\N	\N	\N
24578	Task	3085	3085	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:13:26.521+00	102	\N	\N	\N	\N	\N	\N
24579	Task	3080	3080	statusId	\N	\N	1	9	\N	\N	\N	\N	update	2019-06-18 08:23:35.805+00	102	\N	\N	\N	\N	\N	\N
24580	Task	3081	3081	statusId	\N	\N	1	9	\N	\N	\N	\N	update	2019-06-18 08:23:45.145+00	102	\N	\N	\N	\N	\N	\N
24581	Task	3082	3082	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:24:00.17+00	102	\N	\N	\N	\N	\N	\N
24582	Task	3087	3087	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:24:22.668+00	102	\N	\N	\N	\N	\N	\N
24583	Task	3088	3088	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:24:25.221+00	102	\N	\N	\N	\N	\N	\N
24584	Task	3086	3086	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:24:28.242+00	102	\N	\N	\N	\N	\N	\N
24585	Task	3090	3090	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:24:58.949+00	102	\N	\N	\N	\N	\N	\N
24586	Task	3089	3089	sprintId	\N	\N	424	428	\N	\N	\N	\N	update	2019-06-18 08:25:09.373+00	102	\N	\N	\N	\N	\N	\N
24587	Task	3179	3179	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:26:56.575+00	266	\N	\N	\N	\N	\N	\N
24588	Task	3178	3178	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:27:11.64+00	266	\N	\N	\N	\N	\N	\N
24589	Task	3176	3176	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:27:29.522+00	266	\N	\N	\N	\N	\N	\N
24590	Task	3171	3171	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:27:40.663+00	266	\N	\N	\N	\N	\N	\N
24591	Task	3173	3173	sprintId	\N	\N	425	427	\N	\N	\N	\N	update	2019-06-18 08:27:45.938+00	266	\N	\N	\N	\N	\N	\N
24619	Task	3191	3191	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 10:18:45.424+00	102	<p>- сделать страницу общих отчетов по времени(доступно для ролей Администратор и наблюдатель)</p>\n<p>- фильтры по пользователям</p>\n<p>- список всех часов по проектам (аналог как в проекте в отчетах по времени)</p>\n<p>- выгрузка аналогична выгрузке отчетов из проекта</p>	<p>- сделать страницу общих отчетов по времени(дос</p>	\N	\N	\N	\N
24620	Task	3099	3099	performerId	\N	\N	186	183	\N	\N	\N	\N	update	2019-06-18 11:02:58.035+00	183	\N	\N	\N	\N	\N	\N
24621	Task	3192	3192	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 11:08:22.856+00	183	\N	\N	\N	\N	\N	\N
24622	Task	3193	3193	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 11:08:33.23+00	183	\N	\N	\N	\N	\N	\N
24623	Task	3099	3099	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-18 11:08:43.428+00	183	\N	\N	\N	\N	\N	\N
24624	Task	3099	3099	statusId	\N	\N	5	8	\N	\N	\N	\N	update	2019-06-18 11:14:26.205+00	183	\N	\N	\N	\N	\N	\N
24625	Task	3186	3186	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 11:14:50.846+00	183	\N	\N	\N	\N	\N	\N
24626	Task	3186	3186	performerId	\N	\N	\N	183	\N	\N	\N	\N	update	2019-06-18 11:14:50.846+00	183	\N	\N	\N	\N	\N	\N
24627	Task	3187	3187	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 11:14:57.179+00	183	\N	\N	\N	\N	\N	\N
24628	Task	3187	3187	performerId	\N	\N	\N	183	\N	\N	\N	\N	update	2019-06-18 11:14:57.179+00	183	\N	\N	\N	\N	\N	\N
24629	Task	3168	3168	prioritiesId	\N	\N	4	2	\N	\N	\N	\N	update	2019-06-18 11:24:53.647+00	102	\N	\N	\N	\N	\N	\N
24630	Task	3194	3194	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 12:03:34.455+00	266	\N	\N	\N	\N	\N	\N
24631	Task	3194	3194	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-18 12:03:45.629+00	266	\N	\N	\N	\N	\N	\N
24632	Task	3106	3106	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-06-18 12:03:53.437+00	266	\N	\N	\N	\N	\N	\N
24633	Task	3195	3195	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 12:17:33.138+00	183	\N	\N	\N	\N	\N	\N
24634	TaskAttachment	1739	3195	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 12:20:07.214+00	183	\N	\N	\N	\N	\N	\N
24635	TaskAttachment	1740	3195	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 12:25:31.2+00	183	\N	\N	\N	\N	\N	\N
24636	Task	3195	3195	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 12:26:22.305+00	183	<p>два скриншоты демонистрируют на сколько все плохо.&nbsp;</p>\n<p>300 мегабайт утекают за час работы сервера</p>	<p><br></p>	\N	\N	\N	\N
24637	Task	3196	3196	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 13:31:52.672+00	102	\N	\N	\N	\N	\N	\N
24638	Task	3196	3196	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 13:32:16.345+00	102	<p>ориентироваться на группу SS</p>	<p><br></p>	\N	\N	\N	\N
24639	Task	3196	3196	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 13:36:34.96+00	102	<p>ориентироваться на группу SS</p>\n<p>Завести на отдельного пользователя и почту.</p>	<p>ориентироваться на группу SS</p>	\N	\N	\N	\N
24640	Task	3197	3197	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-18 14:09:53.274+00	102	\N	\N	\N	\N	\N	\N
24641	Task	3197	3197	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-18 14:12:13.914+00	102	<p>Клиент: не ИТ и никогда не работал с подрядчиками.</p>\n<p>Желание: сделать свою систему на основе системы конкурента.</p>\n<p><br></p>\n<p>Для доступа к сайту mywasher.pro используйте следующие данные:&nbsp;</p>\n<p><br></p>\n<p>Логин: ceo@go-wash.ru</p>\n<p>Пароль: qwerty1234</p>\n<p>&nbsp;</p>\n<p><br></p>\n<p>&nbsp;</p>\n<p>Краткое описание проекта</p>\n<p>&nbsp;</p>\n<p>ERP система для автомойки, детейлинга и шиномонтажа. + элементы CRM и WMS (warehouse management system).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Создание операций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Сбор, анализ и визуализация, доходов, расходов и операционной статистики</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление запасами и складом</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление персоналом и расчет зарплат</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление скидками, начислением баллов, создание промо акций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Блок контроля за подписками и сбора статистики по клиентам</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Синхронизация с внешними сервисами по API</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Интеграция с камерой с определением номера машины в боксе временем въезда и выезда</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Кассовый учет, кассовые операции (фискальный регистратор, либо онлайн касса).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Система по управлению хранением колес</p>	<p>Для доступа к сайту mywasher.pro используйте следующие данные:</p>\n<p><br></p>\n<p>&nbsp;</p>\n<p><br></p>\n<p>Логин: ceo@go-wash.ru</p>\n<p>Пароль: qwerty1234</p>\n<p>&nbsp;</p>\n<p><br></p>\n<p>&nbsp;</p>\n<p>Краткое описание проекта</p>\n<p>&nbsp;</p>\n<p>ERP система для автомойки, детейлинга и шиномонтажа. + элементы CRM и WMS (warehouse management system).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Создание операций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Сбор, анализ и визуализация, доходов, расходов и операционной статистики</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление запасами и складом</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление персоналом и расчет зарплат</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление скидками, начислением баллов, создание промо акций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Блок контроля за подписками и сбора статистики по клиентам</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Синхронизация с внешними сервисами по API</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Интеграция с камерой с определением номера машины в боксе временем въезда и выезда</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Кассовый учет, кассовые операции (фискальный регистратор, либо онлайн касса).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Система по управлению хранением колес</p>	\N	\N	\N	\N
24642	Task	3198	3198	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 05:59:15.267+00	183	\N	\N	\N	\N	\N	\N
24643	Task	3168	3168	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 05:59:33.298+00	102	<p>тема письма: &nbsp;Заявка с сайта</p>\n<p><br></p>	<p><br></p>	\N	\N	\N	\N
24644	Task	3198	3198	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 05:59:37.931+00	183	\N	\N	\N	\N	\N	\N
24645	Task	3198	3198	performerId	\N	\N	\N	183	\N	\N	\N	\N	update	2019-06-19 05:59:37.931+00	183	\N	\N	\N	\N	\N	\N
24646	Task	3199	3199	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 06:00:03.296+00	102	\N	\N	\N	\N	\N	\N
24647	Task	3168	3168	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 06:01:36.139+00	102	<p>Отправитель: Site NordClan</p>\n<p>тема письма: &nbsp;Заявка с сайта</p>\n<p>Имя: тест&nbsp;</p>\n<p>Компания: тест&nbsp;</p>\n<p>Телефон: +7 948 537 63 62&nbsp;</p>\n<p>Email: ilya.kashtankin@nordclan.com&nbsp;</p>\n<p>Описание: dfdvfdfs</p>	<p>тема письма: &nbsp;Заявка с сайта</p>\n<p><br></p>	\N	\N	\N	\N
24648	Task	3168	3168	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-06-19 06:01:51.647+00	102	\N	\N	\N	\N	\N	\N
24649	Task	3118	3118	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-19 06:09:03.002+00	102	\N	\N	\N	\N	\N	\N
24650	Task	3089	3089	statusId	\N	\N	3	8	\N	\N	\N	\N	update	2019-06-19 06:09:12.086+00	102	\N	\N	\N	\N	\N	\N
24651	Task	3172	3172	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-19 06:46:51.675+00	212	\N	\N	\N	\N	\N	\N
24652	Task	3199	3199	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 07:22:18.288+00	239	\N	\N	\N	\N	\N	\N
24653	Task	3197	3197	performerId	\N	\N	\N	205	\N	\N	\N	\N	update	2019-06-19 07:34:24.988+00	205	\N	\N	\N	\N	\N	\N
24654	Task	3196	3196	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 07:35:41.999+00	205	\N	\N	\N	\N	\N	\N
24655	Task	3197	3197	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 07:35:44.958+00	205	\N	\N	\N	\N	\N	\N
24656	Task	3200	3200	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:43:44.726+00	212	\N	\N	\N	\N	\N	\N
24657	Task	3200	3200	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 07:43:49.55+00	212	\N	\N	\N	\N	\N	\N
24658	Task	3201	3201	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:44:10.882+00	212	\N	\N	\N	\N	\N	\N
24659	Task	3201	3201	sprintId	\N	\N	428	424	\N	\N	\N	\N	update	2019-06-19 07:45:57.633+00	212	\N	\N	\N	\N	\N	\N
24660	Task	3202	3202	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 07:47:09.695+00	212	\N	\N	\N	\N	\N	\N
24661	Task	3196	3196	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 07:47:25.552+00	205	\N	\N	\N	\N	\N	\N
24662	Task	3202	3202	performerId	\N	\N	\N	212	\N	\N	\N	\N	update	2019-06-19 07:47:32.11+00	212	\N	\N	\N	\N	\N	\N
24663	Task	3197	3197	statusId	\N	\N	3	2	\N	\N	\N	\N	update	2019-06-19 07:47:36.102+00	205	\N	\N	\N	\N	\N	\N
24664	Task	3197	3197	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 07:47:39.601+00	205	\N	\N	\N	\N	\N	\N
24665	Task	3197	3197	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 07:47:43.109+00	205	\N	\N	\N	\N	\N	\N
24740	Task	3211	3211	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-07-02 07:25:02.632+00	266	\N	\N	\N	\N	\N	\N
24743	Task	3205	3205	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-07-02 07:25:39.886+00	266	\N	\N	\N	\N	\N	\N
24745	Task	3205	3205	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 07:25:49.135+00	266	\N	\N	\N	\N	\N	\N
24666	Task	3202	3202	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 08:24:05.002+00	35	<p>Проверить задарма в первую очередь, по возможности взять триалку.</p>\n<p>требуется</p>\n<p>виртуальный номер</p>\n<p>вирт атс&nbsp;</p>\n<p>софтофоны</p>	<p><br></p>	\N	\N	\N	\N
24667	Task	3199	3199	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-19 08:32:53.489+00	239	\N	\N	\N	\N	\N	\N
24668	Task	3199	3199	performerId	\N	\N	239	212	\N	\N	\N	\N	update	2019-06-19 08:32:53.489+00	239	\N	\N	\N	\N	\N	\N
24669	Task	3203	3203	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 09:10:40.427+00	212	\N	\N	\N	\N	\N	\N
24670	Task	3203	3203	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 09:10:43.851+00	212	\N	\N	\N	\N	\N	\N
24671	TaskAttachment	1741	3194	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 09:11:21.399+00	266	\N	\N	\N	\N	\N	\N
24672	Task	3194	3194	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-19 09:15:29.782+00	266	\N	\N	\N	\N	\N	\N
24673	Task	3141	3141	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-19 09:16:14.337+00	266	\N	\N	\N	\N	\N	\N
24674	Task	3177	3177	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-19 09:16:19.104+00	266	\N	\N	\N	\N	\N	\N
24675	Task	3135	3135	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-19 09:16:23.087+00	266	\N	\N	\N	\N	\N	\N
24676	Task	3142	3142	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-19 09:16:29.503+00	266	\N	\N	\N	\N	\N	\N
24677	Task	3168	3168	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 09:18:07.455+00	266	\N	\N	\N	\N	\N	\N
24678	Task	3204	3204	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 09:35:39.026+00	266	\N	\N	\N	\N	\N	\N
24679	Task	3204	3203	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 09:35:39.026+00	266	\N	\N	\N	\N	\N	\N
24680	Task	3205	3205	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 10:28:01.793+00	35	\N	\N	\N	\N	\N	\N
24681	Task	3206	3206	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 10:31:04.074+00	35	\N	\N	\N	\N	\N	\N
24682	Task	3205	3205	description	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 10:52:36.359+00	102	<p>Фича позволяет заказать звонок клиенту&nbsp;</p>\n<p>Функциональность есть на сайте айтека</p>\n<p><br></p>\n<p>http://joxi.ru/nAyZRnZTgWJwkr</p>\n<p>обязательный только телефон - первым элементом формы</p>\n<p>время - по дефолту "как можно скорее"</p>\n<p>Имя и Сообщение</p>	<p>Фича позволяет заказать звонок клиенту&nbsp;</p>\n<p>Функциональность есть на сайте айтека</p>	\N	\N	\N	\N
24683	Task	3205	3205	sprintId	\N	\N	\N	427	\N	\N	\N	\N	update	2019-06-19 10:52:39.559+00	102	\N	\N	\N	\N	\N	\N
24684	Task	3207	3207	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 11:15:11.211+00	35	\N	\N	\N	\N	\N	\N
24685	Task	3207	3207	performerId	\N	\N	357	102	\N	\N	\N	\N	update	2019-06-19 11:28:28.989+00	35	\N	\N	\N	\N	\N	\N
24686	Task	3207	3207	statusId	\N	\N	1	8	\N	\N	\N	\N	update	2019-06-19 11:30:04.567+00	102	\N	\N	\N	\N	\N	\N
24687	Task	3207	3207	performerId	\N	\N	102	357	\N	\N	\N	\N	update	2019-06-19 11:30:04.567+00	102	\N	\N	\N	\N	\N	\N
24688	Task	3207	3207	statusId	\N	\N	8	3	\N	\N	\N	\N	update	2019-06-19 11:31:12.687+00	35	\N	\N	\N	\N	\N	\N
24689	Task	3207	3207	performerId	\N	\N	357	1	\N	\N	\N	\N	update	2019-06-19 11:31:12.687+00	35	\N	\N	\N	\N	\N	\N
24690	Task	3207	3207	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-19 11:33:56.91+00	1	\N	\N	\N	\N	\N	\N
24691	Task	3207	3207	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-19 11:34:02.859+00	1	\N	\N	\N	\N	\N	\N
24692	Task	3207	3207	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-19 11:34:30.974+00	35	\N	\N	\N	\N	\N	\N
24693	Task	3207	3207	statusId	\N	\N	10	1	\N	\N	\N	\N	update	2019-06-19 11:34:35.907+00	35	\N	\N	\N	\N	\N	\N
24694	Task	3207	3207	performerId	\N	\N	1	344	\N	\N	\N	\N	update	2019-06-19 11:52:59.78+00	357	\N	\N	\N	\N	\N	\N
24695	Task	3203	3203	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-19 12:24:56.008+00	266	\N	\N	\N	\N	\N	\N
24696	Task	3203	3203	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-19 12:24:56.008+00	266	\N	\N	\N	\N	\N	\N
24697	Task	3203	3203	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-19 12:25:20.991+00	266	\N	\N	\N	\N	\N	\N
24698	Task	3203	3203	statusId	\N	\N	5	3	\N	\N	\N	\N	update	2019-06-19 12:25:30.923+00	266	\N	\N	\N	\N	\N	\N
24699	Task	3204	3204	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 12:25:41.797+00	266	\N	\N	\N	\N	\N	\N
24700	Task	3204	3204	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-19 12:27:32.923+00	266	\N	\N	\N	\N	\N	\N
24701	Task	3179	3179	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-06-19 12:27:45.189+00	266	\N	\N	\N	\N	\N	\N
24702	Task	3194	3194	statusId	\N	\N	7	5	\N	\N	\N	\N	update	2019-06-19 12:27:52.63+00	266	\N	\N	\N	\N	\N	\N
24703	Task	3199	3199	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-19 13:40:04.57+00	212	\N	\N	\N	\N	\N	\N
24704	Task	3176	3176	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-19 13:40:07.595+00	212	\N	\N	\N	\N	\N	\N
24705	Task	3208	3208	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 14:03:26.833+00	336	\N	\N	\N	\N	\N	\N
24706	Task	3208	3208	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 14:03:42.896+00	336	\N	\N	\N	\N	\N	\N
24707	TaskAttachment	1742	3168	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 14:08:28.861+00	266	\N	\N	\N	\N	\N	\N
24708	Task	3168	3168	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-19 14:14:51.934+00	266	\N	\N	\N	\N	\N	\N
24709	Task	3168	3168	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-06-19 14:14:51.934+00	266	\N	\N	\N	\N	\N	\N
24710	Task	3209	3209	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 14:24:14.714+00	266	\N	\N	\N	\N	\N	\N
24711	Task	3209	3209	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 14:24:37.153+00	266	\N	\N	\N	\N	\N	\N
24712	Task	3179	3179	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 14:24:49.927+00	266	\N	\N	\N	\N	\N	\N
24713	Task	3210	3210	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-06-19 14:40:50.389+00	266	\N	\N	\N	\N	\N	\N
24714	Task	3210	3210	plannedExecutionTime	\N	\N	\N	\N	\N	\N	\N	\N	update	2019-06-19 14:41:12.113+00	266	\N	\N	\N	\N	\N	\N
24715	Task	3210	3210	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-19 14:41:17.929+00	266	\N	\N	\N	\N	\N	\N
24716	Task	3204	3204	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-28 13:24:03.739+00	266	\N	\N	\N	\N	\N	\N
24717	Task	3194	3194	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-28 13:24:07.401+00	266	\N	\N	\N	\N	\N	\N
24718	Task	3210	3210	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-28 13:24:12.059+00	266	\N	\N	\N	\N	\N	\N
24719	Task	3106	3106	statusId	\N	\N	1	7	\N	\N	\N	\N	update	2019-06-28 13:24:14.826+00	266	\N	\N	\N	\N	\N	\N
24720	Task	3209	3209	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-28 13:24:18.75+00	266	\N	\N	\N	\N	\N	\N
24721	Task	3179	3179	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-06-28 13:24:20.675+00	266	\N	\N	\N	\N	\N	\N
24722	Task	3209	3209	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-06-28 13:24:25.209+00	266	\N	\N	\N	\N	\N	\N
24723	Task	3179	3179	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-28 13:24:28.683+00	266	\N	\N	\N	\N	\N	\N
24724	Task	3179	3179	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-28 13:24:33+00	266	\N	\N	\N	\N	\N	\N
24725	Task	3204	3204	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-06-28 13:24:36.649+00	266	\N	\N	\N	\N	\N	\N
24726	Task	3204	3204	statusId	\N	\N	8	10	\N	\N	\N	\N	update	2019-06-28 13:24:38.899+00	266	\N	\N	\N	\N	\N	\N
24727	Task	3203	3203	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-28 13:25:37.162+00	266	\N	\N	\N	\N	\N	\N
24728	Task	3203	3203	performerId	\N	\N	212	266	\N	\N	\N	\N	update	2019-06-28 13:25:37.162+00	266	\N	\N	\N	\N	\N	\N
24729	Task	3203	3203	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-28 13:25:41.17+00	266	\N	\N	\N	\N	\N	\N
24730	Task	3198	3198	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-06-28 13:25:47.57+00	266	\N	\N	\N	\N	\N	\N
24731	Task	3198	3198	performerId	\N	\N	183	266	\N	\N	\N	\N	update	2019-06-28 13:25:47.57+00	266	\N	\N	\N	\N	\N	\N
24732	Task	3198	3198	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-06-28 13:25:51.136+00	266	\N	\N	\N	\N	\N	\N
24733	Task	3198	3198	statusId	\N	\N	7	6	\N	\N	\N	\N	update	2019-06-28 13:25:55.585+00	266	\N	\N	\N	\N	\N	\N
24734	Task	3198	3198	statusId	\N	\N	6	7	\N	\N	\N	\N	update	2019-06-28 13:25:58.111+00	266	\N	\N	\N	\N	\N	\N
24735	Task	3203	3203	statusId	\N	\N	7	5	\N	\N	\N	\N	update	2019-06-28 13:28:50.887+00	266	\N	\N	\N	\N	\N	\N
24736	Task	3203	3203	performerId	\N	\N	266	205	\N	\N	\N	\N	update	2019-06-28 13:28:50.887+00	266	\N	\N	\N	\N	\N	\N
24737	Task	3198	3198	statusId	\N	\N	7	6	\N	\N	\N	\N	update	2019-06-28 13:56:25.417+00	266	\N	\N	\N	\N	\N	\N
24738	Task	3198	3198	statusId	\N	\N	6	7	\N	\N	\N	\N	update	2019-06-28 13:56:26.142+00	266	\N	\N	\N	\N	\N	\N
24739	Task	3198	3198	statusId	\N	\N	7	6	\N	\N	\N	\N	update	2019-07-02 07:22:45.173+00	266	\N	\N	\N	\N	\N	\N
24746	Task	3197	3197	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-07-02 07:28:41.849+00	266	\N	\N	\N	\N	\N	\N
24747	Task	3197	3197	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:28:46.274+00	266	\N	\N	\N	\N	\N	\N
24748	Task	3211	3211	statusId	\N	\N	5	1	\N	\N	\N	\N	update	2019-07-02 07:29:13.505+00	266	\N	\N	\N	\N	\N	\N
24749	Task	3200	3200	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 07:29:21.047+00	266	\N	\N	\N	\N	\N	\N
24750	Task	3211	3211	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:31:04.049+00	266	\N	\N	\N	\N	\N	\N
24751	Task	3211	3211	performerId	\N	\N	266	\N	\N	\N	\N	\N	update	2019-07-02 07:31:04.049+00	266	\N	\N	\N	\N	\N	\N
24752	Task	3211	3211	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-07-02 07:31:05.262+00	266	\N	\N	\N	\N	\N	\N
24753	Task	3211	3211	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:31:07.098+00	266	\N	\N	\N	\N	\N	\N
24754	Task	3211	3211	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-07-02 07:31:09.431+00	266	\N	\N	\N	\N	\N	\N
24755	Task	3197	3197	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-07-02 07:32:08.935+00	266	\N	\N	\N	\N	\N	\N
24756	Task	3197	3197	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:32:11.443+00	266	\N	\N	\N	\N	\N	\N
24757	Task	3197	3197	statusId	\N	\N	3	1	\N	\N	\N	\N	update	2019-07-02 07:32:19.323+00	266	\N	\N	\N	\N	\N	\N
24758	Task	3205	3205	statusId	\N	\N	5	1	\N	\N	\N	\N	update	2019-07-02 07:32:51.783+00	266	\N	\N	\N	\N	\N	\N
24759	Task	3212	3212	\N	\N	\N	\N	\N	\N	\N	\N	\N	create	2019-07-02 07:33:53.329+00	266	\N	\N	\N	\N	\N	\N
24760	Task	3205	3205	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:34:14.127+00	266	\N	\N	\N	\N	\N	\N
24761	Task	3212	3212	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:34:17.977+00	266	\N	\N	\N	\N	\N	\N
24762	Task	3211	3211	performerId	\N	\N	\N	266	\N	\N	\N	\N	update	2019-07-02 07:35:49.754+00	266	\N	\N	\N	\N	\N	\N
24763	Task	3211	3211	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 07:35:52.321+00	266	\N	\N	\N	\N	\N	\N
24764	Task	3211	3211	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 07:35:55.62+00	266	\N	\N	\N	\N	\N	\N
24765	Task	3211	3211	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-07-02 07:35:58.403+00	266	\N	\N	\N	\N	\N	\N
24766	Task	3211	3211	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-07-02 07:36:00.958+00	266	\N	\N	\N	\N	\N	\N
24767	Task	3106	3106	statusId	\N	\N	7	1	\N	\N	\N	\N	update	2019-07-02 07:36:39.884+00	266	\N	\N	\N	\N	\N	\N
24768	Task	3198	3198	statusId	\N	\N	7	1	\N	\N	\N	\N	update	2019-07-02 07:36:42.451+00	266	\N	\N	\N	\N	\N	\N
24769	Task	3194	3194	statusId	\N	\N	7	1	\N	\N	\N	\N	update	2019-07-02 07:36:46.351+00	266	\N	\N	\N	\N	\N	\N
24770	Task	3209	3209	statusId	\N	\N	7	1	\N	\N	\N	\N	update	2019-07-02 07:36:47.942+00	266	\N	\N	\N	\N	\N	\N
24771	Task	3106	3106	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 11:35:50.654+00	266	\N	\N	\N	\N	\N	\N
24772	Task	3212	3212	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 11:35:53.945+00	266	\N	\N	\N	\N	\N	\N
24773	Task	3212	3212	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-07-02 11:35:56.595+00	266	\N	\N	\N	\N	\N	\N
24774	Task	3179	3179	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-07-02 11:35:58.745+00	266	\N	\N	\N	\N	\N	\N
24775	Task	3179	3179	statusId	\N	\N	8	1	\N	\N	\N	\N	update	2019-07-02 11:36:08.794+00	266	\N	\N	\N	\N	\N	\N
24776	Task	3179	3179	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-02 11:36:13.86+00	266	\N	\N	\N	\N	\N	\N
24777	Task	3179	3179	performerId	\N	\N	266	183	\N	\N	\N	\N	update	2019-07-02 11:36:13.86+00	266	\N	\N	\N	\N	\N	\N
24778	Task	3106	3106	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-02 11:36:17.002+00	266	\N	\N	\N	\N	\N	\N
24779	Task	3106	3106	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-07-02 11:36:19.177+00	266	\N	\N	\N	\N	\N	\N
24780	Task	3210	3210	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-07-02 11:36:20.827+00	266	\N	\N	\N	\N	\N	\N
24781	Task	3211	3211	statusId	\N	\N	8	5	\N	\N	\N	\N	update	2019-07-02 11:36:22.844+00	266	\N	\N	\N	\N	\N	\N
24782	Task	3211	3211	statusId	\N	\N	5	3	\N	\N	\N	\N	update	2019-07-02 11:36:24.719+00	266	\N	\N	\N	\N	\N	\N
24783	Task	3198	3198	statusId	\N	\N	1	3	\N	\N	\N	\N	update	2019-07-10 07:54:01.089+00	266	\N	\N	\N	\N	\N	\N
24784	Task	3211	3211	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-10 07:54:06.763+00	266	\N	\N	\N	\N	\N	\N
24785	Task	3198	3198	statusId	\N	\N	3	5	\N	\N	\N	\N	update	2019-07-10 07:56:24.854+00	266	\N	\N	\N	\N	\N	\N
24786	Task	3211	3211	statusId	\N	\N	5	3	\N	\N	\N	\N	update	2019-07-10 07:56:52.494+00	266	\N	\N	\N	\N	\N	\N
24787	Task	3198	3198	statusId	\N	\N	5	7	\N	\N	\N	\N	update	2019-07-10 08:06:12.632+00	266	\N	\N	\N	\N	\N	\N
24788	Task	3198	3198	statusId	\N	\N	7	10	\N	\N	\N	\N	update	2019-07-10 08:07:57.275+00	266	\N	\N	\N	\N	\N	\N
24789	Task	3211	3211	statusId	\N	\N	3	7	\N	\N	\N	\N	update	2019-07-10 08:09:46.176+00	266	\N	\N	\N	\N	\N	\N
24790	Task	3211	3211	performerId	\N	\N	266	212	\N	\N	\N	\N	update	2019-07-10 08:09:46.176+00	266	\N	\N	\N	\N	\N	\N
24791	Task	3211	3211	statusId	\N	\N	7	8	\N	\N	\N	\N	update	2019-07-10 08:11:47.178+00	212	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: task_statuses; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_statuses (id, name, name_en) FROM stdin;
1	New	New
3	Develop stop	Develop stop
5	Code Review stop	Code Review stop
4	Code Review play	Code Review play
2	Develop play	Develop play
6	QA play	QA play
7	QA stop	QA stop
8	Done	Done
9	Canceled	Canceled
10	Closed	Closed
\.


--
-- Data for Name: task_statuses_association; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_statuses_association (id, project_id, external_status_id, internal_status_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: task_statuses_association_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_statuses_association_id_seq', 66, true);


--
-- Name: task_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_statuses_id_seq', 1, false);


--
-- Data for Name: task_tasks; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_tasks (id, linked_task_id, task_id, deleted_at) FROM stdin;
352	3106	3083	\N
353	3083	3106	\N
\.


--
-- Name: task_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_tasks_id_seq', 353, true);


--
-- Data for Name: task_types; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_types (id, name, name_en) FROM stdin;
1	Фича	Feature
2	Баг	Bug
3	Доп. Фича	Add. Feature
4	Регрес. Баг	Regres. Bug
\.


--
-- Data for Name: task_types_association; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.task_types_association (id, project_id, external_task_type_id, internal_task_type_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: task_types_association_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_types_association_id_seq', 64, true);


--
-- Name: task_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.task_types_id_seq', 1, false);


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.tasks (id, name, type_id, status_id, description, planned_execution_time, fact_execution_time, attaches, priorities_id, author_id, created_at, updated_at, deleted_at, sprint_id, project_id, parent_id, performer_id, is_task_by_client, gitlab_branch_ids, external_id, is_dev_ops) FROM stdin;
3177	Xwiki страница корпоративного сайта	1	10	<p><br></p>	0.00	0.00	\N	3	266	2019-06-18 06:59:44.644+00	2019-06-19 09:16:19.068+00	\N	425	471	\N	266	f	\N	\N	f
3142	Сделать разделитель в разделе "как мы работаем" шире	1	10	<p>Разделители как на главной joxi.ru/Vm6MV6Mt4X3Z1r</p>	0.00	0.00	\N	3	212	2019-06-16 08:24:31.794+00	2019-06-19 09:16:29.488+00	\N	425	471	\N	266	f	\N	\N	f
3094	Правка верстки 2	1	8	<p>1. Скрыть временно иконки соц.сетей</p>\n<p>2. Опустить копирайт на место соц.сетей</p>\n<p>3. Телефон Ильи Каштанкина +79278009999</p>\n<p>4. Поставить email наших продавцов</p>\n<p>Александр Краснов</p>\n<p>krasnov.aleksandr@nordclan.com</p>\n<p>Александр Носков</p>\n<p>noskov.aleksandr@nordclan.com</p>	0.00	0.00	\N	3	102	2019-06-13 08:30:18.928+00	2019-06-13 13:43:11.013+00	\N	425	471	\N	212	f	\N	\N	f
3092	Разработать и внедрить политику паролей	1	1	<p>1. Выбрать и внедрить систему хранение паролей</p>\n<p>2. Сменить все пароли на сложные и занести в систему храения паролей</p>	0.00	0.00	\N	3	1	2019-06-12 19:32:00.321+00	2019-06-17 17:59:14.249+00	\N	424	470	\N	186	f	\N	\N	f
3087	EM. Убрать сообщество поддержки	1	1	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:57:09.459+00	2019-06-18 08:24:22.573+00	\N	428	470	\N	239	f	\N	\N	f
3085	ST. Новая цветовая схема	1	1	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:56:40.314+00	2019-06-18 08:13:26.513+00	\N	428	470	\N	102	f	\N	\N	f
3091	Форма смены пароля	1	1	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 18:30:06.431+00	2019-06-11 18:30:06.431+00	\N	\N	470	\N	\N	f	\N	\N	f
3111	Фото на сайт	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-13 14:41:26.95+00	2019-06-14 08:02:24.121+00	\N	425	471	\N	212	f	\N	\N	f
3086	EM. Новая цветовая схема	1	1	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:56:53.466+00	2019-06-18 08:24:28.225+00	\N	428	470	\N	239	f	\N	\N	f
3083	500 Ошибка на многих страницах ST	1	1	<p>Аватарки, история проекта</p>	0.00	0.00	\N	3	336	2019-06-11 08:35:24.739+00	2019-06-18 08:13:20.96+00	\N	428	470	\N	183	f	\N	\N	f
3126	Счетчик на главной	1	9	<p>13,4557 лет и каждые 5 секунд добавляет + сколько лет добавилось</p>	0.00	0.00	\N	3	102	2019-06-14 12:59:36.855+00	2019-06-17 09:19:08.836+00	\N	\N	471	\N	239	f	\N	\N	f
3132	Пункт меню Блог скрыть совсем	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-14 13:09:34.034+00	2019-06-16 07:33:25.999+00	\N	425	471	\N	212	f	\N	\N	f
3080	test	1	9	<p>test</p>	0.00	0.00	\N	3	183	2019-06-11 07:56:30.688+00	2019-06-18 08:23:35.72+00	\N	\N	470	\N	102	f	\N	\N	f
3081	test2	1	9	<p>test2</p>	0.00	0.00	\N	3	183	2019-06-11 07:57:47.983+00	2019-06-18 08:23:45.137+00	\N	\N	470	\N	1	f	\N	\N	f
3117	Артамонов. SkyEng	1	3	<p>Изначально: 1 ставка Unity</p>\n<p>Пресейл с Золотовым</p>\n<p><br></p>	0.00	0.00	\N	3	102	2019-06-14 06:48:17.693+00	2019-06-14 10:58:09.371+00	\N	426	472	\N	102	f	\N	\N	f
3115	Краснов. PSP Весы - отказ	1	8	<p>Тип: красный</p>\n<p><br></p>\n<p>Концепция: https://docs.google.com/document/d/1NeY0C2zHByAlCXuXE5S7uei_dbQ3O_Sy8tGhoDQN3Jc/edit</p>\n<p>Роудмап: https://docs.google.com/document/d/10iawmR0vP6ycTFUkw_VWHEFQ7Z7kX6B6-Tqve4s10Ow/edit</p>\n<p>Оценка: https://docs.google.com/spreadsheets/d/1mSs74MB4datr2i-MjTyXZSuGBb6yiyAU0En6npE9ECY/edit#gid=902801002</p>\n<p><br></p>	0.00	0.00	\N	3	102	2019-06-13 15:10:16.756+00	2019-06-14 10:57:55.045+00	\N	426	472	\N	102	f	\N	\N	f
3119	Исправить формирование URL в блоге	2	8	<p>Сейчас URL формируется в формате http://docker.nordclan:8000/2019/06/10/foodtech/<br>\nЛучше сделать в формате http://docker.nordclan:8000/category/projects/foodtech/</p>	0.00	0.00	\N	3	212	2019-06-14 08:13:32.366+00	2019-06-14 11:28:19.591+00	\N	425	471	\N	212	f	\N	\N	f
3100	Форма обратной связи	1	8	<p>С адресов</p>\n<p><br></p>\n<p>krasnov.aleksandr@nordclan.com</p>\n<p><br></p>\n<p>noskov.aleksandr@nordclan.com</p>\n<p><br></p>\n<p>mailto</p>\n<p><br></p>\n<p><br></p>\n<p>Форма должна отправлять на&nbsp;</p>\n<p><br></p>\n<p>customer@nordclan.com</p>	0.00	0.00	\N	3	102	2019-06-13 09:47:43.392+00	2019-06-14 11:51:27.626+00	\N	425	471	3095	212	f	\N	\N	f
3082	Придумать название SimTrack	1	1	<p><br></p>	0.00	0.00	\N	3	183	2019-06-11 08:27:41.879+00	2019-06-18 08:24:00.159+00	\N	428	470	\N	102	f	\N	\N	f
3095	Сделать алиасы на почтовые адреса с формы обратной связи на сайте	1	8	<p>С адресов&nbsp;</p>\n<p>krasnov.aleksandr@nordclan.com</p>\n<p>noskov.aleksandr@nordclan.com</p>\n<p>отправляем письма на&nbsp;</p>\n<p>aleksandr.krasnov@nordclan.com</p>\n<p>aleksandr.noskov@nordclan.com</p>\n<p><br></p>\n<p>+ customer@nordclan.com</p>	0.00	0.00	\N	3	102	2019-06-13 08:34:45.441+00	2019-06-13 09:21:20.405+00	\N	425	471	\N	1	f	\N	\N	f
3124	Меню. Убрать клик на пункт Услуги	1	8	<p>http://docker.nordclan:8000/services/</p>\n<p>этой страницы не будет</p>	0.00	0.00	\N	1	102	2019-06-14 10:40:26.149+00	2019-06-16 07:55:19.183+00	\N	425	471	\N	212	f	\N	\N	f
3088	EM. Сменить лого	1	1	<p>http://joxi.ru/VrwLZVLi75wyVm</p>	0.00	0.00	\N	3	102	2019-06-11 17:57:23.65+00	2019-06-18 08:24:25.201+00	\N	428	470	\N	239	f	\N	\N	f
3093	Размещение текстов	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-13 08:25:02.225+00	2019-06-16 08:53:23.297+00	\N	425	471	\N	212	f	\N	\N	f
3098	Проверка сайта http://docker.nordclan:8000/	1	7	<p><br></p>	0.00	0.00	\N	3	102	2019-06-13 08:57:28.36+00	2019-06-18 08:28:50.89+00	\N	427	471	\N	212	f	\N	\N	f
3180	RatesNet. Аналоги	1	1	<p><br></p>	0.00	0.00	\N	3	205	2019-06-18 09:00:51.793+00	2019-06-18 09:00:51.793+00	\N	428	470	\N	205	f	\N	\N	f
3099	Изменить url серверов	1	8	<p>http://bucksman.docker.nordclan/ -&gt; http://bucksman.nordclan/</p>\n<p><br></p>\n<p>http://track.docker.nordclan/ -&gt; http://track.nordclan/</p>	0.00	0.00	\N	3	1	2019-06-13 09:33:38.378+00	2019-06-18 11:14:26.196+00	\N	424	470	\N	183	f	\N	\N	f
3089	EM. Проверка выгрузки оценок	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:57:41.658+00	2019-06-19 06:09:12.063+00	\N	428	470	\N	102	f	\N	\N	f
3101	Убрать старые ненужные кейсы	1	8	<p>типа скб и прочих</p>	0.00	0.00	\N	1	102	2019-06-13 09:49:28.836+00	2019-06-13 10:27:32.452+00	\N	425	471	\N	212	f	\N	\N	f
3096	Пункт меню Соискателям скрыть	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-13 08:35:57.756+00	2019-06-13 12:31:38.554+00	\N	425	471	\N	212	f	\N	\N	f
3097	Блок: Нас выбирают потому что	1	8	<p>- вместо "Почему с нами выгодно" заголовок "Нас выбирают потому что:"</p>\n<p><br></p>\n<p>- будет 3 пункта, самый длинный третий посередине</p>\n<p><br></p>\n<p>1. Вы получаете ровно тот результат, который ожидаете.</p>\n<p>2. С нами удобно.</p>\n<p><br></p>\n<p>3.(по середине)</p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку.</p>\n<p><br></p>\n<p><br></p>\n<p>Шрифт крупнее на 4&nbsp;</p>	0.00	0.00	\N	3	102	2019-06-13 08:56:31.671+00	2019-06-13 13:30:25.404+00	\N	425	471	\N	212	f	\N	\N	f
3182	XWiki. Заполнение раздела "Управление проекта"	1	1	<p><br></p>	0.00	0.00	\N	3	205	2019-06-18 09:02:29.232+00	2019-06-18 09:02:29.232+00	\N	428	470	\N	205	f	\N	\N	f
3084	Правка верстки 1	1	8	<p>1. у маяка не видно факел на маленьком мониторе http://joxi.ru/KAgyjZytE7L5Jm</p>\n<p>2. полоска http://joxi.ru/nAyZRnZTgbP9Wr и еще одна http://joxi.ru/E2p0Qz0t7xPvD2</p>\n<p>3. на странице услуги после нажатия на ссылку с якорем скролит оч высоко и перекрывается стики блоком меню http://joxi.ru/J2bnj6nC05Kqn2</p>\n<p>4. рубрика блог/портфолио убрать совсем</p>\n<p>5. Дата в портфолио вида:&nbsp;</p>\n<p>10 Июля 2019(насколько трудоемко сделать с падежами?)</p>\n<p>6. Опубликовано в рубрике Портфолио убрать</p>\n<p><br></p>\n<p>7. http://joxi.ru/Q2Kyv5ytLqxg3r&nbsp;</p>\n<p>уменьшить отступ</p>\n<p>Назад к Портфолио и шрифтом мельче</p>\n<p>Под заголовком дату в формате как на списке кейсов</p>\n<p><br></p>\n<p>8. http://joxi.ru/8AnMjxMtzWPKk2</p>\n<p>убрать ненужные тексты, дату в формате как в портфолио</p>\n<p><br></p>\n<p>9. http://joxi.ru/L218V98tRabDBm убрать read more</p>\n<p><br></p>\n<p>10. Список в Блог и Портфолио в формате - картинка слева + текст</p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:32:43.563+00	2019-06-13 13:40:55.906+00	\N	425	471	\N	212	f	\N	\N	f
3105	смена ldap пароля	1	8	<p><br></p>	0.00	0.00	\N	3	186	2019-06-13 11:56:58.435+00	2019-06-17 17:58:14.033+00	\N	424	470	\N	186	f	\N	\N	f
3104	В футере сайта при нажатии на номер телефона не происходит звонок	2	8	<p>В футере сайта при нажатии на номер телефона не происходит звонок, нужн о повесить на него событие.</p>	0.00	0.00	\N	2	212	2019-06-13 10:48:31.052+00	2019-06-13 14:23:28.446+00	\N	425	471	\N	212	f	\N	\N	f
3206	редизайн бокового меню	1	1	<p>Нужно сделать пафосно.</p>	0.00	0.00	\N	2	35	2019-06-19 10:31:04.06+00	2019-06-19 10:31:04.06+00	\N	427	471	\N	\N	t	\N	\N	f
3114	Краснов. Леонид Плетнев	1	5	<p>Александр, добрый день! Меня зовут Плетнев Леонид. От Олега Суслова.</p>\n<p><br></p>\n<p>Можете дать бюджетную оценку (плюс минус «трамвайная остановка») разработки решения?&nbsp;</p>\n<p><br></p>\n<p>Пока верхоуровнево задача описана так:</p>\n<p><br></p>\n<p>Платформа для коммуникации с клиентами.</p>\n<p><br></p>\n<p>В текущих реалиях среднего и крупного бизнеса b2c достоверная и своевременная коммуникация с клиентом выходит в наиболее важные приоритеты компании. В современном технологическом мире точки коммуникации с клиентами стали очень разнообразными: компании уже не ограничиваются бывшими стандартами - смс, телефон и почта. На первый план выходят персонализированные коммуникации через push уведомления в телефонах, приложениях и десктопных браузерах; разнообразные мессенджеры, список которых обновляется ежегодно.</p>\n<p>Каждый из каналов общения обладает своими особенностями - скоростью доставки, возможностями форматирования контента сообщений и стоимостью коммуникации. Для того, чтобы не запутаться в каналах, не дублировать бизнес логику и контролировать стоимость коммуникации требуется единая платформа, которая позволит координировать все эти действия.</p>\n<p><br></p>\n<p>Технологическая платформа/система, должна обладать следующим техническим и бизнес функционалом.</p>\n<p>Бизнес функционал:</p>\n<p>Управление балансом стоимости коммуникаций и своевременностью коммуникаций</p>\n<p>Настройка шаблонов коммуникаций под разные каналы и типы сообщений</p>\n<p>Настройка бизнес логики по гарантированной доставке уведомлений на основе бюджета, типа коммуникации и статуса доставки</p>\n<p>Настройка бизнес логики с BPMN совместимыми условиями</p>\n<p>Версионность настроек шаблонов и бизнес логики с возможностью просмотра истории изменений с diffом и возврата к предыдущим версиям</p>\n<p>Возможность тестирования навых настроек логики и шаблонов без изменения production настроек</p>\n<p>Понятный интерфейс для перенастройки логики без участия технического специалиста</p>\n<p>Технический функционал:</p>\n<p>Вся система должна строится по логике максимального числа интеграций и модульного расширения бизнес логики.</p>\n<p>Интеграции:&nbsp;</p>\n<p>источники событий - HTTP requests, kafka messages;&nbsp;</p>\n<p>каналы коммуникаций: email, sms, push iOS, push android, push desktop, HTTP requests (json), kafka messages;&nbsp;</p>\n<p>infrastructure connectors: prometheus (monitoring), active directory (access management), ELK stack (logs), ETL compatible storage (for BI/DataLake)</p>\n<p>дополнительные запросы на обогащение информации в сообщениях: HTTP requests (json)</p>\n<p>Пропусканая способность: 100M сообщений в день (в пиках до 1K rps)</p>\n<p>Интерфесы пользователей и администраторов: Web based UI</p>\n<p>Данные:&nbsp;</p>\n<p>RPO&lt;=1h, RTO&lt;=2h.</p>\n<p>Соответствие закону о хранении и обработке персональных данных</p>	0.00	0.00	\N	3	102	2019-06-13 15:07:03.257+00	2019-06-18 08:48:03.841+00	\N	426	472	\N	102	f	\N	\N	f
3181	XWiki. Заполнение раздела "Аналитика"	1	1	<p>брифы, ux аудит</p>	0.00	0.00	\N	3	205	2019-06-18 09:02:02.062+00	2019-06-18 09:02:02.062+00	\N	428	470	\N	205	f	\N	\N	f
3116	413 при загрузке больших изображений	1	8	<p>видимо дело в nginx</p>	0.00	0.00	\N	3	183	2019-06-13 21:56:21.657+00	2019-06-13 21:59:16.848+00	\N	424	470	\N	183	f	\N	\N	f
3108	заменить домены docker.nordlcan	1	9	<p><br></p>	0.00	0.00	\N	3	186	2019-06-13 11:59:02.958+00	2019-06-13 11:59:42.258+00	\N	424	470	\N	186	f	\N	\N	f
3109	Исправить стили для цитирования	1	8	<p><br></p>	0.00	0.00	\N	2	266	2019-06-13 12:22:22.535+00	2019-06-14 07:26:48.833+00	\N	425	471	\N	212	f	\N	\N	f
3120	В мобильной версии при скроле нужно двигать меню вниз	2	8	<p><br></p>	0.00	0.00	\N	4	212	2019-06-14 08:50:12.303+00	2019-06-16 07:37:31.961+00	\N	425	471	\N	212	f	\N	\N	f
3134	FoodTechStartap	1	8	<p>Убрать этот текст с картинки полностью</p>\n<p>http://joxi.ru/E2p0Qz0t78vRX2</p>\n<p>убрать картинку</p>	0.00	0.00	\N	2	102	2019-06-14 13:11:55.398+00	2019-06-16 08:26:16.162+00	\N	425	471	\N	212	f	\N	\N	f
3158	14) Текст в ошибке - Необходимо заполнить обязательные поля.	1	8	<p><br></p>	0.00	0.00	\N	2	266	2019-06-16 18:21:22.846+00	2019-06-17 06:38:09.764+00	\N	425	471	\N	212	f	\N	\N	f
3103	При скролле прыгает меню разделов сайта	2	8	<p>При скролле вниз на странице сайта меню разделов резко меняет свое положение. Скорее всего это связано с изменением размера названия компании.&nbsp;</p>	0.00	0.00	\N	3	212	2019-06-13 10:32:00.725+00	2019-06-13 12:26:13.803+00	\N	425	471	\N	212	f	\N	\N	f
3137	Заблюрить фон на фото	1	8	<p>Размещаем http://docker.nordclan:8000/contacts/</p>\n<p>- фотку отзеркалить и заблюрить фон</p>	0.00	0.00	\N	4	102	2019-06-14 13:23:20.016+00	2019-06-17 06:44:23.793+00	\N	425	471	\N	212	f	\N	\N	f
3102	Неправильно отображается меню разделов сайта в мобильной версии	2	8	<p>При открытии сайта в мобильной ориентации браузера или на мобильном устройстве неправильно открывается меню разделов сайта, открывается направо, за пределы экрана.</p>	0.00	0.00	\N	1	212	2019-06-13 10:23:37.534+00	2019-06-13 12:30:13.834+00	\N	425	471	\N	212	f	\N	\N	f
3138	Юдин. 404	1	8	<p>из воды - морской дьявол или щупальца.</p>\n<p>щупальца держат двух людей.</p>	0.00	0.00	\N	2	102	2019-06-14 13:25:20.271+00	2019-06-17 08:39:59.145+00	\N	425	471	\N	212	f	\N	\N	f
3143	Поменять иконку в разделе "услуги" на отличную от других	1	8	<p><br></p>	0.00	0.00	\N	3	212	2019-06-16 08:45:45.446+00	2019-06-16 10:04:59.894+00	\N	425	471	\N	212	f	\N	\N	f
3112	Правки сайта 3	1	8	<p>1. разделители желтым http://joxi.ru/EA4qVQqhoKPLvr</p>\n<p><br></p>\n<p>2. все урлы сайта должны быть на английском</p>	0.00	0.00	\N	3	102	2019-06-13 14:55:34.545+00	2019-06-14 08:08:25.54+00	\N	425	471	\N	212	f	\N	\N	f
3110	Реализовать выпадающее меню для услуг с 4 услугами	1	8	<p><br></p>	0.00	0.00	\N	2	266	2019-06-13 12:27:43.236+00	2019-06-14 08:16:35.237+00	\N	425	471	\N	212	f	\N	\N	f
3166	Интеграция с Telegram	1	1	<p><br></p>	0.00	0.00	\N	4	102	2019-06-17 07:32:53.712+00	2019-06-17 09:18:14.116+00	\N	427	471	\N	\N	f	\N	\N	f
3157	15) Кракен должен держать двух людей в костюмах, один должен быть с дипломатом.	1	1	<p><br></p>	0.00	0.00	\N	5	266	2019-06-16 18:20:54.021+00	2019-06-17 09:18:21.061+00	\N	427	471	\N	336	f	\N	\N	f
3122	Изменение формы обратной связи	1	8	<p>Готовы повторить успех наших клиентов?</p>\n<p>Расскажите нам о своей задаче, и мы немедленно возьмем ее в работу:</p>\n<p><br></p>\n<p>"Напишите нам" убираем</p>\n<p><br></p>\n<p>Делаем блок вида - http://joxi.ru/Y2L7v67C78Mw9m</p>	0.00	0.00	\N	3	102	2019-06-14 10:25:58.093+00	2019-06-14 11:41:36.763+00	\N	425	471	\N	212	f	\N	\N	f
3123	Изменения меню	1	8	<p>1. убиваем страницу http://docker.nordclan:8000/mvp/ и данный пункт меню</p>\n<p>2. Делаем один пункт меню "Разработка ПО и создание MVP"</p>\n<p>ссылка http://docker.nordclan:8000/development/</p>\n<p>Идет первым</p>	0.00	0.00	\N	3	102	2019-06-14 10:32:45.124+00	2019-06-14 11:05:03.329+00	\N	425	471	\N	212	f	\N	\N	f
3171	В IE едет верстка, пропадают текстуры и прочее	2	1	<p>Версия браузера - 11.765.17134.0</p>	0.00	0.00	\N	3	212	2019-06-17 09:39:00.272+00	2019-06-18 08:27:40.652+00	\N	427	471	\N	239	f	\N	\N	f
3203	Подготовить концепцию мобильного тестирования	1	5	<p><br></p>	0.00	0.00	\N	1	212	2019-06-19 09:10:40.309+00	2019-06-28 13:28:50.871+00	\N	428	470	\N	205	f	\N	\N	f
3113	Носков. Rates.net	1	5	<p>Клиент: Артем Бойко</p>\n<p>Тип: желтый</p>\n<p>Финансист, 16 лет в сфере финансов</p>\n<p><br></p>\n<p>Цель: создать стартап, заменяющий оффлайн работу. маркет-плейс для физ/юр лиц, стоимость инвестиции от 2000$</p>\n<p><br></p>\n<p>Исходников проекта нет, &nbsp;над проектом работали 2 фрилансера.</p>\n<p><br></p>\n<p>Закон о защите персональных данных :&nbsp;</p>\n<p>https://docs.google.com/document/d/1oREA7r4ylyQb2UUQu1ZILN78hLuYeMWcAE66n5wPvqQ/edit</p>\n<p><br></p>\n<p>UCP(для клиента): https://docs.google.com/document/d/17--2hcp7nKtp1oi90jkIXc-IsvuNgUU6UD1MNfIk1cM/edit</p>\n<p>&nbsp;</p>	0.00	0.00	\N	3	102	2019-06-13 14:59:21.005+00	2019-06-14 10:57:38.295+00	\N	426	472	\N	102	f	\N	\N	f
3129	Изменения текстов:	1	8	<p>Текст о нас.&nbsp;</p>\n<p><br></p>\n<p><br></p>\n<p>С кем мы работаем? - заголовком, большой текст</p>\n<p><br></p>\n<p><br></p>\n<p>Отбивка на новую строку и bold - ом</p>\n<p>- Я сделал вывод, что формирование отношений &nbsp;win-win, между исполнителем и заказчиком — это проактивный процесс.</p>\n<p>- Мы бережем время, свое и своих клиентов, поскольку считаем, что это бесценный ресурс.</p>\n<p>- Мы имеем преимущество на рынке за счет фокуса на оказании услуг по разработке программного обеспечения для финтеха, фудтеха, медицины и сельского хозяйства.</p>	0.00	0.00	\N	3	102	2019-06-14 13:02:29.48+00	2019-06-14 13:41:53.492+00	\N	425	471	\N	212	f	\N	\N	f
3183	Проверить нормочасы в Bucksman	1	1	<p><br></p>	0.00	0.00	\N	3	205	2019-06-18 09:03:21.344+00	2019-06-18 09:03:21.344+00	\N	428	470	\N	205	f	\N	\N	f
3184	Кейсы для сайта	1	1	<p>Управление<br>\nФича Андрея Золотова</p>	0.00	0.00	\N	3	205	2019-06-18 09:04:32.142+00	2019-06-18 09:04:32.142+00	\N	428	470	\N	205	f	\N	\N	f
3188	Перенести бекап в nas (машина 1)	1	1	<p><br></p>	0.00	0.00	\N	3	186	2019-06-18 09:58:26.598+00	2019-06-18 09:58:26.598+00	\N	428	470	\N	186	f	\N	\N	f
3163	Краснов. React native	1	3	<p>Френкель в качестве тимлида комнады на RN для мобильного приложения для sales force</p>	0.00	0.00	\N	3	102	2019-06-17 06:22:09.09+00	2019-06-17 06:22:14.615+00	\N	426	472	\N	102	f	\N	\N	f
3125	Правки	1	8	<p>1. Блок Услуги</p>\n<p>сменить иконки. http://joxi.ru/5mdxedxt3KqoJm</p>\n<p>В "Нас выбирают, потому что" все картинки оставляем как есть</p>\n<p><br></p>\n<p>2. http://joxi.ru/bmoGjxGS3jOg7m</p>\n<p>Блок заголовка ВЫШЕ фоточек</p>\n<p><br></p>\n<p>3.&nbsp;Страница о нас:</p>\n<p>- фотки выровнять по верху цитаты</p>\n<p>- тексты в кавычках все, которые от людей</p>\n<p>- вертикальная полоса на другой стороне от фото(дубликат)</p>\n<p><br></p>\n<p><br></p>	0.00	0.00	\N	3	102	2019-06-14 12:51:50.729+00	2019-06-16 08:47:17.313+00	\N	425	471	\N	212	f	\N	\N	f
3159	13) Сделайте подписи "волшебников и стражей " не жирным и сереньким	1	8	<p><br></p>	0.00	0.00	\N	3	266	2019-06-16 18:22:14.719+00	2019-06-17 06:24:24.081+00	\N	425	471	\N	212	f	\N	\N	f
3121	Правки верстка 4	1	8	<p>1. Убрать адрес Радищева в подвале</p>\n<p>2. В услугах вместо Далее вернем стрелочку, только чтоб она всегда была вида</p>\n<p>3. Нас выбирают потому что - порядок меняем:</p>\n<p><br></p>\n<p>Обеспечиваем результат 100% в срок или вернем неустойку за просрочку</p>\n<p><br></p>\n<p>Вы получаете ровно тот результат, который ожидаете</p>\n<p><br></p>\n<p>С нами удобно</p>\n<p><br></p>\n<p>4. Блок Напишите нам располагаем выше формы обратной связи</p>\n<p><br></p>\n<p>5. http://joxi.ru/VrwLZVLi7544Pm то есть если фотка справа, то полоска слева и наоборот</p>\n<p><br></p>\n<p>6. Добавить маску на email и телефон на форме обратной связи</p>\n<p><br></p>	0.00	0.00	\N	1	102	2019-06-14 08:57:47.54+00	2019-06-16 09:20:46.087+00	\N	425	471	\N	212	f	\N	\N	f
3127	Юдин. Выделить форму обратной связи дизайном	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-14 12:59:51.541+00	2019-06-17 06:38:33.882+00	\N	425	471	\N	212	f	\N	\N	f
3128	Валидация клиентская на форме	1	8	<p>Указать звездочки возле обязательных полей</p>\n<p>Маски на email и телефон</p>\n<p>Ограничения на кол-во символов нет или оно оооооч большое</p>	0.00	0.00	\N	2	102	2019-06-14 13:01:06.021+00	2019-06-16 10:03:46.113+00	\N	425	471	\N	212	f	\N	\N	f
3147	раздел услуги (в футере) кликабелен и ведет на другую страницу, исправить на не кликабельные услуги и подсписок из 3х кликабельных ссылок на страницы реальных услуг.	2	8	<p><br></p>	0.00	0.00	\N	1	239	2019-06-16 17:32:38.064+00	2019-06-17 06:41:10.135+00	\N	425	471	\N	212	t	\N	\N	f
3146	маска е-мейла позволяет вбивать только цифры (не воспроизводится)	2	8	<p><br></p>	0.00	0.00	\N	1	239	2019-06-16 17:31:34.031+00	2019-06-17 08:39:00.907+00	\N	425	471	\N	212	t	\N	\N	f
3167	АвтоТесты на отправку формы	1	1	<p><br></p>	0.00	0.00	\N	4	102	2019-06-17 08:42:26.858+00	2019-06-17 09:18:08.906+00	\N	427	471	\N	212	f	\N	\N	f
3175	Заполнить информацию об инфраструктуре в xwiki	1	1	<p>Необходимо внести в xwiki следующую информацию:</p>\n<p>- описание серверов и их предназначение</p>\n<p>- используемые системы - кратко для чего используются (пароли должны храниться в отдельной системе)</p>\n<p>- Правила бэкапа и восстановления &nbsp;систем</p>\n<p>- Инструкция создания нового пользователя/блокировки</p>\n<p>- Инструкция разворачивания докеров, виртуалок и т.д. для тестового окружения</p>	0.00	0.00	\N	2	1	2019-06-17 18:07:27.672+00	2019-06-17 18:07:27.672+00	\N	424	470	\N	186	f	\N	\N	f
3136	Тексты. Услуги	1	8	<p>http://joxi.ru/zANNvdNTvV1pXA</p>\n<p>Напишите нам - это первый пункт меню. итого их 5</p>\n<p><br></p>\n<p>http://joxi.ru/eAOJvLJU97vyb2</p>\n<p>от Идеи - заголовок.&nbsp;</p>\n<p>Развить готовую систему - заголовок</p>	0.00	0.00	\N	3	102	2019-06-14 13:16:42.876+00	2019-06-16 08:03:42.963+00	\N	425	471	\N	212	f	\N	\N	f
3139	404. Тексты	1	8	<p>Заблудился в мире ИТ?&nbsp;</p>\n<p>Звони, спасем! телефон</p>	0.00	0.00	\N	3	102	2019-06-14 13:25:49.207+00	2019-06-16 08:55:27.899+00	\N	425	471	\N	212	f	\N	\N	f
3107	на 3 машину развернуть FreeNAS	1	5	<p><br></p>	0.00	0.00	\N	3	186	2019-06-13 11:58:28.406+00	2019-06-18 09:54:24.462+00	\N	424	470	\N	186	f	\N	\N	f
3141	Добавить технологии и особенности - медицина, гостиница	1	10	<p>Необходимо в портфолио добавить технические сведения</p>\n<p>по аналогии &nbsp;с&nbsp;</p>\n<p>Особенности проекта</p>\n<p><br></p>\n<p>Наличие комплекса NDVI (нормализованный относительный индекс растительности).</p>\n<p>Графическая поддержка карт точного земледелия.</p>\n<p>Интеграция с мессенджерами и сервисами погоды.</p>\n<p>Визуализация данных с использованием технологии Canvas для высокой производительности при отрисовке большого количества данных.</p>\n<p>Использование векторной графики при построении карт для детализации изображений без потери качества.</p>\n<p>Стек технологий OpenStreetMap, Java, Spring, React, Postgres.</p>	0.00	0.00	\N	2	102	2019-06-14 13:35:53.929+00	2019-06-19 09:16:14.296+00	\N	425	471	\N	266	f	\N	\N	f
3178	[Оптимизация] Ускорить загрузку страницы nordclan.com/development/	1	1	<p>https://metrika.yandex.ru/dashboard?group=dekaminute&amp;period=today&amp;id=54093205<br>\nЯндекс метрика</p>\n<p>Скорость по загрузке DOM</p>\n<p>nordclan.com/development/\t05.076</p>\n<p>Скорость по отрисовке</p>\n<p>nordclan.com/development/\t04.502</p>	0.00	0.00	\N	4	266	2019-06-18 07:34:30.728+00	2019-06-18 08:27:11.56+00	\N	427	471	\N	239	f	\N	\N	f
3185	Регламент по обработке запросов от потенциальных клиентов	1	1	<p><br></p>	0.00	0.00	\N	3	205	2019-06-18 09:05:48.833+00	2019-06-18 09:05:48.833+00	\N	428	470	\N	205	f	\N	\N	f
3090	EM. Справочники и нормочасы	1	8	<p><br></p>	0.00	0.00	\N	3	102	2019-06-11 17:57:57.899+00	2019-06-18 10:00:20.205+00	\N	428	470	\N	1	f	\N	\N	f
3140	Портфолио. Теги	1	8	<p>Выводить теги под заголовком поста блога. http://joxi.ru/EA4qVQqhoK0wjr</p>	0.00	0.00	\N	2	102	2019-06-14 13:28:04.717+00	2019-06-16 09:52:22.199+00	\N	425	471	\N	212	f	\N	\N	f
3190	ST: открыть кнопку Создания проекта для всех глобальных ролей	1	1	<p><br></p>	0.00	0.00	\N	2	102	2019-06-18 10:14:04.876+00	2019-06-18 10:14:04.876+00	\N	428	470	\N	\N	f	\N	\N	f
3131	Тексты. Как мы работаем	1	8	<p>http://docker.nordclan:8000/our-work/</p>\n<p>заголовки&nbsp;</p>\n<p>"Вы всегда знаете, что происходит с продуктом и проектом:" и ниже подобные(всего 6 штук)</p>\n<p>шрифт большой, как заголовок.</p>\n<p>Разделители между ними как на главной http://joxi.ru/Vm6MV6Mt4X3Z1r</p>\n<p><br></p>\n<p>Добавить картинку у доски</p>	0.00	0.00	\N	3	102	2019-06-14 13:08:01.425+00	2019-06-16 10:05:55.83+00	\N	425	471	\N	212	f	\N	\N	f
3192	ST: Разработать скрипт миграции LDAP пользователей и групп	1	1	<p><br></p>	0.00	0.00	\N	3	183	2019-06-18 11:08:22.782+00	2019-06-18 11:08:22.782+00	\N	428	470	\N	\N	f	\N	\N	f
3207	Создать качественную презентацию	1	1	<p>Правильный путь:&nbsp;</p>\n<p>1) Позиционирование - кому, почему, что.</p>\n<p>2) Тексты</p>\n<p>3) Картинки (не ворованные) к текстам</p>\n<p>3) Дизайн</p>	0.00	0.00	\N	1	35	2019-06-19 11:15:11.159+00	2019-06-19 11:52:59.667+00	\N	428	470	\N	344	t	\N	\N	f
3161	Bug: Гостиница	1	8	<p>http://joxi.ru/nAyZRnZTgW4zWr</p>	0.00	0.00	\N	1	102	2019-06-17 06:14:44.823+00	2019-06-17 06:20:15.359+00	\N	425	471	\N	212	f	\N	\N	f
3149	Зачем эта гигантская картинка здесь? Уберите пожалуйста.	2	8	<p><br></p>	0.00	0.00	\N	2	239	2019-06-16 17:35:35.644+00	2019-06-17 06:40:28.11+00	\N	425	471	\N	212	t	\N	\N	f
3144	Меню не в дизайне, +мелкий шрифт.	2	8	<p><br></p>	0.00	0.00	\N	1	239	2019-06-16 17:30:00.821+00	2019-06-17 07:54:47.503+00	\N	425	471	\N	212	t	\N	\N	f
3130	Юдин. Подложка	1	8	<p>http://docker.nordclan:8000/contacts/</p>\n<p>Нужна подложка для</p>\n<p>"Однажды поработав с нами, 95% клиентов обращаются повторно — это значит, что с нами они уверены в получении лучшего ИТ-решения для нужд своего бизнеса!</p>\n<p>Половина наших новых клиентов — это обращения по рекомендациям.</p>\n<p>Обычно рекомендуют тех, чьей работой остались довольны."</p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>\n<p><br></p>	0.00	0.00	\N	3	102	2019-06-14 13:05:33.901+00	2019-06-17 08:45:54.248+00	\N	425	471	\N	212	f	\N	\N	f
3148	Страницы услуг, в конце каждой страницы перед отправкой сообщения должна быть призывалка на страницу как мы работаем.	2	9	<p><br></p>	0.00	0.00	\N	3	239	2019-06-16 17:34:47.23+00	2019-06-17 09:16:40.887+00	\N	425	471	\N	\N	t	\N	\N	f
3156	16) Добавить хлебные крошки. Актуально если смотреть с телефона.	1	1	<p><br></p>	0.00	0.00	\N	3	266	2019-06-16 18:20:13.548+00	2019-06-17 09:18:31.422+00	\N	427	471	\N	239	f	\N	\N	f
3164	UI: Меню	1	8	<p>- пункты меню чуть шире</p>\n<p>- открытие подменю с анимацией</p>	0.00	0.00	\N	2	102	2019-06-17 07:31:22.784+00	2019-06-17 11:44:54.286+00	\N	425	471	\N	212	f	\N	\N	f
3174	В FF на форме обратной связи не спадают маски после потери фокуса на поле	2	8	<p>Версия браузера - 67.0.2</p>	0.00	0.00	\N	3	212	2019-06-17 10:26:51.896+00	2019-06-17 11:48:22.068+00	\N	425	471	\N	212	f	\N	\N	f
3173	В IE при отправке формы обратной связи неправильно подсвечиваются поля	2	1	<p>В IE при отправке формы обратной связи и незаполненном обязательном поле неправильно подсвечиваются поля, которые нужно заполнить. Выделяются абсолютно все поля, даже заполненные корректно.</p>\n<p>Версия браузера - 11.765.17134.0</p>	0.00	0.00	\N	3	212	2019-06-17 10:06:52.472+00	2019-06-18 08:27:45.908+00	\N	427	471	\N	239	f	\N	\N	f
3165	Добавить Яндекс метрику	1	7	<p><br></p>	0.00	0.00	\N	2	102	2019-06-17 07:32:03.22+00	2019-06-18 08:27:56.525+00	\N	427	471	\N	212	f	\N	\N	f
3133	Вывести заголовок блока Портфолио	1	8	<p>http://joxi.ru/4AkJjyJUo5jOP2</p>	0.00	0.00	\N	3	102	2019-06-14 13:10:49.262+00	2019-06-16 07:44:37.462+00	\N	425	471	\N	212	f	\N	\N	f
3118	Краснов. DiaSoft	1	5	<p>https://www.diasoft.ru/</p>\n<p><br></p>\n<p>Будут делать внутренний продукт, mvp. Сейчас в процессе получения аппрува на разработку</p>	0.00	0.00	\N	3	102	2019-06-14 06:51:30.426+00	2019-06-19 06:09:02.959+00	\N	426	472	\N	102	f	\N	\N	f
3179	SEO Настройка семантического ядра	1	3	<p><br></p>	8.00	0.00	\N	3	266	2019-06-18 07:37:17.356+00	2019-07-02 11:36:13.85+00	\N	427	471	\N	183	f	\N	\N	f
3210	SEO Настройка поисковой выдачи	1	8	<p><br></p>	4.00	0.00	\N	3	266	2019-06-19 14:40:50.258+00	2019-07-02 11:36:20.812+00	\N	427	471	\N	266	f	\N	\N	f
3189	Перенос корпоративных сервисов компании (боевых)	1	1	<p>Необходимо перенести боевые сервисы на отдельный сервер, с возможности настройки безопасности (паролей и т.д.) отдельно от тестового окружения</p>	0.00	0.00	\N	1	1	2019-06-18 10:02:01.827+00	2019-06-18 10:02:01.827+00	\N	428	470	\N	186	f	\N	\N	f
3150	Нет тега сельское хозяйство под "Инновации как гарант"	2	8	<p><br></p>	0.00	0.00	\N	2	239	2019-06-16 17:36:57.311+00	2019-06-17 06:20:47.497+00	\N	425	471	\N	212	t	\N	\N	f
3151	Теги  -кликабельны, что сбивает с толку. Сделать не ссылкой. Поставьте # перед каждым тегом	2	8	<p><br></p>	0.00	0.00	\N	2	239	2019-06-16 17:37:47.559+00	2019-06-17 06:21:07.016+00	\N	425	471	\N	212	t	\N	\N	f
3152	Уберите кликабельность дат	2	8	<p><br></p>	0.00	0.00	\N	2	239	2019-06-16 17:38:18.708+00	2019-06-17 06:22:19.119+00	\N	425	471	\N	212	t	\N	\N	f
3191	Изменение отчетов по времени	1	1	<p>- сделать страницу общих отчетов по времени(доступно для ролей Администратор и наблюдатель)</p>\n<p>- фильтры по пользователям</p>\n<p>- список всех часов по проектам (аналог как в проекте в отчетах по времени)</p>\n<p>- выгрузка аналогична выгрузке отчетов из проекта</p>	0.00	0.00	\N	2	102	2019-06-18 10:15:58.049+00	2019-06-18 10:18:45.408+00	\N	428	470	\N	\N	f	\N	\N	f
3145	При нажатии на меню услуги не выходит подменю с 3мя пунктами услуг.	2	8	<p><br></p>	0.00	0.00	\N	1	239	2019-06-16 17:30:37.21+00	2019-06-17 06:43:29.783+00	\N	425	471	\N	212	t	\N	\N	f
3193	BM: Разработать скрипт миграции LDAP пользователей и групп	1	1	<p><br></p>	0.00	0.00	\N	3	183	2019-06-18 11:08:33.209+00	2019-06-18 11:08:33.209+00	\N	428	470	\N	\N	f	\N	\N	f
3186	Интерфейс списка нарушений	1	3	<p>https://redmine.fabit.ru/issues/22168</p>	0.00	0.00	\N	3	183	2019-06-18 09:46:06.089+00	2019-06-18 11:14:50.83+00	\N	\N	473	\N	183	f	\N	\N	f
3187	Интерфейс настройки камеры Взор	1	3	<p>https://redmine.fabit.ru/issues/24544</p>	0.00	0.00	\N	3	183	2019-06-18 09:46:51.622+00	2019-06-18 11:14:57.149+00	\N	\N	473	\N	183	f	\N	\N	f
3162	Bug. Тексты: многоточие	1	8	<p>http://joxi.ru/eAOJvLJU97d562</p>	0.00	0.00	\N	1	102	2019-06-17 06:17:52.349+00	2019-06-17 07:23:07.951+00	\N	425	471	\N	212	f	\N	\N	f
3155	Заголовок и пункты подразделов (- от Идеи) одним размером шрифта что сбивает с толку.	2	8	<p><br></p>	0.00	0.00	\N	2	239	2019-06-16 17:40:32.705+00	2019-06-17 07:55:30.547+00	\N	425	471	\N	212	t	\N	\N	f
3169	Согласие на обработку данных	1	1	<p><br></p>	0.00	0.00	\N	3	102	2019-06-17 08:59:45.873+00	2019-06-17 09:18:02.707+00	\N	427	471	\N	\N	f	\N	\N	f
3201	Разработать концепцию обеспечения качества для компании	1	1	<p><br></p>	0.00	0.00	\N	2	212	2019-06-19 07:44:10.851+00	2019-06-19 07:45:57.618+00	\N	424	470	\N	212	f	\N	\N	f
3160	Ссылку и якорь на форму обратной связи	1	8	<p>http://joxi.ru/eAOJvLJU97dX62</p>\n<p>добавить ссылку и якорь вниз на форму обратной связи</p>	0.00	0.00	\N	1	102	2019-06-17 06:13:53.402+00	2019-06-17 09:28:21.916+00	\N	425	471	\N	212	f	\N	\N	f
3153	В ИЕ есть крестик, его логика совсем не работает (убрать?)	2	8	<p><br></p>	0.00	0.00	\N	3	239	2019-06-16 17:39:06.954+00	2019-06-17 09:41:57.98+00	\N	425	471	\N	212	t	\N	\N	f
3154	сафари на айпаде вообще вся верстка едет на главной	2	8	<p><br></p>	0.00	0.00	\N	1	239	2019-06-16 17:39:44.043+00	2019-06-17 09:42:01.188+00	\N	425	471	\N	212	t	\N	\N	f
3170	Тексты. Предлагаем удобные схемы сотрудничества и оплаты	1	8	<p>Внизу каждой страницы Услуг добавить желтый блок с текстом "Предлагаем удобные схемы сотрудничества и оплаты" и ссылкой на https://nordclan.com/our-work/</p>	0.00	0.00	\N	1	102	2019-06-17 09:16:30.511+00	2019-06-17 11:58:29.747+00	\N	425	471	\N	212	f	\N	\N	f
3135	Добавить технологии и особенности проекта ФудТех	1	10	<p>Необходимо в портфолио добавить технические сведения</p>\n<p>по аналогии &nbsp;с&nbsp;</p>\n<p>Особенности проекта</p>\n<p><br></p>\n<p>Наличие комплекса NDVI (нормализованный относительный индекс растительности).</p>\n<p>Графическая поддержка карт точного земледелия.</p>\n<p>Интеграция с мессенджерами и сервисами погоды.</p>\n<p>Визуализация данных с использованием технологии Canvas для высокой производительности при отрисовке большого количества данных.</p>\n<p>Использование векторной графики при построении карт для детализации изображений без потери качества.</p>\n<p>Стек технологий OpenStreetMap, Java, Spring, React, Postgres.</p>	0.00	0.00	\N	3	102	2019-06-14 13:15:13.891+00	2019-06-19 09:16:23.055+00	\N	425	471	\N	266	f	\N	\N	f
3176	Замечания к контенту	1	8	<p>https://nordclan.com/development/:</p>\n<ul>\n  <li>заменить "Затем мы вместе развивать идею в полноценное приложение." на "Затем мы вместе развиваем идею в полноценное приложение."</li>\n  <li>заменить "Развить готовую систему" на &nbsp;"До развития готовой системы"</li>\n  <li>заменить "Вы получаете видимый результат уже в первые две-три недели после старта работ." на "Вы получаете видимый результат уже в первые 2-3 недели после старта работ."</li>\n</ul>\n<p>https://nordclan.com/engineering/:</p>\n<ul>\n  <li>заменить "Делаем из устаревающей IT-системы современную:" на "Делаем из устаревающей ИТ-системы современную:"</li>\n  <li>заменить "оцениваем что должно остаться." на "оцениваем, что должно остаться."</li>\n</ul>\n<p>https://nordclan.com/contacts/:</p>\n<ul>\n  <li>единообразно регалии нужно оформить</li>\n  <li>&nbsp;убрать запятую - "и нашим клиентам, полностью"&nbsp;</li>\n  <li>убрать точку - "нашей компетенции.и прислушиваться"&nbsp;</li>\n</ul>\n<p>https://nordclan.com/projects/hospitality/, https://nordclan.com/projects/medical/,&nbsp; https://nordclan.com/projects/foodtech/ (только в блоке "Особенности проекта")</p>\n<ul>\n  <li>в списках заменить ";" на "."</li>\n</ul>\n<p>На внутренней странице подменю "услуги" раскрывать при наведении - записала, нужно обсудить</p>\n<p><br>\n</p>	0.00	0.00	\N	3	205	2019-06-18 06:20:04.342+00	2019-06-19 13:40:07.567+00	\N	427	471	\N	212	f	\N	\N	f
3195	ST: Устранение утечки памяти в процессе sendMail	1	1	<p>два скриншоты демонистрируют на сколько все плохо.&nbsp;</p>\n<p>300 мегабайт утекают за час работы сервера</p>	0.00	0.00	\N	1	183	2019-06-18 12:17:32.392+00	2019-06-18 12:26:22.277+00	\N	428	470	\N	\N	f	\N	\N	f
3199	Отключить обновление WP	1	8	<p><br></p>	0.00	0.00	\N	1	102	2019-06-19 06:00:03.274+00	2019-06-19 13:40:04.425+00	\N	427	471	\N	212	f	\N	\N	f
3198	ST: Перенос на отдельную машину	1	10	<p>Настройка новой docker машины</p>\n<p>Создание отдельной базы postgresql, redis</p>\n<p>Настройка ansible deploy</p>	0.00	0.00	\N	3	183	2019-06-19 05:59:15.152+00	2019-07-10 08:07:57.258+00	\N	428	470	\N	266	f	\N	\N	f
3172	Изображения. Оптимизация изображений на странице	1	8	<p>Некоторые изображения на странице весят много, хотя фактический их размер используемый не большой</p>\n<p><br></p>\n<p>например на странице портфолио некоторые изображения в png весят 800кб</p>\n<p>Это кретично для мобильного интернета</p>\n<p><br></p>\n<p>Желательно использовать оптимизацию изображений + использовать формат jpg вместо png а также уменьшить размер изображений до фактически используемого</p>	0.00	0.00	\N	3	183	2019-06-17 09:44:47.184+00	2019-06-19 06:46:51.53+00	\N	427	471	\N	212	f	\N	\N	f
3208	ST: Перекрасить UI в корпоративные цвета	1	1	<p><br></p>	3.00	0.00	\N	3	336	2019-06-19 14:03:26.746+00	2019-06-19 14:03:42.883+00	\N	428	470	\N	336	f	\N	\N	f
3196	Создать группу Facebook	1	3	<p>ориентироваться на группу SS</p>\n<p>Завести на отдельного пользователя и почту.</p>	4.00	0.00	\N	2	102	2019-06-18 13:31:52.565+00	2019-06-19 07:47:25.506+00	\N	428	470	\N	205	f	\N	\N	f
3202	Найти подходящего поставщика телефонии	1	1	<p>Проверить задарма в первую очередь, по возможности взять триалку.</p>\n<p>требуется</p>\n<p>виртуальный номер</p>\n<p>вирт атс&nbsp;</p>\n<p>софтофоны</p>	0.00	0.00	\N	2	212	2019-06-19 07:47:09.644+00	2019-06-19 08:24:04.883+00	\N	424	470	\N	212	f	\N	\N	f
3168	Верстка письма формы обратной связи	1	7	<p>Отправитель: Site NordClan</p>\n<p>тема письма: &nbsp;Заявка с сайта</p>\n<p>Имя: тест&nbsp;</p>\n<p>Компания: тест&nbsp;</p>\n<p>Телефон: +7 948 537 63 62&nbsp;</p>\n<p>Email: ilya.kashtankin@nordclan.com&nbsp;</p>\n<p>Описание: dfdvfdfs</p>	0.00	0.00	\N	2	102	2019-06-17 08:42:52.74+00	2019-06-19 14:14:51.89+00	\N	427	471	\N	212	f	\N	\N	f
3204	Подготовить инструменты для ручного мобильного тестирования	1	10	<p><br></p>	4.00	0.00	\N	1	266	2019-06-19 09:35:38.981+00	2019-06-28 13:24:38.885+00	\N	428	470	3203	266	t	\N	\N	f
3200	Подготовиться к интервью по Java	1	5	<p><br></p>	0.00	0.00	\N	1	212	2019-06-19 07:43:44.631+00	2019-07-02 07:29:21.004+00	\N	424	470	\N	212	f	\N	\N	f
3205	Заказ звонка	1	3	<p>Фича позволяет заказать звонок клиенту&nbsp;</p>\n<p>Функциональность есть на сайте айтека</p>\n<p><br></p>\n<p>http://joxi.ru/nAyZRnZTgWJwkr</p>\n<p>обязательный только телефон - первым элементом формы</p>\n<p>время - по дефолту "как можно скорее"</p>\n<p>Имя и Сообщение</p>	0.00	0.00	\N	1	35	2019-06-19 10:28:01.688+00	2019-07-02 07:34:14.118+00	\N	427	471	\N	266	t	\N	\N	t
3194	SEO Настроить отображение привьюхи в соц сетях	1	1	<p><br></p>	0.00	0.00	\N	2	266	2019-06-18 12:03:34.296+00	2019-07-02 07:36:46.333+00	\N	427	471	\N	266	f	\N	\N	f
3209	SEO sitemap	1	1	<p><br></p>	4.00	0.00	\N	3	266	2019-06-19 14:24:14.665+00	2019-07-02 07:36:47.924+00	\N	427	471	\N	266	f	\N	\N	f
3106	добавить поле photo в ldap	1	7	<p><br></p>	0.00	0.00	\N	2	186	2019-06-13 11:58:01.526+00	2019-07-02 11:36:19.141+00	\N	424	470	\N	266	f	\N	\N	f
3211	test	1	8	<p><br></p>	13.00	0.00	\N	3	266	2019-07-02 07:25:02.59+00	2019-07-10 08:11:47.165+00	\N	428	470	\N	212	t	\N	\N	t
3197	Артамонов. Go Wash	1	1	<p>Клиент: не ИТ и никогда не работал с подрядчиками.</p>\n<p>Желание: сделать свою систему на основе системы конкурента.</p>\n<p><br></p>\n<p>Для доступа к сайту mywasher.pro используйте следующие данные:&nbsp;</p>\n<p><br></p>\n<p>Логин: ceo@go-wash.ru</p>\n<p>Пароль: qwerty1234</p>\n<p>&nbsp;</p>\n<p><br></p>\n<p>&nbsp;</p>\n<p>Краткое описание проекта</p>\n<p>&nbsp;</p>\n<p>ERP система для автомойки, детейлинга и шиномонтажа. + элементы CRM и WMS (warehouse management system).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Создание операций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Сбор, анализ и визуализация, доходов, расходов и операционной статистики</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление запасами и складом</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление персоналом и расчет зарплат</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Управление скидками, начислением баллов, создание промо акций</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Блок контроля за подписками и сбора статистики по клиентам</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Синхронизация с внешними сервисами по API</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Интеграция с камерой с определением номера машины в боксе временем въезда и выезда</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Кассовый учет, кассовые операции (фискальный регистратор, либо онлайн касса).</p>\n<p><br></p>\n<p>· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Система по управлению хранением колес</p>	16.00	0.00	\N	3	102	2019-06-18 14:09:53.222+00	2019-07-02 07:32:19.293+00	\N	426	472	\N	205	f	\N	\N	f
3212	цуццу	1	7	<p><br></p>	4.00	0.00	\N	2	266	2019-07-02 07:33:53.311+00	2019-07-02 11:35:56.577+00	\N	428	470	\N	266	t	\N	\N	t
\.


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.tasks_id_seq', 3212, true);


--
-- Data for Name: timesheets; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.timesheets (id, sprint_id, task_id, user_id, on_date, type_id, spent_time, comment, is_billable, user_role_id, task_status_id, status_id, is_visible, created_at, updated_at, project_id, external_id) FROM stdin;
3918	425	3084	239	2019-06-12	1	3.00	\N	t	[6]	1	1	t	2019-06-13 08:00:27.621+00	2019-06-13 08:00:27.621+00	471	\N
3919	425	3097	239	2019-06-13	1	1.00	\N	t	[6]	3	1	t	2019-06-13 09:41:54.387+00	2019-06-13 09:41:54.387+00	471	\N
3920	425	3096	239	2019-06-13	1	0.25	\N	t	[6]	3	1	t	2019-06-13 09:50:29.953+00	2019-06-13 09:50:29.953+00	471	\N
3969	425	3177	266	2019-06-17	1	3.00	\N	t	[9]	3	1	t	2019-06-18 07:01:09.277+00	2019-06-18 07:35:44.008+00	471	\N
3970	427	3179	266	2019-06-18	1	2.00	\N	t	[9]	3	1	t	2019-06-18 08:40:02.496+00	2019-06-18 08:40:02.496+00	471	\N
3923	425	3094	239	2019-06-13	1	1.50	\N	t	[6]	3	1	t	2019-06-13 11:00:50.61+00	2019-06-13 11:00:50.61+00	471	\N
3924	425	3102	239	2019-06-13	1	1.00	\N	t	[6]	3	1	t	2019-06-13 12:08:52.259+00	2019-06-13 12:08:52.259+00	471	\N
3925	425	3103	239	2019-06-13	1	0.50	\N	t	[6]	3	1	t	2019-06-13 12:09:19.589+00	2019-06-13 12:09:19.589+00	471	\N
3927	\N	\N	266	2019-06-13	4	0.80	\N	f	\N	2	1	t	2019-06-13 12:59:17.883+00	2019-06-13 12:59:17.883+00	0	\N
3928	425	3104	239	2019-06-13	1	0.50	\N	t	[6]	3	1	t	2019-06-13 14:22:22.527+00	2019-06-13 14:22:22.527+00	471	\N
3929	425	3109	239	2019-06-13	1	0.50	\N	t	[6]	3	1	t	2019-06-13 14:59:56.815+00	2019-06-13 14:59:56.815+00	471	\N
3930	425	3111	239	2019-06-14	1	0.50	\N	t	[6]	1	1	t	2019-06-14 08:01:35.703+00	2019-06-14 08:01:35.703+00	471	\N
3931	425	3110	239	2019-06-13	1	0.50	\N	t	[6]	3	1	t	2019-06-14 08:03:32.754+00	2019-06-14 08:03:32.754+00	471	\N
3932	425	3112	239	2019-06-13	1	0.25	\N	t	[6]	3	1	t	2019-06-14 08:07:07.805+00	2019-06-14 08:07:07.805+00	471	\N
3922	425	3084	239	2019-06-13	1	2.00	\N	t	[6]	3	1	t	2019-06-13 10:07:50.65+00	2019-06-14 08:07:27.739+00	471	\N
3934	425	3119	239	2019-06-14	1	0.50	\N	t	[6]	1	1	t	2019-06-14 10:27:57.642+00	2019-06-14 10:27:57.642+00	471	\N
3935	425	3123	266	2019-06-14	1	0.50	\N	t	[9]	3	1	t	2019-06-14 10:43:12.723+00	2019-06-14 10:43:12.723+00	471	\N
3936	425	3129	266	2019-06-14	1	0.20	\N	t	[9]	3	1	t	2019-06-14 13:08:32.247+00	2019-06-14 13:08:32.247+00	471	\N
3937	425	3132	266	2019-06-14	1	0.20	\N	t	[9]	3	1	t	2019-06-14 18:27:50.118+00	2019-06-14 18:27:50.118+00	471	\N
3938	425	3136	266	2019-06-14	1	0.20	\N	t	[9]	3	1	t	2019-06-14 18:28:53.789+00	2019-06-14 18:28:53.789+00	471	\N
3939	425	3131	266	2019-06-14	1	0.20	\N	t	[9]	3	1	t	2019-06-14 18:30:27.716+00	2019-06-14 18:30:27.716+00	471	\N
3971	427	3176	266	2019-06-18	1	1.00	\N	t	[9]	3	1	t	2019-06-18 09:36:15.779+00	2019-06-18 09:36:15.779+00	471	\N
3972	424	3099	183	2019-06-18	1	1.00	\N	t	[6]	3	1	t	2019-06-18 11:08:43.196+00	2019-06-18 11:08:43.196+00	470	\N
3973	\N	3186	183	2019-06-17	1	3.00	\N	t	[6]	3	1	t	2019-06-18 11:15:28.148+00	2019-06-18 11:15:28.148+00	473	\N
3974	\N	3187	183	2019-06-17	1	5.00	\N	t	[6]	3	1	t	2019-06-18 11:15:32.978+00	2019-06-18 11:15:32.978+00	473	\N
3940	425	3093	266	2019-06-14	1	6.70	\N	t	[9]	3	1	t	2019-06-14 18:31:24.823+00	2019-06-14 19:03:25.753+00	471	\N
3941	425	3124	239	2019-06-14	1	3.00	\N	t	[6]	3	1	t	2019-06-14 19:55:00.361+00	2019-06-14 19:55:00.361+00	471	\N
3942	425	3125	239	2019-06-14	1	0.00	\N	t	[6]	3	1	t	2019-06-14 21:16:22.073+00	2019-06-14 21:16:22.073+00	471	\N
3943	425	3125	239	2019-06-15	1	1.50	\N	t	[6]	3	1	t	2019-06-14 21:16:26.976+00	2019-06-14 21:16:26.976+00	471	\N
3944	425	3121	239	2019-06-14	1	4.00	\N	t	[6]	3	1	t	2019-06-14 21:21:27.268+00	2019-06-14 21:21:27.268+00	471	\N
3945	425	3139	239	2019-06-15	1	1.00	\N	t	[6]	3	1	t	2019-06-14 22:32:27.402+00	2019-06-14 22:32:27.402+00	471	\N
3946	425	3133	239	2019-06-15	1	1.00	\N	t	[6]	3	1	t	2019-06-14 23:06:14.391+00	2019-06-14 23:06:14.391+00	471	\N
3975	\N	3187	239	2019-06-18	1	6.00	\N	t	[6]	3	1	t	2019-06-19 07:23:15.933+00	2019-06-19 07:23:15.933+00	473	\N
3976	427	3179	239	2019-06-17	1	1.00	\N	t	[6]	3	1	t	2019-06-19 07:24:02.433+00	2019-06-19 07:24:02.433+00	471	\N
3947	425	3140	239	2019-06-15	1	0.75	\N	t	[6]	3	1	t	2019-06-15 07:37:42.802+00	2019-06-15 07:37:54.71+00	471	\N
3948	425	3120	239	2019-06-16	1	2.00	\N	t	[6]	3	1	t	2019-06-15 20:43:39.533+00	2019-06-15 20:43:39.533+00	471	\N
3977	427	3199	239	2019-06-19	1	0.50	\N	t	[6]	3	1	t	2019-06-19 08:32:43.406+00	2019-06-19 08:32:48.135+00	471	\N
3949	425	3128	239	2019-06-16	1	1.50	\N	t	[6]	3	1	t	2019-06-15 21:27:14.734+00	2019-06-16 09:53:07.979+00	471	\N
3950	425	3142	239	2019-06-16	1	0.50	\N	t	[6]	3	1	t	2019-06-16 11:25:18.29+00	2019-06-16 11:25:18.29+00	471	\N
3951	425	3144	239	2019-06-16	1	1.00	\N	t	[6]	3	1	t	2019-06-16 19:24:42.211+00	2019-06-16 19:24:42.211+00	471	\N
3952	425	3145	239	2019-06-16	1	1.00	\N	t	[6]	3	1	t	2019-06-16 19:25:02.835+00	2019-06-16 19:25:02.835+00	471	\N
3953	425	3147	239	2019-06-17	1	1.00	\N	t	[6]	3	1	t	2019-06-16 21:23:27.206+00	2019-06-16 21:23:27.206+00	471	\N
3954	425	3158	239	2019-06-17	1	1.00	\N	t	[6]	3	1	t	2019-06-16 21:32:31.91+00	2019-06-16 21:32:31.91+00	471	\N
3955	425	3152	239	2019-06-17	1	0.25	\N	t	[6]	3	1	t	2019-06-16 22:00:31.665+00	2019-06-16 22:00:31.665+00	471	\N
3956	425	3151	239	2019-06-17	1	0.25	\N	t	[6]	3	1	t	2019-06-16 22:01:01.098+00	2019-06-16 22:01:01.098+00	471	\N
3957	425	3159	239	2019-06-17	1	0.25	\N	t	[6]	3	1	t	2019-06-16 22:17:51.778+00	2019-06-16 22:17:51.778+00	471	\N
3958	425	3160	239	2019-06-17	1	0.50	\N	t	[6]	3	1	t	2019-06-17 09:26:04.547+00	2019-06-17 09:26:04.547+00	471	\N
3959	425	3154	239	2019-06-17	1	1.00	\N	t	[6]	3	1	t	2019-06-17 09:27:15.108+00	2019-06-17 09:27:15.108+00	471	\N
3960	425	3153	239	2019-06-17	1	0.25	\N	t	[6]	3	1	t	2019-06-17 09:40:05.124+00	2019-06-17 09:40:05.124+00	471	\N
3961	425	3164	239	2019-06-17	1	1.00	\N	t	[6]	3	1	t	2019-06-17 10:48:09.193+00	2019-06-17 10:48:09.193+00	471	\N
3978	427	3194	266	2019-06-18	1	2.00	\N	t	[9]	3	1	t	2019-06-19 09:15:15.574+00	2019-06-19 09:15:15.574+00	471	\N
3979	427	3194	266	2019-06-19	1	2.00	\N	t	[9]	3	1	t	2019-06-19 09:15:29.142+00	2019-06-19 09:15:29.142+00	471	\N
3963	425	3172	266	2019-06-17	1	2.00	\N	t	[9]	3	1	t	2019-06-17 11:10:35.553+00	2019-06-17 11:10:35.553+00	471	\N
3964	425	3165	266	2019-06-17	1	2.00	\N	t	[9]	7	1	t	2019-06-17 11:12:25.932+00	2019-06-17 11:12:25.932+00	471	\N
3965	425	3174	239	2019-06-17	1	0.50	\N	t	[6]	3	1	t	2019-06-17 11:13:53.265+00	2019-06-17 11:13:53.265+00	471	\N
3966	425	3170	266	2019-06-17	1	1.00	\N	t	[9]	3	1	t	2019-06-17 11:44:11.316+00	2019-06-17 11:44:11.316+00	471	\N
3967	425	3093	266	2019-06-15	1	2.00	\N	t	[9]	3	1	t	2019-06-17 11:47:08.643+00	2019-06-17 11:47:08.643+00	471	\N
3968	425	3093	266	2019-06-16	1	2.00	\N	t	[9]	3	1	t	2019-06-17 11:47:10.604+00	2019-06-17 11:47:10.604+00	471	\N
3980	424	3106	266	2019-06-18	1	3.00	\N	t	[9]	3	1	t	2019-06-19 09:17:25.933+00	2019-06-19 09:17:25.933+00	470	\N
3982	428	3204	266	2019-06-19	1	4.00	\N	t	[9]	3	1	t	2019-06-19 12:27:13.19+00	2019-06-19 12:27:13.19+00	470	\N
3983	427	3168	266	2019-06-19	1	2.00	\N	t	[9]	3	1	t	2019-06-19 14:14:49.409+00	2019-06-19 14:14:49.409+00	471	\N
3926	425	3093	266	2019-06-13	1	7.00		t	[9]	1	1	t	2019-06-13 12:58:38.317+00	2019-06-27 12:15:23.647+00	471	\N
3921	425	3101	266	2019-06-13	1	0.20		t	[9]	3	1	t	2019-06-13 09:58:15.048+00	2019-06-27 12:15:28.265+00	471	\N
3995	428	3211	266	2019-07-02	1	2.00	\N	t	[9]	3	4	t	2019-07-02 07:25:24.879+00	2019-07-10 07:53:03.346+00	470	\N
3984	428	3204	266	2019-06-28	1	5.00	\N	t	[9]	5	4	t	2019-06-28 13:24:03.557+00	2019-07-10 07:52:10.5+00	470	\N
3985	427	3194	266	2019-06-25	1	4.00	\N	t	[9]	5	4	t	2019-06-28 13:24:07.32+00	2019-07-10 07:52:10.5+00	471	\N
3986	427	3210	266	2019-06-28	1	5.00	\N	t	[9]	3	4	t	2019-06-28 13:24:11.972+00	2019-07-10 07:52:10.5+00	471	\N
3987	427	3209	266	2019-06-28	1	5.00	\N	t	[9]	3	4	t	2019-06-28 13:24:25.165+00	2019-07-10 07:52:10.5+00	471	\N
3988	427	3179	266	2019-06-28	1	5.00	\N	t	[9]	3	4	t	2019-06-28 13:24:28.608+00	2019-07-10 07:52:10.5+00	471	\N
3989	427	3179	266	2019-06-28	1	5.00	\N	t	[9]	5	4	t	2019-06-28 13:24:31.941+00	2019-07-10 07:52:10.5+00	471	\N
3990	428	3204	266	2019-06-28	1	5.00	\N	t	[9]	7	4	t	2019-06-28 13:24:36.549+00	2019-07-10 07:52:10.5+00	470	\N
3991	428	3203	266	2019-06-28	1	3.00	\N	t	[9]	5	4	t	2019-06-28 13:25:41.061+00	2019-07-10 07:52:10.5+00	470	\N
3992	428	3198	266	2019-06-28	1	3.00	\N	t	[9]	5	4	t	2019-06-28 13:25:51.069+00	2019-07-10 07:52:10.5+00	470	\N
3993	428	3203	266	2019-06-28	1	3.00	\N	t	[9]	7	4	t	2019-06-28 13:28:50.796+00	2019-07-10 07:52:10.5+00	470	\N
3994	427	3194	266	2019-06-26	1	1.00		t	[9]	5	4	t	2019-06-28 13:32:10.875+00	2019-07-10 07:52:10.5+00	471	\N
3996	427	3205	266	2019-07-02	1	2.00	\N	t	[9]	3	4	t	2019-07-02 07:25:49.043+00	2019-07-10 07:53:03.346+00	471	\N
3997	\N	\N	266	2019-07-01	7	2.00	\N	f	\N	2	4	t	2019-07-02 07:35:08.072+00	2019-07-10 07:53:03.346+00	0	\N
3998	\N	\N	266	2019-07-01	5	2.00	\N	f	\N	2	4	t	2019-07-02 07:35:09.768+00	2019-07-10 07:53:03.346+00	0	\N
3999	428	3211	266	2019-07-10	1	2.00	\N	t	[9]	3	4	t	2019-07-10 07:54:06.666+00	2019-07-10 07:54:24.994+00	470	\N
4001	428	3211	266	2019-07-10	1	2.00	1	t	[9]	5	1	t	2019-07-10 07:56:52.419+00	2019-07-10 08:03:25.21+00	470	\N
4002	428	3198	266	2019-07-10	1	2.00	\N	t	[9]	5	1	t	2019-07-10 08:06:12.54+00	2019-07-10 08:06:12.54+00	470	\N
4000	428	3198	266	2019-07-10	1	2.00	1	t	[9]	3	1	f	2019-07-10 07:56:24.762+00	2019-07-10 08:08:14.319+00	470	\N
4003	428	3211	212	2019-07-08	1	0.00	\N	t	[9]	7	4	t	2019-07-10 08:11:44.684+00	2019-07-10 08:14:52.778+00	470	\N
4004	428	3211	212	2019-07-10	1	2.00	\N	t	[9]	7	4	t	2019-07-10 08:11:47.069+00	2019-07-10 08:14:52.778+00	470	\N
4005	428	3211	212	2019-07-11	1	6.00	\N	t	[9]	7	4	t	2019-07-10 08:14:39.104+00	2019-07-10 08:14:52.778+00	470	\N
\.


--
-- Data for Name: timesheets_draft; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.timesheets_draft (id, task_id, user_id, type_id, task_status_id, is_visible, created_at, updated_at, on_date, project_id) FROM stdin;
4063	3090	1	1	3	t	2019-06-12 17:51:42.236+00	2019-06-12 17:51:42.236+00	2019-06-12	470
4067	3093	266	1	3	t	2019-06-13 09:59:50.868+00	2019-06-13 09:59:50.868+00	2019-06-13	471
4068	3098	212	1	3	t	2019-06-13 10:01:22.354+00	2019-06-13 10:01:22.354+00	2019-06-13	471
4070	3100	239	1	3	t	2019-06-13 11:11:27.105+00	2019-06-13 11:11:27.105+00	2019-06-13	471
4072	3107	186	1	3	t	2019-06-13 11:58:33.647+00	2019-06-13 11:58:33.647+00	2019-06-13	470
4073	3108	186	1	3	t	2019-06-13 11:59:06.524+00	2019-06-13 11:59:06.524+00	2019-06-13	470
4076	3114	102	1	3	t	2019-06-13 15:09:44.684+00	2019-06-13 15:09:44.684+00	2019-06-13	472
4077	3113	102	1	5	t	2019-06-13 15:09:56.801+00	2019-06-13 15:09:56.801+00	2019-06-13	472
4080	3118	102	1	3	t	2019-06-14 11:00:07.193+00	2019-06-14 11:00:07.193+00	2019-06-14	472
4085	3125	266	1	3	t	2019-06-14 18:34:48.662+00	2019-06-14 18:34:48.662+00	2019-06-14	471
4086	3134	266	1	3	t	2019-06-14 19:02:51.697+00	2019-06-14 19:02:51.697+00	2019-06-14	471
4088	3140	239	1	3	t	2019-06-14 21:22:22.357+00	2019-06-14 21:22:22.357+00	2019-06-14	471
4089	3139	239	1	3	t	2019-06-14 21:22:26.064+00	2019-06-14 21:22:26.064+00	2019-06-14	471
4090	3133	239	1	3	t	2019-06-14 21:34:30.707+00	2019-06-14 21:34:30.707+00	2019-06-14	471
4091	3120	239	1	3	t	2019-06-15 20:43:25.602+00	2019-06-15 20:43:25.602+00	2019-06-15	471
4092	3128	239	1	3	t	2019-06-15 20:46:49.953+00	2019-06-15 20:46:49.953+00	2019-06-15	471
4093	3126	239	1	3	t	2019-06-15 21:26:03.848+00	2019-06-15 21:26:03.848+00	2019-06-15	471
4094	3124	239	1	3	t	2019-06-16 07:32:43.424+00	2019-06-16 07:32:43.424+00	2019-06-16	471
4095	3141	212	1	3	t	2019-06-16 08:58:55.791+00	2019-06-16 08:58:55.791+00	2019-06-16	471
4097	3138	336	1	3	t	2019-06-16 10:18:52.085+00	2019-06-16 10:18:52.085+00	2019-06-16	471
4098	3127	336	1	3	t	2019-06-16 10:18:57.118+00	2019-06-16 10:18:57.118+00	2019-06-16	471
4099	3135	186	1	3	t	2019-06-16 10:47:48.146+00	2019-06-16 10:47:48.146+00	2019-06-16	471
4100	3137	266	1	3	t	2019-06-16 12:02:24.436+00	2019-06-16 12:02:24.436+00	2019-06-16	471
4103	3155	266	1	3	t	2019-06-16 18:01:47.922+00	2019-06-16 18:01:47.922+00	2019-06-16	471
4104	3149	266	1	3	t	2019-06-16 18:02:03.817+00	2019-06-16 18:02:03.817+00	2019-06-16	471
4105	3150	266	1	3	t	2019-06-16 18:17:05.011+00	2019-06-16 18:17:05.011+00	2019-06-16	471
4106	3147	239	1	3	t	2019-06-16 19:28:05.697+00	2019-06-16 19:28:05.697+00	2019-06-16	471
4107	3158	239	1	3	t	2019-06-16 20:47:24.706+00	2019-06-16 20:47:24.706+00	2019-06-16	471
4108	3151	239	1	3	t	2019-06-16 20:47:29.04+00	2019-06-16 20:47:29.04+00	2019-06-16	471
4109	3152	239	1	3	t	2019-06-16 20:47:32.94+00	2019-06-16 20:47:32.94+00	2019-06-16	471
4110	3159	239	1	3	t	2019-06-16 20:47:41.836+00	2019-06-16 20:47:41.836+00	2019-06-16	471
4111	3161	212	1	3	t	2019-06-17 06:20:09.441+00	2019-06-17 06:20:09.441+00	2019-06-17	471
4112	3146	212	1	3	t	2019-06-17 06:51:26.57+00	2019-06-17 06:51:26.57+00	2019-06-17	471
4113	3162	266	1	3	t	2019-06-17 07:20:28.844+00	2019-06-17 07:20:28.844+00	2019-06-17	471
4118	3165	266	1	3	t	2019-06-17 09:55:25.895+00	2019-06-17 09:55:25.895+00	2019-06-17	471
4122	3177	266	1	3	t	2019-06-18 07:00:54.202+00	2019-06-18 07:00:54.202+00	2019-06-18	471
4124	3089	102	1	3	t	2019-06-18 08:08:39.051+00	2019-06-18 08:08:39.051+00	2019-06-18	470
4126	3114	102	1	5	t	2019-06-18 08:48:03.888+00	2019-06-18 08:48:03.888+00	2019-06-18	472
4127	3107	186	1	5	t	2019-06-18 09:54:24.551+00	2019-06-18 09:54:24.551+00	2019-06-18	470
4129	3099	183	1	5	t	2019-06-18 11:08:43.456+00	2019-06-18 11:08:43.456+00	2019-06-18	470
4131	3118	102	1	5	t	2019-06-19 06:09:03.03+00	2019-06-19 06:09:03.03+00	2019-06-19	472
4133	3196	205	1	3	t	2019-06-19 07:35:42.025+00	2019-06-19 07:35:42.025+00	2019-06-19	470
4134	3197	205	1	3	t	2019-06-19 07:35:44.985+00	2019-06-19 07:35:44.985+00	2019-06-19	472
4135	3200	212	1	3	t	2019-06-19 07:43:49.58+00	2019-06-19 07:43:49.58+00	2019-06-19	470
4136	3203	212	1	3	t	2019-06-19 09:10:43.88+00	2019-06-19 09:10:43.88+00	2019-06-19	470
4138	3207	1	1	3	t	2019-06-19 11:31:12.717+00	2019-06-19 11:31:12.717+00	2019-06-19	470
4139	3203	266	1	5	t	2019-06-19 12:24:56.038+00	2019-06-19 12:24:56.038+00	2019-06-19	470
4141	3204	266	1	5	t	2019-06-19 12:27:32.948+00	2019-06-19 12:27:32.948+00	2019-06-19	470
4142	3194	266	1	5	t	2019-06-19 12:27:52.655+00	2019-06-19 12:27:52.655+00	2019-06-19	471
4143	3210	266	1	3	t	2019-06-19 14:41:17.965+00	2019-06-19 14:41:17.965+00	2019-06-19	471
4149	3198	266	1	7	t	2019-06-28 13:25:55.612+00	2019-06-28 13:25:55.612+00	2019-06-28	470
4150	3203	205	1	5	t	2019-06-28 13:28:50.917+00	2019-06-28 13:28:50.917+00	2019-06-28	470
4151	3198	266	1	7	t	2019-07-02 07:22:45.246+00	2019-07-02 07:22:45.246+00	2019-07-02	470
4153	3211	266	1	5	t	2019-07-02 07:25:24.984+00	2019-07-02 07:25:24.984+00	2019-07-02	470
4155	3205	266	1	5	t	2019-07-02 07:25:49.156+00	2019-07-02 07:25:49.156+00	2019-07-02	471
4156	3197	205	1	3	t	2019-07-02 07:28:46.299+00	2019-07-02 07:28:46.299+00	2019-07-02	472
4157	3200	212	1	5	t	2019-07-02 07:29:21.073+00	2019-07-02 07:29:21.073+00	2019-07-02	470
4158	3212	266	1	3	t	2019-07-02 07:34:18+00	2019-07-02 07:34:18+00	2019-07-02	470
4159	3106	266	1	3	t	2019-07-02 11:35:50.687+00	2019-07-02 11:35:50.687+00	2019-07-02	470
4160	3212	266	1	5	t	2019-07-02 11:35:53.975+00	2019-07-02 11:35:53.975+00	2019-07-02	470
4161	3179	183	1	3	t	2019-07-02 11:36:13.885+00	2019-07-02 11:36:13.885+00	2019-07-02	471
4162	3106	266	1	5	t	2019-07-02 11:36:17.024+00	2019-07-02 11:36:17.024+00	2019-07-02	470
\.


--
-- Name: timesheets_draft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.timesheets_draft_id_seq', 4165, true);


--
-- Name: timesheets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.timesheets_id_seq', 4005, true);


--
-- Data for Name: timesheets_statuses; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.timesheets_statuses (id, name, name_ru, is_blocked) FROM stdin;
1	inprogress	В процессе	f
2	rejected	Отменено	f
3	submitted	Отправлено	t
4	approved	Согласовано	t
\.


--
-- Name: timesheets_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.timesheets_statuses_id_seq', 1, false);


--
-- Data for Name: timesheets_types; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.timesheets_types (id, name, code_name, is_magic_activity, "order", name_en) FROM stdin;
1	Implementation	IMPLEMENTATION	f	0	Implementation
2	Совещание	MEETING	t	1	Meeting
3	Преселлинг и оценка	PRESALE	t	2	Presale and mark
5	Отпуск	VACATION	t	4	Vacation
4	Обучение	EDUCATION	t	3	Education
7	Больничный	HOSPITAL	t	6	Hospital
8	Управление	CONTROL	t	7	Control
6	Командировка	BUSINESS_TRIP	t	5	Business trip
\.


--
-- Name: timesheets_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.timesheets_types_id_seq', 1, false);


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.tokens (id, token, expires, user_id) FROM stdin;
3776	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxla3NhbmRyLmtyYXNub3YifSwiZXhwaXJlcyI6IjIwMTktMDYtMjBUMTI6MzM6MzEuNzQzWiJ9.vC5p6uz3NGtbo7g4yrZ5ypE-S2WW1_W-8ZC-gyiG99k	2019-06-20 12:33:31+00	357
3780	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYW5kcmV3Lnl1ZGluIn0sImV4cGlyZXMiOiIyMDE5LTA2LTIzVDA2OjIyOjU5LjIwMFoifQ.vB2g3Y5JBq0Q92mIw8IJwBBUNCRSIJ3Uow0TgT5BqN4	2019-06-23 06:22:59+00	336
3784	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiaWx5YS5rYXNodGFua2luIn0sImV4cGlyZXMiOiIyMDE5LTA2LTI0VDExOjM3OjE4LjkwOVoifQ.iw92PpbLlUBcLo6WD8yqVD00q9NNjADZe1xjUeVtpJQ	2019-06-24 11:37:18+00	35
3785	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoianVsaWV0dGEuZWdvcm92YSJ9LCJleHBpcmVzIjoiMjAxOS0wNi0yNVQwNjoxMTowNi42ODZaIn0.6Clm8-zcvY9VWm_GF_OLYIt0erk46h0J-iQPe_Y6gxs	2019-06-25 06:11:06+00	205
3786	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxla3NlaS5hcnRhbW9ub3YifSwiZXhwaXJlcyI6IjIwMTktMDYtMjVUMDc6NDY6MjkuNDA5WiJ9.f1g3sXFoIUda90_8mbMZ6NtMh5iUgNKzUY58j7FsDrA	2019-06-25 07:46:29+00	344
3791	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiaWx5YS5rYXNodGFua2luIn0sImV4cGlyZXMiOiIyMDE5LTA2LTI2VDA4OjE0OjMwLjU0MVoifQ.s6fb61IwuzLoNUzvHRCqcMt1hvFgk2Nz619VhTgm6sw	2019-06-26 08:14:30+00	35
3792	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYW5kcmV3Lnl1ZGluIn0sImV4cGlyZXMiOiIyMDE5LTA2LTI2VDE0OjAxOjUwLjkzNVoifQ.ByLBiEGHNZBATEcBovv3DCqP1bbZ0H9NLk-sMzmSgjs	2019-06-26 14:01:50+00	336
3796	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoidGF0eWFuYS5iYWJpY2gifSwiZXhwaXJlcyI6IjIwMTktMDctMDRUMTA6MTY6MDQuNzcwWiJ9._MbGohedXEeJGKY0IwImEgo53iOqDZDtJNbnvjL6QN0	2019-07-04 10:16:04+00	102
3797	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoidmljdG9yLnN5Y2hldiJ9LCJleHBpcmVzIjoiMjAxOS0wNy0wNFQxMDoxNjoxMS4wNjJaIn0.fp084CAQf2S2jdxAXGQgn8uUinS3bmDg-fZl2Q1xqDA	2019-07-04 10:16:11+00	1
3802	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYW5hc3Rhc2lhLmdvcnNoa292YSJ9LCJleHBpcmVzIjoiMjAxOS0wNy0xMVQxNDozMDo0Ny4xNDdaIn0.ps-Wv8Trfnj_RYX8TPCopoEsgymiTACfwPlcMR2Vy0Q	2019-07-11 14:30:47+00	239
3806	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxleGVpLnN0cmF0b25vdiJ9LCJleHBpcmVzIjoiMjAxOS0wNy0xMVQxNTozMzoyMi4yMzdaIn0.OYQ1lcg6J4BZTT2tRtKCZf03hFv_cZMmVJvjkOF0iTE	2019-07-11 15:33:22+00	186
3807	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxleGVpLnN0cmF0b25vdiJ9LCJleHBpcmVzIjoiMjAxOS0wNy0xMVQxNTo0NToxNS4zNDJaIn0.nSmAbVzXQ4NlUCS25HYmv-TAX3_6DveukehJJtASZZk	2019-07-11 15:45:15+00	186
3808	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxleGVpLnN0cmF0b25vdiJ9LCJleHBpcmVzIjoiMjAxOS0wNy0xMVQxNTo0ODozMS4xODFaIn0.ozdnOAHKAYdQ6-g-sTMvTJ-GHx2CE6ib3liMyd-hJko	2019-07-11 15:48:31+00	186
3809	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYWxleGVpLnN0cmF0b25vdiJ9LCJleHBpcmVzIjoiMjAxOS0wNy0xMVQxNTo1MDoyMC4zOTNaIn0.GEPJ7HEqOcPIDwhpFriu4xhDRvYAPwmCBDXnOYTr2SI	2019-07-11 15:50:20+00	186
3811	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoibHVkbWlsYS5rbHVldmEifSwiZXhwaXJlcyI6IjIwMTktMDctMTdUMDg6MTE6MDguMTU0WiJ9.I0zbU6tFL0UxWzVWITlE3nEIcExAZMRUTsnu3XWGXMg	2019-07-17 08:11:08+00	266
3812	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiaWx5YS5maWxpbmluIn0sImV4cGlyZXMiOiIyMDE5LTA3LTE3VDA4OjExOjEzLjgzNFoifQ.r17ILHY0yAhqOkqouXVwWK3fPGSQzAdhmaGD-unw4rw	2019-07-17 08:11:13+00	212
3813	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYW5kcmVpLmZyZW5rZWwifSwiZXhwaXJlcyI6IjIwMTktMDktMDZUMDk6NTU6NTAuMzQwWiJ9.paSVoAgNNLuQcce17Lsv_7KEe9XONA_0UKaLQKflZdc	2019-09-06 09:55:50+00	183
3814	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiYW5kcmVpLmZyZW5rZWwifSwiZXhwaXJlcyI6IjIwMTktMDktMDZUMDk6NTY6MjUuMTA4WiJ9.YdOjCE-kH14XFruf2Z9Cw3-jfvxMhg_LXMfgvNLdmoE	2019-09-06 09:56:25+00	183
3815	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoiZGVuaXMuc21vcm9kaW4ifSwiZXhwaXJlcyI6IjIwMTktMDktMTBUMTI6NTc6MzQuNzk1WiJ9.NVi0mC_X_OLbyVskVsz3GaieO7gl4zlh_U9vKndqjM4	2019-09-10 12:57:34+00	22
3816	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImxvZ2luIjoicm9tYW4ua2htdXJlbmtvIn0sImV4cGlyZXMiOiIyMDE5LTA5LTE2VDA4OjUyOjE3LjQ3NloifQ.5iw2ohFxk5nMi6EU1AyPvHrv2K7eiEfwHxLSIy5xQkE	2019-09-16 08:52:17+00	2698
\.


--
-- Name: tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.tokens_id_seq', 3816, true);


--
-- Data for Name: user_departments; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.user_departments (id, department_id, user_id) FROM stdin;
755	17	2696
756	15	35
757	16	344
758	15	357
5	1	212
759	15	1
9	1	266
68	3	205
95	5	102
108	5	183
115	5	239
131	5	336
296	2	45
340	2	186
760	2	2697
\.


--
-- Name: user_departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.user_departments_id_seq', 760, true);


--
-- Data for Name: user_email_association; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.user_email_association (id, project_id, external_user_email, internal_user_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: user_email_association_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.user_email_association_id_seq', 40, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: track
--

COPY public.users (id, ldap_login, login, last_name_en, first_name_en, last_name_ru, first_name_ru, active, photo, email_primary, email_secondary, phone, mobile, skype, city, birth_date, create_date, delete_date, ps_id, created_at, updated_at, deleted_at, full_name_ru, full_name_en, fullnameen, global_role, password, set_password_token, set_password_expired, expired_date, "isActive", description, is_test, gitlab_user_id, employment_date, dismissal_date) FROM stdin;
266	ludmila.klueva	ludmila.klueva	Klueva	Ludmila	Клюева	Людмила	1	/uploads/usersPhotos/266.jpg	ludmila.klueva@nordclan.com	mikadn@mail.ru	\N	79170567742	mikadn2g	Ульяновск	1992-01-18	2016-05-30 08:18:00+00	\N	o2k187g0000la047b70g000000	2016-05-30 11:18:00+00	2017-07-03 13:34:05+00	\N	Людмила Клюева	\N	\N	VISOR	\N	\N	\N	\N	\N	\N	f	12	2019-06-24 00:00:00+00	\N
1	victor.sychev	victor.sychev	Sychev	Victor	Сычев	Виктор	1	/uploads/usersPhotos/1.jpg	victor.sychev@nordclan.com	simvics@gmail.com	\N	9603779027	sychev.victor	Ульяновск	1985-09-14	2010-07-12 00:35:00+00	\N	o2k00680000ijhl7g9f0000000	2010-07-12 04:35:00+00	2017-07-03 13:33:49.959+00	\N	Виктор Сычев	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	11	2019-07-19 00:00:00+00	\N
205	julietta.egorova	julietta.egorova	Egorova	Julietta	Егорова	Джульетта	1	/uploads/usersPhotos/205.jpg	julietta.egorova@nordclan.com	julietta.egorova@yandex.ru	\N	79539898993	julietta.egorova	Ульяновск	1993-08-08	2015-12-06 23:29:00+00	\N	o2k187g0000l2uvsokbg000000	2015-12-07 02:29:00+00	2017-07-03 13:34:00.672+00	\N	Джульетта Егорова	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	14	2019-06-24 00:00:00+00	\N
357	aleksandr.krasnov	aleksandr.krasnov	Krasnov	Aleksandr	Краснов	Александр	1	\N	aleksandr.krasnov@nordclan.com	freeman969@yandex.ru	\N	79176150295	live:aleksandr.krasnov	Ульяновск	1986-05-29	2017-02-01 09:23:00+00	\N	o2k187g0000lju65cn5g000000	2017-02-01 12:23:00+00	2017-07-03 13:34:13.997+00	\N	Александр Краснов	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	15	2019-06-10 00:00:00+00	\N
45	andrey.zolotov	andrey.zolotov	Zolotov	Andrey	Золотов	Андрей	1	/uploads/usersPhotos/45.jpg	andrey.zolotov@nordclan.com	andrey.zolotov@nordclan.com	\N	+7 902 244 58 19	zolotov_andrey	Ульяновск	1981-05-10	2010-05-30 23:08:00+00	2010-09-10 08:43:00+00	o2k007g0000im2moub3g000000	2010-09-13 11:26:00+00	2017-07-03 13:34:23.107+00	\N	Андрей Золотов	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	17	2019-06-21 00:00:00+00	\N
183	andrei.frenkel	andrei.frenkel	Frenkel	Andrei	Френкель	Андрей	1	/uploads/usersPhotos/183.jpg	andrei.frenkel@nordclan.com	user11141lkjljk1@gmail.com	\N	\N	andrei.frenkel73	Ульяновск	1990-11-06	2015-10-20 22:08:00+00	\N	o2k187g0000l12d8hcg0000000	2015-10-21 01:08:00+00	2017-07-03 13:33:59.486+00	\N	Андрей Френкель	\N	\N	VISOR	\N	\N	\N	\N	\N	\N	f	3	2019-06-24 00:00:00+00	\N
186	alexei.stratonov	alexei.stratonov	Stratonov	Alexei	Стратонов	Алексей	1	/uploads/usersPhotos/186.jpg	alexei.stratonov@nordclan.com	an.stratonov@gmail.com	\N	89276328984	alexstrat2008	Ульяновск	1994-06-20	2015-10-29 22:01:00+00	\N	o2k187g0000l1dvr85cg000000	2015-10-30 01:01:00+00	2017-07-03 13:33:59.584+00	\N	Алексей Стратонов	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	2	2019-06-24 00:00:00+00	\N
239	anastasia.gorshkova	anastasia.gorshkova	Gorshkova	Anastasia	Горшкова	Анастасия	1	/uploads/usersPhotos/239.jpg	anastasia.gorshkova@nordclan.com	gorshkovang92@gmail.com	\N	79378837644	anastasya9475	Ульяновск	1992-12-28	2016-03-24 09:02:00+00	\N	o2k187g0000l79t5hti0000000	2016-03-24 12:02:00+00	2017-07-03 13:34:03.234+00	\N	Анастасия Горшкова	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	8	2019-06-24 00:00:00+00	\N
22	denis.smorodin	denis.smorodin	Smorodin	Denis	Смородин	Денис	1	\N	denis.smorodin@nordclan.com	denis.smorodin@nordclan.com	\N	9176296112	smodean73	Ульяновск	1992-07-10	2019-08-26 11:18:00+00	\N	\N	2019-08-26 11:18:00+00	2019-08-26 11:18:00+00	\N	Денис Смородин	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	27	2019-08-26 11:18:00+00	\N
2696	alexander.noskov	alexander.noskov	Noskov	Alexander	Носков	Александр	1	\N	alexander.noskov@nordclan.com	\N	\N	\N	\N	Ульяновск	\N	2010-07-12 00:35:00+00	\N	\N	2010-07-12 00:35:00+00	2010-07-12 00:35:00+00	\N	Александр Носков	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	19	2019-06-24 00:00:00+00	\N
344	aleksei.artamonov	aleksei.artamonov	Artamonov	Aleksei	Артамонов	Алексей	1	/uploads/usersPhotos/344.jpg	aleksei.artamonov@nordclan.com	ha1ken@mail.ru	\N	9053487575	alexei.artamonov	Ульяновск	\N	2016-12-21 07:22:00+00	\N	o2k187g0000li80bme0g000000	2016-12-21 10:22:00+00	2017-07-03 13:34:12.77+00	\N	Алексей Артамонов	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	18	2019-06-24 00:00:00+00	\N
212	ilya.filinin	ilya.filinin	Filinin	Ilya	Филинин	Илья	1	/uploads/usersPhotos/212.jpg	ilya.filinin@nordclan.com	iliya2007852007@gmail.com	\N	\N	filinin94	\N	1994-02-08	2016-01-21 08:10:00+00	\N	o2k187g0000l4oo5252g000000	2016-01-21 11:10:00+00	2017-07-03 13:34:01.188+00	\N	Илья Филинин	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	13	2019-07-01 00:00:00+00	\N
336	andrew.yudin	andrew.yudin	Yudin	Andrew	Юдин	Андрей	1	/uploads/usersPhotos/336.jpg	andrew.yudin@nordclan.com	woody.just@gmail.com	\N	9041862212	live:woody.just	Ульяновск	1987-03-26	2016-11-29 05:05:00+00	\N	o2k187g0000lhc6l9cfg000000	2016-11-29 08:05:00+00	2017-07-03 13:34:11.813+00	\N	Андрей Юдин	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	7	2019-07-02 00:00:00+00	\N
2697	radik.khismetov	radik.khismetov	Radik	Khismetov	Хисметов	Радик	1	/uploads/usersPhotos/183.jpg	radik.khismetov@nordclan.com	radik.khismetov@nordclan.com	\N	\N	\N	Ульяновск	1990-11-06	2015-10-20 22:08:00+00	\N	o2k187g0000l12d8hco0000000	2019-07-22 11:38:07.137+00	2019-07-22 11:38:07.137+00	\N	Радий Хисметов	\N	\N	USER	\N	\N	\N	\N	\N	\N	f	20	2019-07-22 00:00:00+00	\N
35	ilya.kashtankin	ilya.kashtankin	Kashtankin	Ilya	Каштанкин	Илья	1	/uploads/usersPhotos/35.jpg	ilya.kashtankin@nordclan.com	ilya.kashtankin@nordclan.com	\N	+7 927 800 9999	\N	Ульяновск	1982-07-26	2010-05-31 07:50:00+00	\N	fs002080000ihsi7038g000000	2010-05-31 11:50:00+00	2017-07-03 13:33:49.631+00	\N	Илья Каштанкин	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	16	2019-06-10 00:00:00+00	\N
2698	roman.khmurenko	roman.khmurenko	Khmurenko	Roman	Хмуренко	Роман	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2010-05-31 11:50:00+00	2010-05-31 11:50:00+00	\N	Роман Хмуренко	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	\N	2019-09-09 00:00:00+00	\N
102	tatyana.babich	tatyana.babich	Babich	Tatyana	Бабич	Татьяна	1	/uploads/usersPhotos/102.jpg	tatyana.babich@nordclan.com	babich_ta@inbox.ru	\N	\N	live:tatyana.babich	Ульяновск	1990-02-01	2014-07-14 07:34:00+00	\N	o2k187g0000kecskg4ag000000	2014-07-14 10:34:00+00	2017-07-03 13:33:54.348+00	\N	Татьяна Бабич	\N	\N	ADMIN	\N	\N	\N	\N	\N	\N	f	10	2019-06-21 00:00:00+00	\N
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: track
--

SELECT pg_catalog.setval('public.users_id_seq', 2698, true);


--
-- Name: Milestones Milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public."Milestones"
    ADD CONSTRAINT "Milestones_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: gitlab_user_roles gitlab_user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.gitlab_user_roles
    ADD CONSTRAINT gitlab_user_roles_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: item_tags item_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_pkey PRIMARY KEY (id);


--
-- Name: item_tags item_tags_tag_id_taggable_taggable_id_key; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_tag_id_taggable_taggable_id_key UNIQUE (tag_id, taggable, taggable_id);


--
-- Name: item_tags item_tags_taggable_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_taggable_id_tag_id_key UNIQUE (taggable_id, tag_id);


--
-- Name: jira_sync_status jira_sync_status_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.jira_sync_status
    ADD CONSTRAINT jira_sync_status_pkey PRIMARY KEY (id);


--
-- Name: metric_types metric_types_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metric_types
    ADD CONSTRAINT metric_types_pkey PRIMARY KEY (id);


--
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- Name: milestone_types_dictionary milestone_types_dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.milestone_types_dictionary
    ADD CONSTRAINT milestone_types_dictionary_pkey PRIMARY KEY (id);


--
-- Name: task_histories model_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_histories
    ADD CONSTRAINT model_histories_pkey PRIMARY KEY (id);


--
-- Name: portfolios portfolios_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.portfolios
    ADD CONSTRAINT portfolios_pkey PRIMARY KEY (id);


--
-- Name: project_attachments project_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_attachments
    ADD CONSTRAINT project_attachments_pkey PRIMARY KEY (id);


--
-- Name: project_events project_events_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_events
    ADD CONSTRAINT project_events_pkey PRIMARY KEY (id);


--
-- Name: project_histories project_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_histories
    ADD CONSTRAINT project_histories_pkey PRIMARY KEY (id);


--
-- Name: project_roles project_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_roles
    ADD CONSTRAINT project_roles_pkey PRIMARY KEY (id);


--
-- Name: project_statuses project_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_statuses
    ADD CONSTRAINT project_statuses_pkey PRIMARY KEY (id);


--
-- Name: project_types project_types_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_types
    ADD CONSTRAINT project_types_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (id);


--
-- Name: project_users_roles project_users_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_roles
    ADD CONSTRAINT project_users_roles_pkey PRIMARY KEY (id);


--
-- Name: project_users_subscriptions project_users_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_subscriptions
    ADD CONSTRAINT project_users_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: projects projects_external_id_key; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_external_id_key UNIQUE (external_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: projects projects_prefix_key; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_prefix_key UNIQUE (prefix);


--
-- Name: sprint_statuses sprint_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprint_statuses
    ADD CONSTRAINT sprint_statuses_pkey PRIMARY KEY (id);


--
-- Name: sprints sprints_external_id_uq; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_external_id_uq UNIQUE (project_id, external_id);


--
-- Name: sprints sprints_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_pkey PRIMARY KEY (id);


--
-- Name: system_tokens system_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.system_tokens
    ADD CONSTRAINT system_tokens_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: task_attachments task_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_attachments
    ADD CONSTRAINT task_attachments_pkey PRIMARY KEY (id);


--
-- Name: tasks task_external_id_uq; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT task_external_id_uq UNIQUE (project_id, external_id);


--
-- Name: task_statuses_association task_statuses_association_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses_association
    ADD CONSTRAINT task_statuses_association_pkey PRIMARY KEY (id);


--
-- Name: task_statuses task_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses
    ADD CONSTRAINT task_statuses_pkey PRIMARY KEY (id);


--
-- Name: task_tasks task_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_tasks
    ADD CONSTRAINT task_tasks_pkey PRIMARY KEY (id);


--
-- Name: task_tasks task_tasks_task_id_linked_task_id_key_deleted_at; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_tasks
    ADD CONSTRAINT task_tasks_task_id_linked_task_id_key_deleted_at UNIQUE (id, linked_task_id, task_id, deleted_at);


--
-- Name: task_types_association task_types_association_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types_association
    ADD CONSTRAINT task_types_association_pkey PRIMARY KEY (id);


--
-- Name: task_types task_types_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types
    ADD CONSTRAINT task_types_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: timesheets_draft timesheets_draft_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft
    ADD CONSTRAINT timesheets_draft_pkey PRIMARY KEY (id);


--
-- Name: timesheets timesheets_external_id_uq; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_external_id_uq UNIQUE (project_id, external_id);


--
-- Name: timesheets timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_pkey PRIMARY KEY (id);


--
-- Name: timesheets_statuses timesheets_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_statuses
    ADD CONSTRAINT timesheets_statuses_pkey PRIMARY KEY (id);


--
-- Name: timesheets_types timesheets_types_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_types
    ADD CONSTRAINT timesheets_types_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: goal_sprints unique_goal_sprints_assoc; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_sprints
    ADD CONSTRAINT unique_goal_sprints_assoc UNIQUE (goal_id, sprint_id);


--
-- Name: goal_tasks unique_goal_tasks_assoc; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_tasks
    ADD CONSTRAINT unique_goal_tasks_assoc UNIQUE (goal_id, task_id);


--
-- Name: user_departments user_departments_department_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_department_id_user_id_key UNIQUE (department_id, user_id);


--
-- Name: user_departments user_departments_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_pkey PRIMARY KEY (id);


--
-- Name: user_email_association user_email_association_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_email_association
    ADD CONSTRAINT user_email_association_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: Milestones_projectId; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX "Milestones_projectId" ON public."Milestones" USING btree ("projectId");


--
-- Name: comments_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX comments_task_id ON public.comments USING btree (task_id);


--
-- Name: index_active_sprint_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_active_sprint_id ON public.goals USING btree (active_sprint_id);


--
-- Name: index_moved_sprint_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_moved_sprint_id ON public.goals USING btree (moved_to_sprint_id);


--
-- Name: index_project_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_project_id ON public.goals USING btree (project_id);


--
-- Name: index_sprint_goal_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_sprint_goal_id ON public.goal_sprints USING btree (goal_id);


--
-- Name: index_sprint_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_sprint_id ON public.goal_sprints USING btree (sprint_id);


--
-- Name: index_task_goal_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_task_goal_id ON public.goal_tasks USING btree (goal_id);


--
-- Name: index_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX index_task_id ON public.goal_tasks USING btree (task_id);


--
-- Name: item_tags_tag_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX item_tags_tag_id ON public.item_tags USING btree (tag_id);


--
-- Name: item_tags_taggable; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX item_tags_taggable ON public.item_tags USING btree (taggable);


--
-- Name: item_tags_taggable_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX item_tags_taggable_id ON public.item_tags USING btree (taggable_id);


--
-- Name: login_unique; Type: INDEX; Schema: public; Owner: track
--

CREATE UNIQUE INDEX login_unique ON public.users USING btree (login);


--
-- Name: model_histories_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX model_histories_task_id ON public.task_histories USING btree (task_id);


--
-- Name: project_attachments_project_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX project_attachments_project_id ON public.project_attachments USING btree (project_id);


--
-- Name: project_roles_code; Type: INDEX; Schema: public; Owner: track
--

CREATE UNIQUE INDEX project_roles_code ON public.project_roles USING btree (code);


--
-- Name: projects_portfolio_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX projects_portfolio_id ON public.projects USING btree (portfolio_id);


--
-- Name: sprints_fact_finish_date; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX sprints_fact_finish_date ON public.sprints USING btree (fact_finish_date);


--
-- Name: sprints_fact_start_date; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX sprints_fact_start_date ON public.sprints USING btree (fact_start_date);


--
-- Name: sprints_project_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX sprints_project_id ON public.sprints USING btree (project_id);


--
-- Name: tags_name; Type: INDEX; Schema: public; Owner: track
--

CREATE UNIQUE INDEX tags_name ON public.tags USING btree (name);


--
-- Name: task_attachments_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX task_attachments_task_id ON public.task_attachments USING btree (task_id);


--
-- Name: task_tasks_linked_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX task_tasks_linked_task_id ON public.task_tasks USING btree (linked_task_id);


--
-- Name: task_tasks_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX task_tasks_task_id ON public.task_tasks USING btree (task_id);


--
-- Name: tasks_author_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_author_id ON public.tasks USING btree (author_id);


--
-- Name: tasks_parent_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_parent_id ON public.tasks USING btree (parent_id);


--
-- Name: tasks_performer_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_performer_id ON public.tasks USING btree (performer_id);


--
-- Name: tasks_priorities_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_priorities_id ON public.tasks USING btree (priorities_id);


--
-- Name: tasks_project_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_project_id ON public.tasks USING btree (project_id);


--
-- Name: tasks_sprint_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_sprint_id ON public.tasks USING btree (sprint_id);


--
-- Name: tasks_status_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_status_id ON public.tasks USING btree (status_id);


--
-- Name: tasks_type_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX tasks_type_id ON public.tasks USING btree (type_id);


--
-- Name: timesheets_project_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX timesheets_project_id ON public.timesheets USING btree (project_id);


--
-- Name: timesheets_sprint_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX timesheets_sprint_id ON public.timesheets USING btree (sprint_id);


--
-- Name: timesheets_task_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX timesheets_task_id ON public.timesheets USING btree (task_id);


--
-- Name: timesheets_user_id; Type: INDEX; Schema: public; Owner: track
--

CREATE INDEX timesheets_user_id ON public.timesheets USING btree (user_id);


--
-- Name: uniq_timesheet_draft; Type: INDEX; Schema: public; Owner: track
--

CREATE UNIQUE INDEX uniq_timesheet_draft ON public.timesheets_draft USING btree (user_id, on_date, type_id, (COALESCE(task_id, '-1'::integer)), (COALESCE(project_id, '-1'::integer)), (COALESCE(task_status_id, '-1'::integer)));


--
-- Name: Milestones Milestones_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public."Milestones"
    ADD CONSTRAINT "Milestones_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public.milestone_types_dictionary(id);


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: comments comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE;


--
-- Name: gitlab_user_roles gitlab_user_roles_project_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.gitlab_user_roles
    ADD CONSTRAINT gitlab_user_roles_project_user_id_fkey FOREIGN KEY (project_user_id) REFERENCES public.project_users(id);


--
-- Name: item_tags item_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: jira_sync_status jira_sync_status_simtrack_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.jira_sync_status
    ADD CONSTRAINT jira_sync_status_simtrack_project_id_fkey FOREIGN KEY (simtrack_project_id) REFERENCES public.projects(id);


--
-- Name: goal_sprints lnk_goals_goal_sprints; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_sprints
    ADD CONSTRAINT lnk_goals_goal_sprints FOREIGN KEY (goal_id) REFERENCES public.goals(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goal_tasks lnk_goals_goal_tasks; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_tasks
    ADD CONSTRAINT lnk_goals_goal_tasks FOREIGN KEY (goal_id) REFERENCES public.goals(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goals lnk_projects_goals; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT lnk_projects_goals FOREIGN KEY (project_id) REFERENCES public.projects(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goal_sprints lnk_sprints_goal_sprints; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_sprints
    ADD CONSTRAINT lnk_sprints_goal_sprints FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goal_tasks lnk_sprints_goal_tasks; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goal_tasks
    ADD CONSTRAINT lnk_sprints_goal_tasks FOREIGN KEY (task_id) REFERENCES public.tasks(id) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goals lnk_sprints_goals_active; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT lnk_sprints_goals_active FOREIGN KEY (active_sprint_id) REFERENCES public.sprints(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: goals lnk_sprints_goals_moved; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT lnk_sprints_goals_moved FOREIGN KEY (moved_to_sprint_id) REFERENCES public.sprints(id) MATCH FULL ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: metrics metrics_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE;


--
-- Name: metrics metrics_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) ON UPDATE CASCADE;


--
-- Name: metrics metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: task_histories model_histories_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_histories
    ADD CONSTRAINT model_histories_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: task_histories model_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_histories
    ADD CONSTRAINT model_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_histories project_histories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_histories
    ADD CONSTRAINT project_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: project_users_roles project_users_roles_project_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_roles
    ADD CONSTRAINT project_users_roles_project_role_id_fkey FOREIGN KEY (project_role_id) REFERENCES public.project_roles(id) ON UPDATE CASCADE;


--
-- Name: project_users_roles project_users_roles_project_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_roles
    ADD CONSTRAINT project_users_roles_project_user_id_fkey FOREIGN KEY (project_user_id) REFERENCES public.project_users(id) ON UPDATE CASCADE;


--
-- Name: project_users_subscriptions project_users_subscriptions_project_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_subscriptions
    ADD CONSTRAINT project_users_subscriptions_project_event_id_fkey FOREIGN KEY (project_event_id) REFERENCES public.project_events(id) ON UPDATE CASCADE;


--
-- Name: project_users_subscriptions project_users_subscriptions_project_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users_subscriptions
    ADD CONSTRAINT project_users_subscriptions_project_user_id_fkey FOREIGN KEY (project_user_id) REFERENCES public.project_users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: projects projects_portfolio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: projects projects_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.project_statuses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sprints sprints_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sprints sprints_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.sprint_statuses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_statuses_association task_statuses_association_internal_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses_association
    ADD CONSTRAINT task_statuses_association_internal_status_id_fkey FOREIGN KEY (internal_status_id) REFERENCES public.task_statuses(id);


--
-- Name: task_statuses_association task_statuses_association_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_statuses_association
    ADD CONSTRAINT task_statuses_association_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: task_tasks task_tasks_linked_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_tasks
    ADD CONSTRAINT task_tasks_linked_task_id_fkey FOREIGN KEY (linked_task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_tasks task_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_tasks
    ADD CONSTRAINT task_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_types_association task_types_association_internal_task_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types_association
    ADD CONSTRAINT task_types_association_internal_task_type_id_fkey FOREIGN KEY (internal_task_type_id) REFERENCES public.task_types(id);


--
-- Name: task_types_association task_types_association_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.task_types_association
    ADD CONSTRAINT task_types_association_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: tasks tasks_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE;


--
-- Name: tasks tasks_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tasks tasks_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.task_statuses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: timesheets_draft timesheets_draft_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft
    ADD CONSTRAINT timesheets_draft_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE;


--
-- Name: timesheets_draft timesheets_draft_task_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft
    ADD CONSTRAINT timesheets_draft_task_status_id_fkey FOREIGN KEY (task_status_id) REFERENCES public.task_statuses(id) ON UPDATE CASCADE;


--
-- Name: timesheets_draft timesheets_draft_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft
    ADD CONSTRAINT timesheets_draft_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.timesheets_types(id) ON UPDATE CASCADE;


--
-- Name: timesheets_draft timesheets_draft_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets_draft
    ADD CONSTRAINT timesheets_draft_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: timesheets timesheets_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.timesheets_statuses(id) ON UPDATE CASCADE;


--
-- Name: timesheets timesheets_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON UPDATE CASCADE;


--
-- Name: timesheets timesheets_task_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_task_status_id_fkey FOREIGN KEY (task_status_id) REFERENCES public.task_statuses(id) ON UPDATE CASCADE;


--
-- Name: timesheets timesheets_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.timesheets_types(id) ON UPDATE CASCADE;


--
-- Name: timesheets timesheets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: tokens tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_departments user_departments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_departments user_departments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_departments
    ADD CONSTRAINT user_departments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_email_association user_email_association_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: track
--

ALTER TABLE ONLY public.user_email_association
    ADD CONSTRAINT user_email_association_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- PostgreSQL database dump complete
--

