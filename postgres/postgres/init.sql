--
-- PostgreSQL database dump
--

-- Dumped from database version 13.4 (Debian 13.4-1.pgdg100+1)
-- Dumped by pg_dump version 13.4 (Debian 13.4-1.pgdg100+1)

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
-- Name: ige; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE ige WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.utf8';


ALTER DATABASE ige OWNER TO admin;

\connect ige

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acl_class; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.acl_class (
    id bigint NOT NULL,
    class character varying(100) NOT NULL,
    class_id_type character varying(255)
);


ALTER TABLE public.acl_class OWNER TO admin;

--
-- Name: acl_class_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.acl_class_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.acl_class_id_seq OWNER TO admin;

--
-- Name: acl_class_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.acl_class_id_seq OWNED BY public.acl_class.id;


--
-- Name: acl_entry; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.acl_entry (
    id bigint NOT NULL,
    acl_object_identity bigint NOT NULL,
    ace_order integer NOT NULL,
    sid bigint NOT NULL,
    mask integer NOT NULL,
    granting boolean NOT NULL,
    audit_success boolean NOT NULL,
    audit_failure boolean NOT NULL
);


ALTER TABLE public.acl_entry OWNER TO admin;

--
-- Name: acl_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.acl_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.acl_entry_id_seq OWNER TO admin;

--
-- Name: acl_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.acl_entry_id_seq OWNED BY public.acl_entry.id;


--
-- Name: acl_object_identity; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.acl_object_identity (
    id bigint NOT NULL,
    object_id_class bigint NOT NULL,
    object_id_identity character varying(255) NOT NULL,
    parent_object bigint,
    owner_sid bigint,
    entries_inheriting boolean NOT NULL
);


ALTER TABLE public.acl_object_identity OWNER TO admin;

--
-- Name: acl_object_identity_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.acl_object_identity_id_seq
    START WITH 40
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.acl_object_identity_id_seq OWNER TO admin;

--
-- Name: acl_object_identity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.acl_object_identity_id_seq OWNED BY public.acl_object_identity.id;


--
-- Name: acl_sid; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.acl_sid (
    id bigint NOT NULL,
    principal boolean NOT NULL,
    sid character varying(100) NOT NULL
);


ALTER TABLE public.acl_sid OWNER TO admin;

--
-- Name: acl_sid_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.acl_sid_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.acl_sid_id_seq OWNER TO admin;

--
-- Name: acl_sid_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.acl_sid_id_seq OWNED BY public.acl_sid.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    type character varying(255) NOT NULL,
    message jsonb,
    file character varying(255),
    class character varying(255),
    method character varying(255),
    line character varying(255),
    logger character varying(255),
    thread character varying(255),
    level character varying(255),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_log OWNER TO admin;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.audit_log_id_seq
    START WITH 24
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.audit_log_id_seq OWNER TO admin;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: behaviour; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.behaviour (
    id integer NOT NULL,
    catalog_id integer NOT NULL,
    name character varying(255) NOT NULL,
    active boolean NOT NULL,
    data jsonb
);


ALTER TABLE public.behaviour OWNER TO admin;

--
-- Name: behaviour_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.behaviour_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.behaviour_id_seq OWNER TO admin;

--
-- Name: behaviour_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.behaviour_id_seq OWNED BY public.behaviour.id;


--
-- Name: catalog; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.catalog (
    id integer NOT NULL,
    identifier character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created timestamp with time zone DEFAULT now() NOT NULL,
    modified timestamp with time zone DEFAULT now() NOT NULL,
    settings jsonb
);


ALTER TABLE public.catalog OWNER TO admin;

--
-- Name: catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.catalog_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.catalog_id_seq OWNER TO admin;

--
-- Name: catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.catalog_id_seq OWNED BY public.catalog.id;


--
-- Name: catalog_user_info; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.catalog_user_info (
    catalog_id integer NOT NULL,
    user_info_id integer NOT NULL
);


ALTER TABLE public.catalog_user_info OWNER TO admin;

--
-- Name: codelist_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.codelist_id_seq
    START WITH 3
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.codelist_id_seq OWNER TO admin;

--
-- Name: codelist; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.codelist (
    id integer DEFAULT nextval('public.codelist_id_seq'::regclass) NOT NULL,
    identifier character varying(255) NOT NULL,
    catalog_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    data jsonb,
    default_entry character varying
);


ALTER TABLE public.codelist OWNER TO admin;

--
-- Name: document; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.document (
    id integer NOT NULL,
    catalog_id integer NOT NULL,
    uuid character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    data jsonb,
    version integer,
    created timestamp with time zone DEFAULT now() NOT NULL,
    modified timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document OWNER TO admin;

--
-- Name: document_archive; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.document_archive (
    wrapper_id integer NOT NULL,
    document_id integer NOT NULL
);


ALTER TABLE public.document_archive OWNER TO admin;

--
-- Name: document_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.document_id_seq
    START WITH 26
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.document_id_seq OWNER TO admin;

--
-- Name: document_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.document_id_seq OWNED BY public.document.id;


--
-- Name: document_wrapper; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.document_wrapper (
    id integer NOT NULL,
    catalog_id integer NOT NULL,
    parent_id integer,
    uuid character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    draft integer,
    published integer,
    version integer,
    path text[]
);


ALTER TABLE public.document_wrapper OWNER TO admin;

--
-- Name: document_wrapper_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.document_wrapper_id_seq
    START WITH 25
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.document_wrapper_id_seq OWNER TO admin;

--
-- Name: document_wrapper_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.document_wrapper_id_seq OWNED BY public.document_wrapper.id;


--
-- Name: manager; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.manager (
    user_id integer NOT NULL,
    manager_id integer,
    catalog_id integer NOT NULL
);


ALTER TABLE public.manager OWNER TO admin;

--
-- Name: permission_group_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.permission_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.permission_group_id_seq OWNER TO admin;

--
-- Name: permission_group; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.permission_group (
    id integer DEFAULT nextval('public.permission_group_id_seq'::regclass) NOT NULL,
    catalog_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    permissions jsonb,
    data jsonb,
    manager_id integer NOT NULL
);


ALTER TABLE public.permission_group OWNER TO admin;

--
-- Name: query_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.query_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.query_id_seq OWNER TO admin;

--
-- Name: query; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.query (
    id integer DEFAULT nextval('public.query_id_seq'::regclass) NOT NULL,
    catalog_id integer NOT NULL,
    user_id integer,
    category character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    data jsonb,
    modified timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.query OWNER TO admin;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.role_id_seq
    START WITH 5
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.role_id_seq OWNER TO admin;

--
-- Name: role; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role (
    id integer DEFAULT nextval('public.role_id_seq'::regclass) NOT NULL,
    name character varying NOT NULL,
    permissions jsonb
);


ALTER TABLE public.role OWNER TO admin;

--
-- Name: stand_in; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.stand_in (
    user_id integer NOT NULL,
    stand_in_id integer NOT NULL,
    catalog_id integer NOT NULL
);


ALTER TABLE public.stand_in OWNER TO admin;

--
-- Name: user_group; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_group (
    user_info_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.user_group OWNER TO admin;

--
-- Name: user_info; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_info (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    cur_catalog_id integer,
    data jsonb,
    role_id integer
);


ALTER TABLE public.user_info OWNER TO admin;

--
-- Name: user_info_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_info_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.user_info_id_seq OWNER TO admin;

--
-- Name: user_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_info_id_seq OWNED BY public.user_info.id;


--
-- Name: version_info; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.version_info (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.version_info OWNER TO admin;

--
-- Name: version_info_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.version_info_id_seq
    START WITH 2
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER TABLE public.version_info_id_seq OWNER TO admin;

--
-- Name: version_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.version_info_id_seq OWNED BY public.version_info.id;


--
-- Name: acl_class id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_class ALTER COLUMN id SET DEFAULT nextval('public.acl_class_id_seq'::regclass);


--
-- Name: acl_entry id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_entry ALTER COLUMN id SET DEFAULT nextval('public.acl_entry_id_seq'::regclass);


--
-- Name: acl_object_identity id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity ALTER COLUMN id SET DEFAULT nextval('public.acl_object_identity_id_seq'::regclass);


--
-- Name: acl_sid id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_sid ALTER COLUMN id SET DEFAULT nextval('public.acl_sid_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: behaviour id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.behaviour ALTER COLUMN id SET DEFAULT nextval('public.behaviour_id_seq'::regclass);


--
-- Name: catalog id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalog ALTER COLUMN id SET DEFAULT nextval('public.catalog_id_seq'::regclass);


--
-- Name: document id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document ALTER COLUMN id SET DEFAULT nextval('public.document_id_seq'::regclass);


--
-- Name: document_wrapper id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper ALTER COLUMN id SET DEFAULT nextval('public.document_wrapper_id_seq'::regclass);


--
-- Name: user_info id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_info ALTER COLUMN id SET DEFAULT nextval('public.user_info_id_seq'::regclass);


--
-- Name: version_info id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.version_info ALTER COLUMN id SET DEFAULT nextval('public.version_info_id_seq'::regclass);


--
-- Data for Name: acl_class; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.acl_class VALUES (1, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'java.lang.String');


--
-- Data for Name: acl_entry; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.acl_entry VALUES (18, 38, 0, 3, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (19, 38, 1, 3, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (20, 36, 0, 3, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (21, 36, 1, 3, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (22, 71, 0, 3, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (23, 71, 1, 3, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (24, 16, 0, 8, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (25, 16, 1, 8, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (26, 26, 0, 8, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (27, 26, 1, 8, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (28, 42, 0, 4, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (29, 48, 0, 4, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (30, 48, 1, 4, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (31, 64, 0, 4, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (32, 64, 1, 4, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (33, 67, 0, 4, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (34, 67, 1, 4, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (37, 49, 0, 7, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (38, 49, 1, 7, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (39, 65, 0, 7, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (40, 65, 1, 7, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (43, 88, 0, 7, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (44, 88, 1, 7, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (45, 97, 0, 7, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (46, 97, 1, 7, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (49, 50, 0, 9, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (50, 50, 1, 9, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (51, 68, 0, 9, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (52, 68, 1, 9, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (55, 60, 0, 10, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (56, 60, 1, 10, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (57, 25, 0, 10, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (58, 25, 1, 10, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (59, 73, 0, 7, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (60, 73, 1, 7, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (61, 73, 2, 11, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (62, 73, 3, 11, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (63, 45, 0, 3, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (64, 45, 1, 3, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (65, 45, 2, 12, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (66, 45, 3, 12, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (67, 41, 0, 2, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (68, 41, 1, 2, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (69, 52, 0, 2, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (70, 52, 1, 2, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (71, 43, 0, 5, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (72, 53, 0, 9, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (73, 53, 1, 9, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (74, 53, 2, 5, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (75, 34, 0, 6, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (76, 103, 0, 4, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (77, 103, 1, 4, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (78, 103, 2, 6, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (79, 74, 0, 9, 1, true, false, false);
INSERT INTO public.acl_entry VALUES (80, 74, 1, 9, 2, true, false, false);
INSERT INTO public.acl_entry VALUES (81, 74, 2, 6, 1, true, false, false);


--
-- Data for Name: acl_object_identity; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.acl_object_identity VALUES (17, 1, 'bdde3ecb-3629-489c-86df-12ffac978ef5', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (18, 1, 'b6a59b55-117f-4fd3-96e8-bf78de797b8f', 17, 1, true);
INSERT INTO public.acl_object_identity VALUES (19, 1, '9b264daf-3044-441d-864c-699b44c46dc1', 18, 1, true);
INSERT INTO public.acl_object_identity VALUES (20, 1, 'e612e65b-7771-46eb-83ee-0118ba7a8b68', 17, 1, true);
INSERT INTO public.acl_object_identity VALUES (21, 1, '7e9687e8-43f4-4b95-bdcb-27647197a8cb', 17, 1, true);
INSERT INTO public.acl_object_identity VALUES (22, 1, '83c9b73c-5dcc-4c9f-8f2e-b0c74cfe267e', 17, 1, true);
INSERT INTO public.acl_object_identity VALUES (23, 1, '5cd9519c-0388-494d-9091-7dd7a9795b84', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (24, 1, 'b9839399-05fa-4ec1-ab04-6969930f6390', 23, 1, true);
INSERT INTO public.acl_object_identity VALUES (27, 1, '93ac91fc-4112-4975-86cb-48295a4d3915', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (28, 1, '6e302935-55f3-4cfa-8b97-65f248840bd2', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (29, 1, '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (30, 1, 'b495dd40-a006-4eb6-9c22-384f40fb6844', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (31, 1, '60556f51-3420-48b6-ad1a-29fe2824444c', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (32, 1, 'bc871a95-a1f0-464b-9ec4-4ca8d88c8ee5', 23, 1, true);
INSERT INTO public.acl_object_identity VALUES (33, 1, '2ab150a3-d846-48a0-8aac-3b98d31e9c17', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (35, 1, '98615f8c-c9df-4830-838a-c326af585a66', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (37, 1, 'd7fe4fef-2588-458f-ba35-4673adbdbdf4', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (39, 1, '8467f4e3-90d4-45e6-bd0c-fa97cb669435', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (40, 1, '2294e4f3-821e-4ecd-b6c5-e8fc305275df', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (44, 1, 'e5bc272c-142b-4ad6-8278-093e3de74b7c', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (16, 1, 'a0df9837-512a-4594-b2ef-2814f7c55c81', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (46, 1, 'a9b576b7-ce66-4fe1-a88d-b983f711e458', 45, 1, true);
INSERT INTO public.acl_object_identity VALUES (47, 1, '22613351-12d8-4938-b000-bec7d25372bc', 46, 1, true);
INSERT INTO public.acl_object_identity VALUES (34, 1, '2198f38c-7999-466d-ac67-efc1450a95a1', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (60, 1, 'f3219242-018e-4f1b-b350-5970a9686176', 52, 1, true);
INSERT INTO public.acl_object_identity VALUES (51, 1, 'e9fe4337-9f71-4225-861f-93260743a9d6', 45, 1, true);
INSERT INTO public.acl_object_identity VALUES (43, 1, 'd94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (25, 1, '4ff589e1-d83c-4856-8bae-2ae783f69da6', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (54, 1, '175fd9c0-20cf-4edf-a490-1efdb104d96a', 48, 1, true);
INSERT INTO public.acl_object_identity VALUES (55, 1, 'a4827541-26c7-4703-b94c-3393e742c9df', 48, 1, true);
INSERT INTO public.acl_object_identity VALUES (56, 1, 'f497af26-3571-4dfc-8505-d8d3d4899379', 50, 1, true);
INSERT INTO public.acl_object_identity VALUES (57, 1, '58977711-f24a-471f-afc8-1179a7e2c703', 50, 1, true);
INSERT INTO public.acl_object_identity VALUES (58, 1, '59bc4522-9456-44fe-8ab4-e98fe713b9c2', 51, 1, true);
INSERT INTO public.acl_object_identity VALUES (59, 1, 'bc4e0d68-3023-444c-9e31-df858baceeef', 51, 1, true);
INSERT INTO public.acl_object_identity VALUES (45, 1, '8bb38364-378e-434c-a92f-1bd32156c3da', 16, 1, true);
INSERT INTO public.acl_object_identity VALUES (61, 1, '79ebf92f-67e3-4de7-958a-37e12aea9f39', 52, 1, true);
INSERT INTO public.acl_object_identity VALUES (62, 1, 'c16af9ea-ab87-4d31-b86f-60ad96e4e9cb', 53, 1, true);
INSERT INTO public.acl_object_identity VALUES (63, 1, 'bb9c0963-c6ec-4dd5-9f3f-33976556d1c9', 53, 1, true);
INSERT INTO public.acl_object_identity VALUES (49, 1, 'a735083e-14f5-42d1-9f88-72aba5e5f171', 16, 1, true);
INSERT INTO public.acl_object_identity VALUES (50, 1, 'f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0', 45, 1, true);
INSERT INTO public.acl_object_identity VALUES (66, 1, '70b789f7-5caf-4197-9a78-9883395f0035', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (65, 1, 'c8da3ada-dab7-46c1-9147-248bb3a7d7df', 45, 1, true);
INSERT INTO public.acl_object_identity VALUES (41, 1, '98b74a0e-0473-4a73-b0ff-c7764c8a25db', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (69, 1, '903fc3e6-133d-480b-851b-42d8aeef09ff', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (70, 1, 'c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (26, 1, '57c913ed-bf0e-4d28-a8a0-895ada68a69a', 25, 1, true);
INSERT INTO public.acl_object_identity VALUES (72, 1, 'f78e8095-88fe-4af4-bb57-abeb96b28e46', 67, 1, true);
INSERT INTO public.acl_object_identity VALUES (88, 1, '93374b77-5cc4-404f-be1f-a478458a617c', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (52, 1, '28a7812e-dadf-41e8-bbf7-8a4caef60361', 49, 1, true);
INSERT INTO public.acl_object_identity VALUES (75, 1, '06cf2641-5931-406b-b7b3-aa8d1090aa82', 73, 1, true);
INSERT INTO public.acl_object_identity VALUES (76, 1, '6237be21-04f8-4d40-bf87-a266543732ea', 68, 1, true);
INSERT INTO public.acl_object_identity VALUES (77, 1, 'cb549c15-21a7-43f4-96c5-b4e5f4a15885', 68, 1, true);
INSERT INTO public.acl_object_identity VALUES (78, 1, '33f935ae-f177-4fc6-bb80-daf6a81dddf6', 70, 1, true);
INSERT INTO public.acl_object_identity VALUES (79, 1, '61f389f8-d198-445c-be89-c0e5128520f0', 70, 1, true);
INSERT INTO public.acl_object_identity VALUES (80, 1, '556c875e-d471-4a35-8203-0c750737d296', 74, 1, true);
INSERT INTO public.acl_object_identity VALUES (81, 1, 'eb792c63-0238-4207-a34a-46e0def02656', 74, 1, true);
INSERT INTO public.acl_object_identity VALUES (82, 1, '08f38f6c-db28-4357-a361-4104804d53c9', 75, 1, true);
INSERT INTO public.acl_object_identity VALUES (83, 1, 'd7c933b4-083c-473b-bcf7-9979fddd5b4d', 75, 1, true);
INSERT INTO public.acl_object_identity VALUES (84, 1, 'd6d4d774-c17c-4ebd-a494-2b73d598cb50', 73, 1, true);
INSERT INTO public.acl_object_identity VALUES (85, 1, 'bf93c9db-aea1-4851-8074-9f5badef7e6a', 67, 1, true);
INSERT INTO public.acl_object_identity VALUES (86, 1, '3e3c3e48-e6e3-47de-a35b-e298a2a53e83', 70, 1, true);
INSERT INTO public.acl_object_identity VALUES (87, 1, '05b2e466-b55f-4d16-a10b-358b447eeb50', 68, 1, true);
INSERT INTO public.acl_object_identity VALUES (68, 1, '376c9824-20a0-433c-af3e-e196ea04a077', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (89, 1, '1db03de3-510f-4149-adf0-3973a515a954', 68, 1, true);
INSERT INTO public.acl_object_identity VALUES (42, 1, 'ecc13939-8110-484b-86f2-1a203e35b8c2', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (48, 1, '9cc60568-d529-4538-8ebc-664274e5ce81', 16, 1, true);
INSERT INTO public.acl_object_identity VALUES (64, 1, 'f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c', 16, 1, true);
INSERT INTO public.acl_object_identity VALUES (67, 1, '7bbe60f5-67db-4623-b245-1fbc091b9b76', 25, 1, true);
INSERT INTO public.acl_object_identity VALUES (53, 1, '61fd6be2-9cb3-461b-93f0-41212d637c41', 49, 1, true);
INSERT INTO public.acl_object_identity VALUES (74, 1, 'd6371165-1be0-4a7c-b635-fd6952cad479', 73, 1, true);
INSERT INTO public.acl_object_identity VALUES (90, 1, 'e629f81d-f9fc-4a97-b224-e00df74b1043', 71, 1, true);
INSERT INTO public.acl_object_identity VALUES (92, 1, '8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353', 76, 1, true);
INSERT INTO public.acl_object_identity VALUES (93, 1, '61ca7795-e9ce-43d1-a333-2c540238163f', 77, 1, true);
INSERT INTO public.acl_object_identity VALUES (96, 1, 'f13adb8a-03af-493c-b6e4-39350dc8f436', 72, 1, true);
INSERT INTO public.acl_object_identity VALUES (102, 1, 'a09b5461-b4c7-41dc-917f-cfeb0baf0788', 73, 1, true);
INSERT INTO public.acl_object_identity VALUES (105, 1, 'b3b8f1d7-531e-407d-8ae3-55bfafa1bf46', 72, 1, true);
INSERT INTO public.acl_object_identity VALUES (91, 1, '6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c', 78, 1, true);
INSERT INTO public.acl_object_identity VALUES (94, 1, 'de35a797-a7be-41ca-9ef3-adc7ce3d8738', 77, 1, true);
INSERT INTO public.acl_object_identity VALUES (95, 1, '1e97007c-92fc-410a-8665-ddaa6a65adc4', 79, 1, true);
INSERT INTO public.acl_object_identity VALUES (98, 1, 'a5af5754-eace-439c-baa3-90bc775559fe', 78, 1, true);
INSERT INTO public.acl_object_identity VALUES (99, 1, 'a3c71705-9560-4e4b-aa54-b9c4c0d85373', 79, 1, true);
INSERT INTO public.acl_object_identity VALUES (100, 1, '31aacdb8-da3a-4d97-ace0-ef0386929380', 26, 1, true);
INSERT INTO public.acl_object_identity VALUES (101, 1, '03e25bce-299d-4c75-8b75-8155aaed2eb9', 67, 1, true);
INSERT INTO public.acl_object_identity VALUES (104, 1, '4e9ae410-488b-4b48-b7e9-2d1b355f6339', 71, 1, true);
INSERT INTO public.acl_object_identity VALUES (106, 1, 'de607d5b-5e1f-4240-bcd4-b43c039ebb37', 76, 1, true);
INSERT INTO public.acl_object_identity VALUES (107, 1, 'de3c7849-b787-4f92-8d94-3975fa73405e', 70, 1, true);
INSERT INTO public.acl_object_identity VALUES (38, 1, '92dc82d5-1a41-42e4-9600-3d09116718bd', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (36, 1, 'f4edbc48-9939-4a19-98ae-f9f76bbb213f', NULL, 1, true);
INSERT INTO public.acl_object_identity VALUES (71, 1, 'ab30a1dd-f0ec-4949-aa4e-10dbb99d509c', 67, 1, true);
INSERT INTO public.acl_object_identity VALUES (97, 1, 'b59aebd7-f987-4bc9-ae51-3d1b74d2be7d', 25, 1, true);
INSERT INTO public.acl_object_identity VALUES (73, 1, '2a03ccf3-1a99-498f-9a5c-29a84606f87c', 25, 1, true);
INSERT INTO public.acl_object_identity VALUES (103, 1, '310aa57d-2e95-4a4b-8c03-206c0f0ff5d4', 25, 1, true);


--
-- Data for Name: acl_sid; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.acl_sid VALUES (1, true, 'ige');
INSERT INTO public.acl_sid VALUES (2, false, 'GROUP_gruppe_mit_datenrechten');
INSERT INTO public.acl_sid VALUES (3, false, 'GROUP_gruppe_mit_ortsrechten');
INSERT INTO public.acl_sid VALUES (4, false, 'GROUP_test_gruppe_2');
INSERT INTO public.acl_sid VALUES (5, false, 'GROUP_gruppe_mit_lese_datenrechten');
INSERT INTO public.acl_sid VALUES (6, false, 'GROUP_gruppe_mit_lese_ortsrechten');
INSERT INTO public.acl_sid VALUES (7, false, 'GROUP_test_gruppe_1');
INSERT INTO public.acl_sid VALUES (8, false, 'GROUP_test_gruppe_3');
INSERT INTO public.acl_sid VALUES (9, false, 'GROUP_test_gruppe_4');
INSERT INTO public.acl_sid VALUES (10, false, 'GROUP_test_gruppe_5');
INSERT INTO public.acl_sid VALUES (11, false, 'GROUP_gruppe_nur_Adressen');
INSERT INTO public.acl_sid VALUES (12, false, 'GROUP_gruppe_nur_daten');


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.audit_log VALUES (1, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:32:05.625313Z", "actor": "ige", "action": "create", "target": "60556f51-3420-48b6-ad1a-29fe2824444c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-06-30 15:32:05.625+00');
INSERT INTO public.audit_log VALUES (2, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:32:05.634754Z", "actor": "ige", "action": "update", "target": "60556f51-3420-48b6-ad1a-29fe2824444c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-06-30 15:32:05.634+00');
INSERT INTO public.audit_log VALUES (3, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:40:51.996027Z", "actor": "ige", "action": "create", "target": "bc871a95-a1f0-464b-9ec4-4ca8d88c8ee5", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-06-30 15:40:51.996+00');
INSERT INTO public.audit_log VALUES (4, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:40:51.999467Z", "actor": "ige", "action": "update", "target": "bc871a95-a1f0-464b-9ec4-4ca8d88c8ee5", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-06-30 15:40:51.999+00');
INSERT INTO public.audit_log VALUES (5, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:42:34.504525Z", "actor": "ige", "action": "delete", "target": "bc871a95-a1f0-464b-9ec4-4ca8d88c8ee5", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-06-30 15:42:34.504+00');
INSERT INTO public.audit_log VALUES (6, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:42:52.157674Z", "actor": "ige", "action": "create", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-06-30 15:42:52.157+00');
INSERT INTO public.audit_log VALUES (7, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:42:52.159020Z", "actor": "ige", "action": "update", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-06-30 15:42:52.159+00');
INSERT INTO public.audit_log VALUES (8, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:47:07.033735Z", "actor": "ige", "action": "create", "target": "2198f38c-7999-466d-ac67-efc1450a95a1", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-06-30 15:47:07.033+00');
INSERT INTO public.audit_log VALUES (9, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:47:07.035143Z", "actor": "ige", "action": "update", "target": "2198f38c-7999-466d-ac67-efc1450a95a1", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-06-30 15:47:07.035+00');
INSERT INTO public.audit_log VALUES (10, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:09.417668Z", "actor": "ige", "action": "create", "target": "98615f8c-c9df-4830-838a-c326af585a66", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-06-30 15:48:09.417+00');
INSERT INTO public.audit_log VALUES (11, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:09.419362Z", "actor": "ige", "action": "update", "target": "98615f8c-c9df-4830-838a-c326af585a66", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-06-30 15:48:09.419+00');
INSERT INTO public.audit_log VALUES (12, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:23.781449Z", "actor": "ige", "action": "create", "target": "f4edbc48-9939-4a19-98ae-f9f76bbb213f", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-06-30 15:48:23.781+00');
INSERT INTO public.audit_log VALUES (13, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:23.782699Z", "actor": "ige", "action": "update", "target": "f4edbc48-9939-4a19-98ae-f9f76bbb213f", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-06-30 15:48:23.782+00');
INSERT INTO public.audit_log VALUES (14, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:38.026970Z", "actor": "ige", "action": "create", "target": "d7fe4fef-2588-458f-ba35-4673adbdbdf4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-06-30 15:48:38.027+00');
INSERT INTO public.audit_log VALUES (15, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:38.028526Z", "actor": "ige", "action": "update", "target": "d7fe4fef-2588-458f-ba35-4673adbdbdf4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-06-30 15:48:38.028+00');
INSERT INTO public.audit_log VALUES (16, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:49.160301Z", "actor": "ige", "action": "create", "target": "92dc82d5-1a41-42e4-9600-3d09116718bd", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-06-30 15:48:49.16+00');
INSERT INTO public.audit_log VALUES (17, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:48:49.161423Z", "actor": "ige", "action": "update", "target": "92dc82d5-1a41-42e4-9600-3d09116718bd", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-06-30 15:48:49.161+00');
INSERT INTO public.audit_log VALUES (18, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:49:02.200853Z", "actor": "ige", "action": "create", "target": "8467f4e3-90d4-45e6-bd0c-fa97cb669435", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-06-30 15:49:02.2+00');
INSERT INTO public.audit_log VALUES (19, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:49:02.201988Z", "actor": "ige", "action": "update", "target": "8467f4e3-90d4-45e6-bd0c-fa97cb669435", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-06-30 15:49:02.202+00');
INSERT INTO public.audit_log VALUES (20, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:50:34.321963Z", "actor": "ige", "action": "update", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-06-30 15:50:34.322+00');
INSERT INTO public.audit_log VALUES (21, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:51:11.336499Z", "actor": "ige", "action": "update", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-06-30 15:51:11.336+00');
INSERT INTO public.audit_log VALUES (22, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:52:02.480976Z", "actor": "ige", "action": "update", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-06-30 15:52:02.481+00');
INSERT INTO public.audit_log VALUES (23, 'AuditLog', '{"cat": "data-history", "data": null, "time": "2021-06-30T15:52:16.036761Z", "actor": "ige", "action": "update", "target": "2ab150a3-d846-48a0-8aac-3b98d31e9c17", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-06-30 15:52:16.036+00');
INSERT INTO public.audit_log VALUES (24, 'AuditLog', '{"cat": "", "data": {"settings": "de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog@7a48fd39"}, "time": "2021-07-05T11:58:30.717488Z", "actor": "ige", "action": "create_catalog", "target": "", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit', 'http-nio-80-exec-10', 'INFO', '2021-07-05 11:58:30.717+00');
INSERT INTO public.audit_log VALUES (25, 'AuditLog', '{"cat": "data-history", "data": {"_id": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "_type": "TestDoc", "title": "TestDocResearch", "_state": null, "_parent": null, "_created": "2021-07-22T14:07:48.121799Z", "_version": 0, "_modified": "2021-07-22T14:07:48.121799Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:07:48.170884Z", "actor": "ige", "action": "create", "target": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-07-22 14:07:48.171+00');
INSERT INTO public.audit_log VALUES (26, 'AuditLog', '{"cat": "data-history", "data": {"_id": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "_type": "TestDoc", "title": "TestDocResearch", "_state": null, "_parent": null, "_created": "2021-07-22T14:07:48.121799Z", "_version": 0, "_modified": "2021-07-22T14:07:48.121799Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:07:48.183455Z", "actor": "ige", "action": "update", "target": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-07-22 14:07:48.183+00');
INSERT INTO public.audit_log VALUES (27, 'AuditLog', '{"cat": "data-history", "data": {"_id": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "TestDoc", "table": null, "title": "TestDocResearch", "_state": null, "select": null, "_parent": null, "_created": "2021-07-22T14:07:48.121799Z", "_version": 1, "checkbox": null, "_modified": "2021-07-22T14:08:21.892949Z", "addresses": null, "multiChips": [], "description": null, "multiInputs": [], "optionalText": null, "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "hasWritePermission": true, "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:08:21.903509Z", "actor": "ige", "action": "update", "target": "2294e4f3-821e-4ecd-b6c5-e8fc305275df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-07-22 14:08:21.903+00');
INSERT INTO public.audit_log VALUES (28, 'AuditLog', '{"cat": "data-history", "data": {"_id": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "_type": "mCloudDoc", "title": "TestDocResearch1", "_state": null, "_parent": null, "_created": "2021-07-22T14:08:44.143796Z", "_version": 0, "_modified": "2021-07-22T14:08:44.143796Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:08:44.153964Z", "actor": "ige", "action": "create", "target": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-07-22 14:08:44.154+00');
INSERT INTO public.audit_log VALUES (29, 'AuditLog', '{"cat": "data-history", "data": {"_id": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "_type": "mCloudDoc", "title": "TestDocResearch1", "_state": null, "_parent": null, "_created": "2021-07-22T14:08:44.143796Z", "_version": 0, "_modified": "2021-07-22T14:08:44.143796Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:08:44.158574Z", "actor": "ige", "action": "update", "target": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-07-22 14:08:44.158+00');
INSERT INTO public.audit_log VALUES (30, 'AuditLog', '{"cat": "data-history", "data": {"_id": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch1", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "_created": "2021-07-22T14:08:44.143796Z", "_version": 1, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:09:07.496197Z", "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "München, Bayern, Deutschland", "value": {"lat1": 48.06156094250097, "lat2": 48.247997336790256, "lon1": 11.361236572265625, "lon2": 11.723098754882814}}], "hasWritePermission": true, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:09:07.503229Z", "actor": "ige", "action": "update", "target": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-07-22 14:09:07.503+00');
INSERT INTO public.audit_log VALUES (31, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ecc13939-8110-484b-86f2-1a203e35b8c2", "_type": "mCloudDoc", "title": "TestDocResearch2", "_state": null, "_parent": null, "_created": "2021-07-22T14:09:18.578417Z", "_version": 0, "_modified": "2021-07-22T14:09:18.578417Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:09:18.588291Z", "actor": "ige", "action": "create", "target": "ecc13939-8110-484b-86f2-1a203e35b8c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-07-22 14:09:18.588+00');
INSERT INTO public.audit_log VALUES (32, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ecc13939-8110-484b-86f2-1a203e35b8c2", "_type": "mCloudDoc", "title": "TestDocResearch2", "_state": null, "_parent": null, "_created": "2021-07-22T14:09:18.578417Z", "_version": 0, "_modified": "2021-07-22T14:09:18.578417Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:09:18.592258Z", "actor": "ige", "action": "update", "target": "ecc13939-8110-484b-86f2-1a203e35b8c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-07-22 14:09:18.592+00');
INSERT INTO public.audit_log VALUES (33, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ecc13939-8110-484b-86f2-1a203e35b8c2", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch2", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "_created": "2021-07-22T14:09:18.578417Z", "_version": 1, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:09:29.990471Z", "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Mainz, Rheinland-Pfalz, Deutschland", "value": {"lat1": 49.89551905518783, "lat2": 50.03509159032692, "lon1": 8.14292907714844, "lon2": 8.342056274414064}}], "hasWritePermission": true, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:09:29.997248Z", "actor": "ige", "action": "update", "target": "ecc13939-8110-484b-86f2-1a203e35b8c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-07-22 14:09:29.997+00');
INSERT INTO public.audit_log VALUES (34, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "_type": "mCloudDoc", "title": "TestDocResearch2", "_state": null, "_parent": null, "_created": "2021-07-22T14:09:53.083124Z", "_version": 0, "_modified": "2021-07-22T14:09:53.083124Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:09:53.093006Z", "actor": "ige", "action": "create", "target": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-07-22 14:09:53.093+00');
INSERT INTO public.audit_log VALUES (35, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "_type": "mCloudDoc", "title": "TestDocResearch2", "_state": null, "_parent": null, "_created": "2021-07-22T14:09:53.083124Z", "_version": 0, "_modified": "2021-07-22T14:09:53.083124Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:09:53.095962Z", "actor": "ige", "action": "update", "target": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-07-22 14:09:53.096+00');
INSERT INTO public.audit_log VALUES (36, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch2", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "_created": "2021-07-22T14:09:53.083124Z", "_version": 1, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:10:15.190104Z", "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Stuttgart, Baden-Württemberg, Deutschland", "value": {"lat1": 48.691866919887374, "lat2": 48.866521538507754, "lon1": 9.03831481933594, "lon2": 9.31571960449219}}], "hasWritePermission": true, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:10:15.200780Z", "actor": "ige", "action": "update", "target": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-07-22 14:10:15.2+00');
INSERT INTO public.audit_log VALUES (40, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "_created": "2021-07-22T14:10:43.617803Z", "_version": 1, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:11:25.177913Z", "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:11:25.189285Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-07-22 14:11:25.189+00');
INSERT INTO public.audit_log VALUES (46, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ecc13939-8110-484b-86f2-1a203e35b8c2", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch2", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "_created": "2021-07-22T14:09:18.578417Z", "_version": 2, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:16:14.997103Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "typ"}], "multiChips": [], "description": "ederds", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["roads"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [], "hasWritePermission": true, "openDataCategories": ["ENVI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:16:15.002983Z", "actor": "ige", "action": "update", "target": "ecc13939-8110-484b-86f2-1a203e35b8c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-07-22 14:16:15.003+00');
INSERT INTO public.audit_log VALUES (37, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch2", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "_created": "2021-07-22T14:09:53.083124Z", "_version": 2, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:10:26.387903Z", "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Stuttgart, Baden-Württemberg, Deutschland", "value": {"lat1": 48.691866919887374, "lat2": 48.866521538507754, "lon1": 9.03831481933594, "lon2": 9.31571960449219}}], "hasWritePermission": true, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:10:26.408302Z", "actor": "ige", "action": "update", "target": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-07-22 14:10:26.408+00');
INSERT INTO public.audit_log VALUES (38, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "_type": "mCloudDoc", "title": "TestDocResearch4", "_state": null, "_parent": null, "_created": "2021-07-22T14:10:43.617803Z", "_version": 0, "_modified": "2021-07-22T14:10:43.617803Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:10:43.626506Z", "actor": "ige", "action": "create", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-07-22 14:10:43.626+00');
INSERT INTO public.audit_log VALUES (39, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "_type": "mCloudDoc", "title": "TestDocResearch4", "_state": null, "_parent": null, "_created": "2021-07-22T14:10:43.617803Z", "_version": 0, "_modified": "2021-07-22T14:10:43.617803Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-07-22T14:10:43.629294Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-07-22 14:10:43.629+00');
INSERT INTO public.audit_log VALUES (42, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "GNU Free Documentation License (GFDL)", "_created": "2021-07-22T14:10:43.617803Z", "_version": 3, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:13:10.123243Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "wefwe", "asLink": true}, "type": "asdf", "title": "sdfsd", "format": null}], "multiChips": [], "description": "test for research page", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["climate"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": ["SOCI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:13:10.130177Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-07-22 14:13:10.13+00');
INSERT INTO public.audit_log VALUES (41, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "GNU Free Documentation License (GFDL)", "_created": "2021-07-22T14:10:43.617803Z", "_version": 2, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:12:43.247375Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "wefwe", "asLink": true}, "type": "asdf", "title": "sdfsd", "format": null}], "multiChips": [], "description": "test for research page", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["climate"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": ["SOCI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:12:43.253326Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-07-22 14:12:43.253+00');
INSERT INTO public.audit_log VALUES (49, 'AuditLog', '{"cat": "data-history", "data": {"_id": "8bb38364-378e-434c-a92f-1bd32156c3da", "_type": "FOLDER", "title": "Ordner_Ebene_2A", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:52:12.902302Z", "_version": 0, "_modified": "2021-08-26T10:52:12.902302Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:12.971752Z", "actor": "ige", "action": "update", "target": "8bb38364-378e-434c-a92f-1bd32156c3da", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:52:12.971+00');
INSERT INTO public.audit_log VALUES (43, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "_created": "2021-07-22T14:10:43.617803Z", "_version": 4, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:13:37.988967Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "wemove.de", "asLink": true}, "type": "asdf", "title": "sdfsd", "format": "url"}], "multiChips": [], "description": "test for research page", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["climate"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": ["SOCI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:13:37.994758Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-07-22 14:13:37.994+00');
INSERT INTO public.audit_log VALUES (44, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [{"date": "2021-06-30T22:00:00.000Z", "text": "1"}], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "_created": "2021-07-22T14:10:43.617803Z", "_version": 5, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:13:57.030423Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "wemove.de", "asLink": true}, "type": "asdf", "title": "sdfsd", "format": "url"}], "multiChips": [], "description": "test for research page", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["climate"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": ["SOCI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:13:57.036614Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-07-22 14:13:57.036+00');
INSERT INTO public.audit_log VALUES (45, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch4", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "_created": "2021-07-22T14:10:43.617803Z", "_version": 6, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:15:25.992592Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "link Typ", "title": "", "format": ""}], "multiChips": [], "description": "test for research page", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["climate"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "hasWritePermission": true, "openDataCategories": ["SOCI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:15:26.000069Z", "actor": "ige", "action": "update", "target": "e5bc272c-142b-4ad6-8278-093e3de74b7c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-07-22 14:15:26+00');
INSERT INTO public.audit_log VALUES (47, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ecc13939-8110-484b-86f2-1a203e35b8c2", "map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "_type": "mCloudDoc", "table": null, "title": "TestDocResearch3", "usage": null, "_state": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "_created": "2021-07-22T14:09:18.578417Z", "_version": 3, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-07-22T14:16:57.168627Z", "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "typ"}], "multiChips": [], "description": "ederds", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["roads"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Mainz, Rheinland-Pfalz, Deutschland", "value": {"lat1": 49.89551905518783, "lat2": 50.03509159032692, "lon1": 8.14292907714844, "lon2": 8.342056274414064}}], "hasWritePermission": true, "openDataCategories": ["ENVI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}, "time": "2021-07-22T14:16:57.200232Z", "actor": "ige", "action": "update", "target": "ecc13939-8110-484b-86f2-1a203e35b8c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-07-22 14:16:57.2+00');
INSERT INTO public.audit_log VALUES (48, 'AuditLog', '{"cat": "data-history", "data": {"_id": "8bb38364-378e-434c-a92f-1bd32156c3da", "_type": "FOLDER", "title": "Ordner_Ebene_2A", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:52:12.902302Z", "_version": 0, "_modified": "2021-08-26T10:52:12.902302Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:12.959015Z", "actor": "ige", "action": "create", "target": "8bb38364-378e-434c-a92f-1bd32156c3da", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:52:12.959+00');
INSERT INTO public.audit_log VALUES (50, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_type": "FOLDER", "title": "Ordner_Ebene_2B", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:52:29.06554Z", "_version": 0, "_modified": "2021-08-26T10:52:29.06554Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:29.079813Z", "actor": "ige", "action": "create", "target": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 10:52:29.079+00');
INSERT INTO public.audit_log VALUES (51, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_type": "FOLDER", "title": "Ordner_Ebene_2B", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:52:29.06554Z", "_version": 0, "_modified": "2021-08-26T10:52:29.06554Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:29.082656Z", "actor": "ige", "action": "update", "target": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 10:52:29.082+00');
INSERT INTO public.audit_log VALUES (52, 'AuditLog', '{"cat": "data-history", "data": {"_id": "22613351-12d8-4938-b000-bec7d25372bc", "_type": "FOLDER", "title": "Ordner_Ebene_2C", "_state": null, "_parent": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_created": "2021-08-26T10:52:50.548628Z", "_version": 0, "_modified": "2021-08-26T10:52:50.548628Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:50.560559Z", "actor": "ige", "action": "create", "target": "22613351-12d8-4938-b000-bec7d25372bc", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 10:52:50.56+00');
INSERT INTO public.audit_log VALUES (53, 'AuditLog', '{"cat": "data-history", "data": {"_id": "22613351-12d8-4938-b000-bec7d25372bc", "_type": "FOLDER", "title": "Ordner_Ebene_2C", "_state": null, "_parent": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_created": "2021-08-26T10:52:50.548628Z", "_version": 0, "_modified": "2021-08-26T10:52:50.548628Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:52:50.563549Z", "actor": "ige", "action": "update", "target": "22613351-12d8-4938-b000-bec7d25372bc", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 10:52:50.563+00');
INSERT INTO public.audit_log VALUES (54, 'AuditLog', '{"cat": "data-history", "data": {"_id": "22613351-12d8-4938-b000-bec7d25372bc", "_type": "FOLDER", "title": "Ordner_Ebene_2C", "_state": "W", "_parent": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_created": "2021-08-26T10:52:50.548628Z", "_version": 0, "_modified": "2021-08-26T10:52:50.548628Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:16.021734Z", "actor": "ige", "action": "delete", "target": "22613351-12d8-4938-b000-bec7d25372bc", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 10:53:16.022+00');
INSERT INTO public.audit_log VALUES (58, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_type": "FOLDER", "title": "Ordner_Ebene_2C", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:53:49.611439Z", "_version": 0, "_modified": "2021-08-26T10:53:49.611439Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:49.622063Z", "actor": "ige", "action": "create", "target": "a735083e-14f5-42d1-9f88-72aba5e5f171", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:53:49.622+00');
INSERT INTO public.audit_log VALUES (59, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_type": "FOLDER", "title": "Ordner_Ebene_2C", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:53:49.611439Z", "_version": 0, "_modified": "2021-08-26T10:53:49.611439Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:49.624220Z", "actor": "ige", "action": "update", "target": "a735083e-14f5-42d1-9f88-72aba5e5f171", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:53:49.624+00');
INSERT INTO public.audit_log VALUES (55, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "_type": "FOLDER", "title": "Ordner_Ebene_2B", "_state": "W", "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:52:29.06554Z", "_version": 0, "_modified": "2021-08-26T10:52:29.06554Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:20.282823Z", "actor": "ige", "action": "delete", "target": "a9b576b7-ce66-4fe1-a88d-b983f711e458", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 10:53:20.282+00');
INSERT INTO public.audit_log VALUES (56, 'AuditLog', '{"cat": "data-history", "data": {"_id": "9cc60568-d529-4538-8ebc-664274e5ce81", "_type": "FOLDER", "title": "Ordner_Ebene_2B", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:53:33.302538Z", "_version": 0, "_modified": "2021-08-26T10:53:33.302538Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:33.314379Z", "actor": "ige", "action": "create", "target": "9cc60568-d529-4538-8ebc-664274e5ce81", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:53:33.314+00');
INSERT INTO public.audit_log VALUES (57, 'AuditLog', '{"cat": "data-history", "data": {"_id": "9cc60568-d529-4538-8ebc-664274e5ce81", "_type": "FOLDER", "title": "Ordner_Ebene_2B", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T10:53:33.302538Z", "_version": 0, "_modified": "2021-08-26T10:53:33.302538Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:53:33.316989Z", "actor": "ige", "action": "update", "target": "9cc60568-d529-4538-8ebc-664274e5ce81", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:53:33.317+00');
INSERT INTO public.audit_log VALUES (60, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_type": "FOLDER", "title": "Ordner_Ebene_3A", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:54:36.730215Z", "_version": 0, "_modified": "2021-08-26T10:54:36.730215Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:54:36.741381Z", "actor": "ige", "action": "create", "target": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 10:54:36.741+00');
INSERT INTO public.audit_log VALUES (61, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_type": "FOLDER", "title": "Ordner_Ebene_3A", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:54:36.730215Z", "_version": 0, "_modified": "2021-08-26T10:54:36.730215Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:54:36.744025Z", "actor": "ige", "action": "update", "target": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 10:54:36.744+00');
INSERT INTO public.audit_log VALUES (62, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e9fe4337-9f71-4225-861f-93260743a9d6", "_type": "FOLDER", "title": "Ordner_Ebene_3B", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:55:13.827409Z", "_version": 0, "_modified": "2021-08-26T10:55:13.827409Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:13.853935Z", "actor": "ige", "action": "create", "target": "e9fe4337-9f71-4225-861f-93260743a9d6", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 10:55:13.854+00');
INSERT INTO public.audit_log VALUES (63, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e9fe4337-9f71-4225-861f-93260743a9d6", "_type": "FOLDER", "title": "Ordner_Ebene_3B", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T10:55:13.827409Z", "_version": 0, "_modified": "2021-08-26T10:55:13.827409Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:13.859871Z", "actor": "ige", "action": "update", "target": "e9fe4337-9f71-4225-861f-93260743a9d6", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 10:55:13.859+00');
INSERT INTO public.audit_log VALUES (64, 'AuditLog', '{"cat": "data-history", "data": {"_id": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_type": "FOLDER", "title": "Ordner_Ebene_3C", "_state": null, "_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_created": "2021-08-26T10:55:42.037937Z", "_version": 0, "_modified": "2021-08-26T10:55:42.037937Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:42.054846Z", "actor": "ige", "action": "create", "target": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:55:42.054+00');
INSERT INTO public.audit_log VALUES (65, 'AuditLog', '{"cat": "data-history", "data": {"_id": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_type": "FOLDER", "title": "Ordner_Ebene_3C", "_state": null, "_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_created": "2021-08-26T10:55:42.037937Z", "_version": 0, "_modified": "2021-08-26T10:55:42.037937Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:42.057256Z", "actor": "ige", "action": "update", "target": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:55:42.057+00');
INSERT INTO public.audit_log VALUES (66, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_type": "FOLDER", "title": "Ordner_Ebene_3D", "_state": null, "_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_created": "2021-08-26T10:55:59.390087Z", "_version": 0, "_modified": "2021-08-26T10:55:59.390087Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:59.404490Z", "actor": "ige", "action": "create", "target": "61fd6be2-9cb3-461b-93f0-41212d637c41", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 10:55:59.404+00');
INSERT INTO public.audit_log VALUES (67, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_type": "FOLDER", "title": "Ordner_Ebene_3D", "_state": null, "_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_created": "2021-08-26T10:55:59.390087Z", "_version": 0, "_modified": "2021-08-26T10:55:59.390087Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:55:59.413158Z", "actor": "ige", "action": "update", "target": "61fd6be2-9cb3-461b-93f0-41212d637c41", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 10:55:59.413+00');
INSERT INTO public.audit_log VALUES (68, 'AuditLog', '{"cat": "data-history", "data": {"_id": "175fd9c0-20cf-4edf-a490-1efdb104d96a", "_type": "mCloudDoc", "title": "Datum_Ebene_3_1", "_state": null, "_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_created": "2021-08-26T10:56:29.767677Z", "_version": 0, "_modified": "2021-08-26T10:56:29.767677Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:56:29.778618Z", "actor": "ige", "action": "create", "target": "175fd9c0-20cf-4edf-a490-1efdb104d96a", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 10:56:29.778+00');
INSERT INTO public.audit_log VALUES (69, 'AuditLog', '{"cat": "data-history", "data": {"_id": "175fd9c0-20cf-4edf-a490-1efdb104d96a", "_type": "mCloudDoc", "title": "Datum_Ebene_3_1", "_state": null, "_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_created": "2021-08-26T10:56:29.767677Z", "_version": 0, "_modified": "2021-08-26T10:56:29.767677Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:56:29.781083Z", "actor": "ige", "action": "update", "target": "175fd9c0-20cf-4edf-a490-1efdb104d96a", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 10:56:29.781+00');
INSERT INTO public.audit_log VALUES (70, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a4827541-26c7-4703-b94c-3393e742c9df", "_type": "mCloudDoc", "title": "Datum_Ebene_3_2", "_state": null, "_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_created": "2021-08-26T10:56:54.997235Z", "_version": 0, "_modified": "2021-08-26T10:56:54.997235Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:56:55.009889Z", "actor": "ige", "action": "create", "target": "a4827541-26c7-4703-b94c-3393e742c9df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:56:55.01+00');
INSERT INTO public.audit_log VALUES (71, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a4827541-26c7-4703-b94c-3393e742c9df", "_type": "mCloudDoc", "title": "Datum_Ebene_3_2", "_state": null, "_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_created": "2021-08-26T10:56:54.997235Z", "_version": 0, "_modified": "2021-08-26T10:56:54.997235Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:56:55.012294Z", "actor": "ige", "action": "update", "target": "a4827541-26c7-4703-b94c-3393e742c9df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:56:55.012+00');
INSERT INTO public.audit_log VALUES (72, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f497af26-3571-4dfc-8505-d8d3d4899379", "_type": "mCloudDoc", "title": "Datum_Ebene_4_1", "_state": null, "_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_created": "2021-08-26T10:57:28.608842Z", "_version": 0, "_modified": "2021-08-26T10:57:28.608842Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:57:28.617868Z", "actor": "ige", "action": "create", "target": "f497af26-3571-4dfc-8505-d8d3d4899379", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:57:28.617+00');
INSERT INTO public.audit_log VALUES (73, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f497af26-3571-4dfc-8505-d8d3d4899379", "_type": "mCloudDoc", "title": "Datum_Ebene_4_1", "_state": null, "_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_created": "2021-08-26T10:57:28.608842Z", "_version": 0, "_modified": "2021-08-26T10:57:28.608842Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:57:28.620178Z", "actor": "ige", "action": "update", "target": "f497af26-3571-4dfc-8505-d8d3d4899379", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 10:57:28.62+00');
INSERT INTO public.audit_log VALUES (78, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bc4e0d68-3023-444c-9e31-df858baceeef", "_type": "mCloudDoc", "title": "Datum_Ebene_4_4", "_state": null, "_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_created": "2021-08-26T10:58:44.887837Z", "_version": 0, "_modified": "2021-08-26T10:58:44.887837Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:58:44.897594Z", "actor": "ige", "action": "create", "target": "bc4e0d68-3023-444c-9e31-df858baceeef", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 10:58:44.897+00');
INSERT INTO public.audit_log VALUES (79, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bc4e0d68-3023-444c-9e31-df858baceeef", "_type": "mCloudDoc", "title": "Datum_Ebene_4_4", "_state": null, "_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_created": "2021-08-26T10:58:44.887837Z", "_version": 0, "_modified": "2021-08-26T10:58:44.887837Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:58:44.899826Z", "actor": "ige", "action": "update", "target": "bc4e0d68-3023-444c-9e31-df858baceeef", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 10:58:44.899+00');
INSERT INTO public.audit_log VALUES (80, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f3219242-018e-4f1b-b350-5970a9686176", "_type": "mCloudDoc", "title": "Datum_Ebene_4_5", "_state": null, "_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_created": "2021-08-26T11:00:22.376102Z", "_version": 0, "_modified": "2021-08-26T11:00:22.376102Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:00:22.387956Z", "actor": "ige", "action": "create", "target": "f3219242-018e-4f1b-b350-5970a9686176", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:00:22.388+00');
INSERT INTO public.audit_log VALUES (81, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f3219242-018e-4f1b-b350-5970a9686176", "_type": "mCloudDoc", "title": "Datum_Ebene_4_5", "_state": null, "_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_created": "2021-08-26T11:00:22.376102Z", "_version": 0, "_modified": "2021-08-26T11:00:22.376102Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:00:22.390381Z", "actor": "ige", "action": "update", "target": "f3219242-018e-4f1b-b350-5970a9686176", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:00:22.39+00');
INSERT INTO public.audit_log VALUES (86, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bb9c0963-c6ec-4dd5-9f3f-33976556d1c9", "_type": "mCloudDoc", "title": "Datum_Ebene_4_8", "_state": null, "_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_created": "2021-08-26T11:01:44.964146Z", "_version": 0, "_modified": "2021-08-26T11:01:44.964146Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:01:44.973267Z", "actor": "ige", "action": "create", "target": "bb9c0963-c6ec-4dd5-9f3f-33976556d1c9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:01:44.973+00');
INSERT INTO public.audit_log VALUES (87, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bb9c0963-c6ec-4dd5-9f3f-33976556d1c9", "_type": "mCloudDoc", "title": "Datum_Ebene_4_8", "_state": null, "_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_created": "2021-08-26T11:01:44.964146Z", "_version": 0, "_modified": "2021-08-26T11:01:44.964146Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:01:44.994378Z", "actor": "ige", "action": "update", "target": "bb9c0963-c6ec-4dd5-9f3f-33976556d1c9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:01:44.994+00');
INSERT INTO public.audit_log VALUES (88, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c", "_type": "mCloudDoc", "title": "Datum_Ebene_2_1", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T11:03:32.681918Z", "_version": 0, "_modified": "2021-08-26T11:03:32.681918Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:03:32.689477Z", "actor": "ige", "action": "create", "target": "f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:03:32.689+00');
INSERT INTO public.audit_log VALUES (74, 'AuditLog', '{"cat": "data-history", "data": {"_id": "58977711-f24a-471f-afc8-1179a7e2c703", "_type": "mCloudDoc", "title": "Datum_Ebene_4_2", "_state": null, "_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_created": "2021-08-26T10:57:41.240765Z", "_version": 0, "_modified": "2021-08-26T10:57:41.240765Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:57:41.252775Z", "actor": "ige", "action": "create", "target": "58977711-f24a-471f-afc8-1179a7e2c703", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:57:41.252+00');
INSERT INTO public.audit_log VALUES (75, 'AuditLog', '{"cat": "data-history", "data": {"_id": "58977711-f24a-471f-afc8-1179a7e2c703", "_type": "mCloudDoc", "title": "Datum_Ebene_4_2", "_state": null, "_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_created": "2021-08-26T10:57:41.240765Z", "_version": 0, "_modified": "2021-08-26T10:57:41.240765Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:57:41.255436Z", "actor": "ige", "action": "update", "target": "58977711-f24a-471f-afc8-1179a7e2c703", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:57:41.255+00');
INSERT INTO public.audit_log VALUES (76, 'AuditLog', '{"cat": "data-history", "data": {"_id": "59bc4522-9456-44fe-8ab4-e98fe713b9c2", "_type": "mCloudDoc", "title": "Datum_Ebene_4_3", "_state": null, "_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_created": "2021-08-26T10:58:25.277975Z", "_version": 0, "_modified": "2021-08-26T10:58:25.277975Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:58:25.287626Z", "actor": "ige", "action": "create", "target": "59bc4522-9456-44fe-8ab4-e98fe713b9c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:58:25.287+00');
INSERT INTO public.audit_log VALUES (77, 'AuditLog', '{"cat": "data-history", "data": {"_id": "59bc4522-9456-44fe-8ab4-e98fe713b9c2", "_type": "mCloudDoc", "title": "Datum_Ebene_4_3", "_state": null, "_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_created": "2021-08-26T10:58:25.277975Z", "_version": 0, "_modified": "2021-08-26T10:58:25.277975Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T10:58:25.289341Z", "actor": "ige", "action": "update", "target": "59bc4522-9456-44fe-8ab4-e98fe713b9c2", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 10:58:25.289+00');
INSERT INTO public.audit_log VALUES (82, 'AuditLog', '{"cat": "data-history", "data": {"_id": "79ebf92f-67e3-4de7-958a-37e12aea9f39", "_type": "mCloudDoc", "title": "Datum_Ebene_4_6", "_state": null, "_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_created": "2021-08-26T11:00:44.154685Z", "_version": 0, "_modified": "2021-08-26T11:00:44.154685Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:00:44.165116Z", "actor": "ige", "action": "create", "target": "79ebf92f-67e3-4de7-958a-37e12aea9f39", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:00:44.165+00');
INSERT INTO public.audit_log VALUES (83, 'AuditLog', '{"cat": "data-history", "data": {"_id": "79ebf92f-67e3-4de7-958a-37e12aea9f39", "_type": "mCloudDoc", "title": "Datum_Ebene_4_6", "_state": null, "_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_created": "2021-08-26T11:00:44.154685Z", "_version": 0, "_modified": "2021-08-26T11:00:44.154685Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:00:44.167284Z", "actor": "ige", "action": "update", "target": "79ebf92f-67e3-4de7-958a-37e12aea9f39", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:00:44.167+00');
INSERT INTO public.audit_log VALUES (84, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c16af9ea-ab87-4d31-b86f-60ad96e4e9cb", "_type": "mCloudDoc", "title": "Datum_Ebene_4_7", "_state": null, "_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_created": "2021-08-26T11:01:30.837085Z", "_version": 0, "_modified": "2021-08-26T11:01:30.837085Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:01:30.845335Z", "actor": "ige", "action": "create", "target": "c16af9ea-ab87-4d31-b86f-60ad96e4e9cb", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:01:30.845+00');
INSERT INTO public.audit_log VALUES (85, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c16af9ea-ab87-4d31-b86f-60ad96e4e9cb", "_type": "mCloudDoc", "title": "Datum_Ebene_4_7", "_state": null, "_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_created": "2021-08-26T11:01:30.837085Z", "_version": 0, "_modified": "2021-08-26T11:01:30.837085Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:01:30.847731Z", "actor": "ige", "action": "update", "target": "c16af9ea-ab87-4d31-b86f-60ad96e4e9cb", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:01:30.847+00');
INSERT INTO public.audit_log VALUES (90, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "_type": "mCloudDoc", "title": "Datum_Ebene_3_1", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T11:05:52.132856Z", "_version": 0, "_modified": "2021-08-26T11:05:52.132856Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:05:52.141312Z", "actor": "ige", "action": "create", "target": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:05:52.141+00');
INSERT INTO public.audit_log VALUES (91, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "_type": "mCloudDoc", "title": "Datum_Ebene_3_1", "_state": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_created": "2021-08-26T11:05:52.132856Z", "_version": 0, "_modified": "2021-08-26T11:05:52.132856Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:05:52.143288Z", "actor": "ige", "action": "update", "target": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:05:52.143+00');
INSERT INTO public.audit_log VALUES (89, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c", "_type": "mCloudDoc", "title": "Datum_Ebene_2_1", "_state": null, "_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_created": "2021-08-26T11:03:32.681918Z", "_version": 0, "_modified": "2021-08-26T11:03:32.681918Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:03:32.691386Z", "actor": "ige", "action": "update", "target": "f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:03:32.691+00');
INSERT INTO public.audit_log VALUES (92, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "_type": "mCloudDoc", "title": "Datum_Ebene_3_3", "usage": null, "_state": null, "events": [], "origin": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "license": null, "_created": "2021-08-26T11:05:52.132856Z", "_version": 1, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "_modified": "2021-08-26T11:06:37.234478Z", "addresses": null, "downloads": null, "description": null, "periodicity": null, "mfundProject": null, "mCloudCategories": [], "geoReferenceVisual": null, "hasWritePermission": true, "openDataCategories": []}, "time": "2021-08-26T11:06:37.239243Z", "actor": "ige", "action": "update", "target": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:06:37.239+00');
INSERT INTO public.audit_log VALUES (93, 'AuditLog', '{"cat": "data-history", "data": {"_id": "70b789f7-5caf-4197-9a78-9883395f0035", "_type": "mCloudDoc", "title": "catalogue_admin_only_doc", "_state": null, "_parent": null, "_created": "2021-08-26T11:10:20.646916Z", "_version": 0, "_modified": "2021-08-26T11:10:20.646916Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:10:20.657321Z", "actor": "ige", "action": "create", "target": "70b789f7-5caf-4197-9a78-9883395f0035", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 11:10:20.657+00');
INSERT INTO public.audit_log VALUES (94, 'AuditLog', '{"cat": "data-history", "data": {"_id": "70b789f7-5caf-4197-9a78-9883395f0035", "_type": "mCloudDoc", "title": "catalogue_admin_only_doc", "_state": null, "_parent": null, "_created": "2021-08-26T11:10:20.646916Z", "_version": 0, "_modified": "2021-08-26T11:10:20.646916Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:10:20.667407Z", "actor": "ige", "action": "update", "target": "70b789f7-5caf-4197-9a78-9883395f0035", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 11:10:20.667+00');
INSERT INTO public.audit_log VALUES (95, 'AuditLog', '{"cat": "data-history", "data": {"_id": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_type": "FOLDER", "title": "Ordner_2.Ebene_B", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:16:33.21335Z", "_version": 0, "_modified": "2021-08-26T11:16:33.21335Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:16:33.226026Z", "actor": "ige", "action": "create", "target": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:16:33.226+00');
INSERT INTO public.audit_log VALUES (96, 'AuditLog', '{"cat": "data-history", "data": {"_id": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_type": "FOLDER", "title": "Ordner_2.Ebene_B", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:16:33.21335Z", "_version": 0, "_modified": "2021-08-26T11:16:33.21335Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:16:33.229515Z", "actor": "ige", "action": "update", "target": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:16:33.229+00');
INSERT INTO public.audit_log VALUES (97, 'AuditLog', '{"cat": "data-history", "data": {"_id": "376c9824-20a0-433c-af3e-e196ea04a077", "_type": "FOLDER", "title": "Ordner_3.Ebene_A", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:16:52.616317Z", "_version": 0, "_modified": "2021-08-26T11:16:52.616317Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:16:52.630538Z", "actor": "ige", "action": "create", "target": "376c9824-20a0-433c-af3e-e196ea04a077", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:16:52.63+00');
INSERT INTO public.audit_log VALUES (98, 'AuditLog', '{"cat": "data-history", "data": {"_id": "376c9824-20a0-433c-af3e-e196ea04a077", "_type": "FOLDER", "title": "Ordner_3.Ebene_A", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:16:52.616317Z", "_version": 0, "_modified": "2021-08-26T11:16:52.616317Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:16:52.632619Z", "actor": "ige", "action": "update", "target": "376c9824-20a0-433c-af3e-e196ea04a077", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:16:52.632+00');
INSERT INTO public.audit_log VALUES (99, 'AuditLog', '{"cat": "data-history", "data": {"_id": "903fc3e6-133d-480b-851b-42d8aeef09ff", "_type": "FOLDER", "title": "Ordner_3.Ebene_C", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:17:06.502682Z", "_version": 0, "_modified": "2021-08-26T11:17:06.502682Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:17:06.512021Z", "actor": "ige", "action": "create", "target": "903fc3e6-133d-480b-851b-42d8aeef09ff", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 11:17:06.512+00');
INSERT INTO public.audit_log VALUES (100, 'AuditLog', '{"cat": "data-history", "data": {"_id": "903fc3e6-133d-480b-851b-42d8aeef09ff", "_type": "FOLDER", "title": "Ordner_3.Ebene_C", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:17:06.502682Z", "_version": 0, "_modified": "2021-08-26T11:17:06.502682Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:17:06.513761Z", "actor": "ige", "action": "update", "target": "903fc3e6-133d-480b-851b-42d8aeef09ff", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 11:17:06.513+00');
INSERT INTO public.audit_log VALUES (101, 'AuditLog', '{"cat": "data-history", "data": {"_id": "903fc3e6-133d-480b-851b-42d8aeef09ff", "_type": "FOLDER", "title": "Ordner_3.Ebene_C", "_state": "W", "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:17:06.502682Z", "_version": 0, "_modified": "2021-08-26T11:17:06.502682Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:17:41.628522Z", "actor": "ige", "action": "delete", "target": "903fc3e6-133d-480b-851b-42d8aeef09ff", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 11:17:41.628+00');
INSERT INTO public.audit_log VALUES (102, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_type": "FOLDER", "title": "Ordner_3.Ebene_B", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:17:54.77336Z", "_version": 0, "_modified": "2021-08-26T11:17:54.77336Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:17:54.783744Z", "actor": "ige", "action": "create", "target": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:17:54.783+00');
INSERT INTO public.audit_log VALUES (103, 'AuditLog', '{"cat": "data-history", "data": {"_id": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_type": "FOLDER", "title": "Ordner_3.Ebene_B", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:17:54.77336Z", "_version": 0, "_modified": "2021-08-26T11:17:54.77336Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:17:54.785606Z", "actor": "ige", "action": "update", "target": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:17:54.785+00');
INSERT INTO public.audit_log VALUES (104, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_type": "FOLDER", "title": "Ordner_3.Ebene_C", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:18:12.13876Z", "_version": 0, "_modified": "2021-08-26T11:18:12.13876Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:12.148337Z", "actor": "ige", "action": "create", "target": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:18:12.148+00');
INSERT INTO public.audit_log VALUES (105, 'AuditLog', '{"cat": "data-history", "data": {"_id": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_type": "FOLDER", "title": "Ordner_3.Ebene_C", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:18:12.13876Z", "_version": 0, "_modified": "2021-08-26T11:18:12.13876Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:12.150149Z", "actor": "ige", "action": "update", "target": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:18:12.15+00');
INSERT INTO public.audit_log VALUES (108, 'AuditLog', '{"cat": "data-history", "data": {"_id": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_type": "FOLDER", "title": "Ordner_2.Ebene_C", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:18:46.282316Z", "_version": 0, "_modified": "2021-08-26T11:18:46.282316Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:46.292508Z", "actor": "ige", "action": "create", "target": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:18:46.292+00');
INSERT INTO public.audit_log VALUES (109, 'AuditLog', '{"cat": "data-history", "data": {"_id": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_type": "FOLDER", "title": "Ordner_2.Ebene_C", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:18:46.282316Z", "_version": 0, "_modified": "2021-08-26T11:18:46.282316Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:46.294508Z", "actor": "ige", "action": "update", "target": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:18:46.294+00');
INSERT INTO public.audit_log VALUES (110, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d6371165-1be0-4a7c-b635-fd6952cad479", "_type": "FOLDER", "title": "Ordner_3.Ebene_E", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:19:20.06179Z", "_version": 0, "_modified": "2021-08-26T11:19:20.06179Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:20.071414Z", "actor": "ige", "action": "create", "target": "d6371165-1be0-4a7c-b635-fd6952cad479", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:19:20.071+00');
INSERT INTO public.audit_log VALUES (111, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d6371165-1be0-4a7c-b635-fd6952cad479", "_type": "FOLDER", "title": "Ordner_3.Ebene_E", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:19:20.06179Z", "_version": 0, "_modified": "2021-08-26T11:19:20.06179Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:20.073488Z", "actor": "ige", "action": "update", "target": "d6371165-1be0-4a7c-b635-fd6952cad479", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:19:20.073+00');
INSERT INTO public.audit_log VALUES (106, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_type": "FOLDER", "title": "Ordner_3.Ebene_D", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:18:23.338313Z", "_version": 0, "_modified": "2021-08-26T11:18:23.338313Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:23.352641Z", "actor": "ige", "action": "create", "target": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:18:23.352+00');
INSERT INTO public.audit_log VALUES (107, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_type": "FOLDER", "title": "Ordner_3.Ebene_D", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:18:23.338313Z", "_version": 0, "_modified": "2021-08-26T11:18:23.338313Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:18:23.355676Z", "actor": "ige", "action": "update", "target": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:18:23.355+00');
INSERT INTO public.audit_log VALUES (112, 'AuditLog', '{"cat": "data-history", "data": {"_id": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_type": "FOLDER", "title": "Ordner_3.Ebene_F", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:19:36.076162Z", "_version": 0, "_modified": "2021-08-26T11:19:36.076162Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:36.097152Z", "actor": "ige", "action": "create", "target": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:19:36.097+00');
INSERT INTO public.audit_log VALUES (113, 'AuditLog', '{"cat": "data-history", "data": {"_id": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_type": "FOLDER", "title": "Ordner_3.Ebene_F", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:19:36.076162Z", "_version": 0, "_modified": "2021-08-26T11:19:36.076162Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:36.099157Z", "actor": "ige", "action": "update", "target": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:19:36.099+00');
INSERT INTO public.audit_log VALUES (114, 'AuditLog', '{"cat": "data-history", "data": {"_id": "6237be21-04f8-4d40-bf87-a266543732ea", "_type": "FOLDER", "title": "Ordner_4.Ebene_A", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:19:58.050663Z", "_version": 0, "_modified": "2021-08-26T11:19:58.050663Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:58.073950Z", "actor": "ige", "action": "create", "target": "6237be21-04f8-4d40-bf87-a266543732ea", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:19:58.074+00');
INSERT INTO public.audit_log VALUES (115, 'AuditLog', '{"cat": "data-history", "data": {"_id": "6237be21-04f8-4d40-bf87-a266543732ea", "_type": "FOLDER", "title": "Ordner_4.Ebene_A", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:19:58.050663Z", "_version": 0, "_modified": "2021-08-26T11:19:58.050663Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:19:58.075773Z", "actor": "ige", "action": "update", "target": "6237be21-04f8-4d40-bf87-a266543732ea", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:19:58.075+00');
INSERT INTO public.audit_log VALUES (116, 'AuditLog', '{"cat": "data-history", "data": {"_id": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_type": "FOLDER", "title": "Ordner_4.Ebene_B", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:20:13.498075Z", "_version": 0, "_modified": "2021-08-26T11:20:13.498075Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:13.505452Z", "actor": "ige", "action": "create", "target": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 11:20:13.505+00');
INSERT INTO public.audit_log VALUES (117, 'AuditLog', '{"cat": "data-history", "data": {"_id": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_type": "FOLDER", "title": "Ordner_4.Ebene_B", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:20:13.498075Z", "_version": 0, "_modified": "2021-08-26T11:20:13.498075Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:13.507430Z", "actor": "ige", "action": "update", "target": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 11:20:13.507+00');
INSERT INTO public.audit_log VALUES (118, 'AuditLog', '{"cat": "data-history", "data": {"_id": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_type": "FOLDER", "title": "Ordner_4.Ebene_C", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:20:34.616365Z", "_version": 0, "_modified": "2021-08-26T11:20:34.616365Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:34.624689Z", "actor": "ige", "action": "create", "target": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:20:34.624+00');
INSERT INTO public.audit_log VALUES (119, 'AuditLog', '{"cat": "data-history", "data": {"_id": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_type": "FOLDER", "title": "Ordner_4.Ebene_C", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:20:34.616365Z", "_version": 0, "_modified": "2021-08-26T11:20:34.616365Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:34.626464Z", "actor": "ige", "action": "update", "target": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:20:34.626+00');
INSERT INTO public.audit_log VALUES (120, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61f389f8-d198-445c-be89-c0e5128520f0", "_type": "FOLDER", "title": "Ordner_4.Ebene_D", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:20:50.432347Z", "_version": 0, "_modified": "2021-08-26T11:20:50.432347Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:50.440065Z", "actor": "ige", "action": "create", "target": "61f389f8-d198-445c-be89-c0e5128520f0", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:20:50.44+00');
INSERT INTO public.audit_log VALUES (121, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61f389f8-d198-445c-be89-c0e5128520f0", "_type": "FOLDER", "title": "Ordner_4.Ebene_D", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:20:50.432347Z", "_version": 0, "_modified": "2021-08-26T11:20:50.432347Z", "_hasChildren": false, "hasWritePermission": true}, "time": "2021-08-26T11:20:50.442314Z", "actor": "ige", "action": "update", "target": "61f389f8-d198-445c-be89-c0e5128520f0", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:20:50.442+00');
INSERT INTO public.audit_log VALUES (122, 'AuditLog', '{"cat": "data-history", "data": {"_id": "556c875e-d471-4a35-8203-0c750737d296", "_type": "AddressDoc", "title": "Taunus, Adresse", "_state": null, "_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "_created": "2021-08-26T11:21:34.32136Z", "_version": 0, "lastName": "Taunus", "_modified": "2021-08-26T11:21:34.32136Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:21:34.329222Z", "actor": "ige", "action": "create", "target": "556c875e-d471-4a35-8203-0c750737d296", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:21:34.329+00');
INSERT INTO public.audit_log VALUES (123, 'AuditLog', '{"cat": "data-history", "data": {"_id": "556c875e-d471-4a35-8203-0c750737d296", "_type": "AddressDoc", "title": "Taunus, Adresse", "_state": null, "_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "_created": "2021-08-26T11:21:34.32136Z", "_version": 0, "lastName": "Taunus", "_modified": "2021-08-26T11:21:34.32136Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:21:34.331069Z", "actor": "ige", "action": "update", "target": "556c875e-d471-4a35-8203-0c750737d296", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-4', 'INFO', '2021-08-26 11:21:34.331+00');
INSERT INTO public.audit_log VALUES (128, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d7c933b4-083c-473b-bcf7-9979fddd5b4d", "_type": "AddressDoc", "title": "Schwarzwald, Adresse", "_state": null, "_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_created": "2021-08-26T11:22:17.10488Z", "_version": 0, "lastName": "Schwarzwald", "_modified": "2021-08-26T11:22:17.10488Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:22:17.116162Z", "actor": "ige", "action": "create", "target": "d7c933b4-083c-473b-bcf7-9979fddd5b4d", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:22:17.116+00');
INSERT INTO public.audit_log VALUES (129, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d7c933b4-083c-473b-bcf7-9979fddd5b4d", "_type": "AddressDoc", "title": "Schwarzwald, Adresse", "_state": null, "_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_created": "2021-08-26T11:22:17.10488Z", "_version": 0, "lastName": "Schwarzwald", "_modified": "2021-08-26T11:22:17.10488Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:22:17.118678Z", "actor": "ige", "action": "update", "target": "d7c933b4-083c-473b-bcf7-9979fddd5b4d", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:22:17.118+00');
INSERT INTO public.audit_log VALUES (124, 'AuditLog', '{"cat": "data-history", "data": {"_id": "eb792c63-0238-4207-a34a-46e0def02656", "_type": "AddressDoc", "title": "Rhön, Adresse", "_state": null, "_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "_created": "2021-08-26T11:21:46.783323Z", "_version": 0, "lastName": "Rhön", "_modified": "2021-08-26T11:21:46.783323Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:21:46.791068Z", "actor": "ige", "action": "create", "target": "eb792c63-0238-4207-a34a-46e0def02656", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:21:46.791+00');
INSERT INTO public.audit_log VALUES (125, 'AuditLog', '{"cat": "data-history", "data": {"_id": "eb792c63-0238-4207-a34a-46e0def02656", "_type": "AddressDoc", "title": "Rhön, Adresse", "_state": null, "_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "_created": "2021-08-26T11:21:46.783323Z", "_version": 0, "lastName": "Rhön", "_modified": "2021-08-26T11:21:46.783323Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:21:46.793113Z", "actor": "ige", "action": "update", "target": "eb792c63-0238-4207-a34a-46e0def02656", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:21:46.793+00');
INSERT INTO public.audit_log VALUES (126, 'AuditLog', '{"cat": "data-history", "data": {"_id": "08f38f6c-db28-4357-a361-4104804d53c9", "_type": "AddressDoc", "title": "Odenwald, Adresse", "_state": null, "_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_created": "2021-08-26T11:22:05.17921Z", "_version": 0, "lastName": "Odenwald", "_modified": "2021-08-26T11:22:05.17921Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:22:05.189008Z", "actor": "ige", "action": "create", "target": "08f38f6c-db28-4357-a361-4104804d53c9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:22:05.189+00');
INSERT INTO public.audit_log VALUES (127, 'AuditLog', '{"cat": "data-history", "data": {"_id": "08f38f6c-db28-4357-a361-4104804d53c9", "_type": "AddressDoc", "title": "Odenwald, Adresse", "_state": null, "_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "_created": "2021-08-26T11:22:05.17921Z", "_version": 0, "lastName": "Odenwald", "_modified": "2021-08-26T11:22:05.17921Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:22:05.190740Z", "actor": "ige", "action": "update", "target": "08f38f6c-db28-4357-a361-4104804d53c9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:22:05.19+00');
INSERT INTO public.audit_log VALUES (130, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d6d4d774-c17c-4ebd-a494-2b73d598cb50", "_type": "AddressDoc", "title": "Harz, Adresse", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:49:34.509443Z", "_version": 0, "lastName": "Harz", "_modified": "2021-08-26T11:49:34.509443Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:49:34.522850Z", "actor": "ige", "action": "create", "target": "d6d4d774-c17c-4ebd-a494-2b73d598cb50", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:49:34.522+00');
INSERT INTO public.audit_log VALUES (131, 'AuditLog', '{"cat": "data-history", "data": {"_id": "d6d4d774-c17c-4ebd-a494-2b73d598cb50", "_type": "AddressDoc", "title": "Harz, Adresse", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T11:49:34.509443Z", "_version": 0, "lastName": "Harz", "_modified": "2021-08-26T11:49:34.509443Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:49:34.525143Z", "actor": "ige", "action": "update", "target": "d6d4d774-c17c-4ebd-a494-2b73d598cb50", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:49:34.525+00');
INSERT INTO public.audit_log VALUES (132, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bf93c9db-aea1-4851-8074-9f5badef7e6a", "_type": "AddressDoc", "title": "Hunsrück, Adresse", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:50:02.406441Z", "_version": 0, "lastName": "Hunsrück", "_modified": "2021-08-26T11:50:02.406441Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:02.416078Z", "actor": "ige", "action": "create", "target": "bf93c9db-aea1-4851-8074-9f5badef7e6a", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:50:02.416+00');
INSERT INTO public.audit_log VALUES (133, 'AuditLog', '{"cat": "data-history", "data": {"_id": "bf93c9db-aea1-4851-8074-9f5badef7e6a", "_type": "AddressDoc", "title": "Hunsrück, Adresse", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T11:50:02.406441Z", "_version": 0, "lastName": "Hunsrück", "_modified": "2021-08-26T11:50:02.406441Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:02.418679Z", "actor": "ige", "action": "update", "target": "bf93c9db-aea1-4851-8074-9f5badef7e6a", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-10', 'INFO', '2021-08-26 11:50:02.418+00');
INSERT INTO public.audit_log VALUES (134, 'AuditLog', '{"cat": "data-history", "data": {"_id": "3e3c3e48-e6e3-47de-a35b-e298a2a53e83", "_type": "AddressDoc", "title": "Picardie, Adresse", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:50:31.223721Z", "_version": 0, "lastName": "Picardie", "_modified": "2021-08-26T11:50:31.223721Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:31.236425Z", "actor": "ige", "action": "create", "target": "3e3c3e48-e6e3-47de-a35b-e298a2a53e83", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:50:31.236+00');
INSERT INTO public.audit_log VALUES (135, 'AuditLog', '{"cat": "data-history", "data": {"_id": "3e3c3e48-e6e3-47de-a35b-e298a2a53e83", "_type": "AddressDoc", "title": "Picardie, Adresse", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T11:50:31.223721Z", "_version": 0, "lastName": "Picardie", "_modified": "2021-08-26T11:50:31.223721Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:31.238262Z", "actor": "ige", "action": "update", "target": "3e3c3e48-e6e3-47de-a35b-e298a2a53e83", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:50:31.238+00');
INSERT INTO public.audit_log VALUES (136, 'AuditLog', '{"cat": "data-history", "data": {"_id": "05b2e466-b55f-4d16-a10b-358b447eeb50", "_type": "AddressDoc", "title": "Provence, Adresse", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:50:49.988784Z", "_version": 0, "lastName": "Provence", "_modified": "2021-08-26T11:50:49.988784Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:49.998180Z", "actor": "ige", "action": "create", "target": "05b2e466-b55f-4d16-a10b-358b447eeb50", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 11:50:49.998+00');
INSERT INTO public.audit_log VALUES (137, 'AuditLog', '{"cat": "data-history", "data": {"_id": "05b2e466-b55f-4d16-a10b-358b447eeb50", "_type": "AddressDoc", "title": "Provence, Adresse", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:50:49.988784Z", "_version": 0, "lastName": "Provence", "_modified": "2021-08-26T11:50:49.988784Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:50:49.999828Z", "actor": "ige", "action": "update", "target": "05b2e466-b55f-4d16-a10b-358b447eeb50", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 11:50:49.999+00');
INSERT INTO public.audit_log VALUES (138, 'AuditLog', '{"cat": "data-history", "data": {"_id": "93374b77-5cc4-404f-be1f-a478458a617c", "_type": "AddressDoc", "title": "Aquitanien, Adresse", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:51:33.333215Z", "_version": 0, "lastName": "Aquitanien", "_modified": "2021-08-26T11:51:33.333215Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:51:33.343760Z", "actor": "ige", "action": "create", "target": "93374b77-5cc4-404f-be1f-a478458a617c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:51:33.343+00');
INSERT INTO public.audit_log VALUES (139, 'AuditLog', '{"cat": "data-history", "data": {"_id": "93374b77-5cc4-404f-be1f-a478458a617c", "_type": "AddressDoc", "title": "Aquitanien, Adresse", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T11:51:33.333215Z", "_version": 0, "lastName": "Aquitanien", "_modified": "2021-08-26T11:51:33.333215Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:51:33.345616Z", "actor": "ige", "action": "update", "target": "93374b77-5cc4-404f-be1f-a478458a617c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:51:33.345+00');
INSERT INTO public.audit_log VALUES (140, 'AuditLog', '{"cat": "data-history", "data": {"_id": "1db03de3-510f-4149-adf0-3973a515a954", "_type": "AddressDoc", "title": "Vendee, Adresse", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:51:59.024539Z", "_version": 0, "lastName": "Vendee", "_modified": "2021-08-26T11:51:59.024539Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:51:59.032866Z", "actor": "ige", "action": "create", "target": "1db03de3-510f-4149-adf0-3973a515a954", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:51:59.032+00');
INSERT INTO public.audit_log VALUES (141, 'AuditLog', '{"cat": "data-history", "data": {"_id": "1db03de3-510f-4149-adf0-3973a515a954", "_type": "AddressDoc", "title": "Vendee, Adresse", "_state": null, "_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_created": "2021-08-26T11:51:59.024539Z", "_version": 0, "lastName": "Vendee", "_modified": "2021-08-26T11:51:59.024539Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:51:59.034504Z", "actor": "ige", "action": "update", "target": "1db03de3-510f-4149-adf0-3973a515a954", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:51:59.034+00');
INSERT INTO public.audit_log VALUES (142, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e629f81d-f9fc-4a97-b224-e00df74b1043", "_type": "AddressDoc", "title": "Pays-Basque, Adresse", "_state": null, "_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_created": "2021-08-26T11:52:45.119741Z", "_version": 0, "lastName": "Pays-Basque", "_modified": "2021-08-26T11:52:45.119741Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:52:45.128335Z", "actor": "ige", "action": "create", "target": "e629f81d-f9fc-4a97-b224-e00df74b1043", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:52:45.128+00');
INSERT INTO public.audit_log VALUES (143, 'AuditLog', '{"cat": "data-history", "data": {"_id": "e629f81d-f9fc-4a97-b224-e00df74b1043", "_type": "AddressDoc", "title": "Pays-Basque, Adresse", "_state": null, "_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_created": "2021-08-26T11:52:45.119741Z", "_version": 0, "lastName": "Pays-Basque", "_modified": "2021-08-26T11:52:45.119741Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:52:45.130042Z", "actor": "ige", "action": "update", "target": "e629f81d-f9fc-4a97-b224-e00df74b1043", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:52:45.13+00');
INSERT INTO public.audit_log VALUES (144, 'AuditLog', '{"cat": "data-history", "data": {"_id": "6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c", "_type": "AddressDoc", "title": "Périgord, Adresse", "_state": null, "_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_created": "2021-08-26T11:53:55.911459Z", "_version": 0, "lastName": "Périgord", "_modified": "2021-08-26T11:53:55.911459Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:53:55.925443Z", "actor": "ige", "action": "create", "target": "6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:53:55.925+00');
INSERT INTO public.audit_log VALUES (145, 'AuditLog', '{"cat": "data-history", "data": {"_id": "6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c", "_type": "AddressDoc", "title": "Périgord, Adresse", "_state": null, "_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_created": "2021-08-26T11:53:55.911459Z", "_version": 0, "lastName": "Périgord", "_modified": "2021-08-26T11:53:55.911459Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:53:55.927613Z", "actor": "ige", "action": "update", "target": "6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:53:55.927+00');
INSERT INTO public.audit_log VALUES (146, 'AuditLog', '{"cat": "data-history", "data": {"_id": "8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353", "_type": "AddressDoc", "title": "Rheinland, Adresse", "_state": null, "_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "_created": "2021-08-26T11:54:28.968721Z", "_version": 0, "lastName": "Rheinland", "_modified": "2021-08-26T11:54:28.968721Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:54:28.976673Z", "actor": "ige", "action": "create", "target": "8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:54:28.976+00');
INSERT INTO public.audit_log VALUES (147, 'AuditLog', '{"cat": "data-history", "data": {"_id": "8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353", "_type": "AddressDoc", "title": "Rheinland, Adresse", "_state": null, "_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "_created": "2021-08-26T11:54:28.968721Z", "_version": 0, "lastName": "Rheinland", "_modified": "2021-08-26T11:54:28.968721Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:54:28.978477Z", "actor": "ige", "action": "update", "target": "8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 11:54:28.978+00');
INSERT INTO public.audit_log VALUES (148, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61ca7795-e9ce-43d1-a333-2c540238163f", "_type": "AddressDoc", "title": "Allgäu, Adresse", "_state": null, "_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_created": "2021-08-26T11:56:31.808546Z", "_version": 0, "lastName": "Allgäu", "_modified": "2021-08-26T11:56:31.808546Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:56:31.816581Z", "actor": "ige", "action": "create", "target": "61ca7795-e9ce-43d1-a333-2c540238163f", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:56:31.816+00');
INSERT INTO public.audit_log VALUES (149, 'AuditLog', '{"cat": "data-history", "data": {"_id": "61ca7795-e9ce-43d1-a333-2c540238163f", "_type": "AddressDoc", "title": "Allgäu, Adresse", "_state": null, "_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_created": "2021-08-26T11:56:31.808546Z", "_version": 0, "lastName": "Allgäu", "_modified": "2021-08-26T11:56:31.808546Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:56:31.818386Z", "actor": "ige", "action": "update", "target": "61ca7795-e9ce-43d1-a333-2c540238163f", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 11:56:31.818+00');
INSERT INTO public.audit_log VALUES (154, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f13adb8a-03af-493c-b6e4-39350dc8f436", "_type": "AddressDoc", "title": "Pfalz, Adresse", "_state": null, "_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_created": "2021-08-26T11:58:47.341816Z", "_version": 0, "lastName": "Pfalz", "_modified": "2021-08-26T11:58:47.341816Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:58:47.359740Z", "actor": "ige", "action": "create", "target": "f13adb8a-03af-493c-b6e4-39350dc8f436", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:58:47.359+00');
INSERT INTO public.audit_log VALUES (155, 'AuditLog', '{"cat": "data-history", "data": {"_id": "f13adb8a-03af-493c-b6e4-39350dc8f436", "_type": "AddressDoc", "title": "Pfalz, Adresse", "_state": null, "_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_created": "2021-08-26T11:58:47.341816Z", "_version": 0, "lastName": "Pfalz", "_modified": "2021-08-26T11:58:47.341816Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:58:47.361396Z", "actor": "ige", "action": "update", "target": "f13adb8a-03af-493c-b6e4-39350dc8f436", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-5', 'INFO', '2021-08-26 11:58:47.361+00');
INSERT INTO public.audit_log VALUES (166, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a09b5461-b4c7-41dc-917f-cfeb0baf0788", "_type": "AddressDoc", "title": "Okzitanien, Adresse", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T12:04:11.292767Z", "_version": 0, "lastName": "Okzitanien", "_modified": "2021-08-26T12:04:11.292767Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:04:11.300918Z", "actor": "ige", "action": "create", "target": "a09b5461-b4c7-41dc-917f-cfeb0baf0788", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 12:04:11.301+00');
INSERT INTO public.audit_log VALUES (167, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a09b5461-b4c7-41dc-917f-cfeb0baf0788", "_type": "AddressDoc", "title": "Okzitanien, Adresse", "_state": null, "_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_created": "2021-08-26T12:04:11.292767Z", "_version": 0, "lastName": "Okzitanien", "_modified": "2021-08-26T12:04:11.292767Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:04:11.302616Z", "actor": "ige", "action": "update", "target": "a09b5461-b4c7-41dc-917f-cfeb0baf0788", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 12:04:11.302+00');
INSERT INTO public.audit_log VALUES (172, 'AuditLog', '{"cat": "data-history", "data": {"_id": "b3b8f1d7-531e-407d-8ae3-55bfafa1bf46", "_type": "AddressDoc", "title": "Bourgogne, Adresse", "_state": null, "_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_created": "2021-08-26T12:06:24.491914Z", "_version": 0, "lastName": "Bourgogne", "_modified": "2021-08-26T12:06:24.491914Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:06:24.497886Z", "actor": "ige", "action": "create", "target": "b3b8f1d7-531e-407d-8ae3-55bfafa1bf46", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 12:06:24.498+00');
INSERT INTO public.audit_log VALUES (173, 'AuditLog', '{"cat": "data-history", "data": {"_id": "b3b8f1d7-531e-407d-8ae3-55bfafa1bf46", "_type": "AddressDoc", "title": "Bourgogne, Adresse", "_state": null, "_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "_created": "2021-08-26T12:06:24.491914Z", "_version": 0, "lastName": "Bourgogne", "_modified": "2021-08-26T12:06:24.491914Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:06:24.533318Z", "actor": "ige", "action": "update", "target": "b3b8f1d7-531e-407d-8ae3-55bfafa1bf46", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-7', 'INFO', '2021-08-26 12:06:24.533+00');
INSERT INTO public.audit_log VALUES (150, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de35a797-a7be-41ca-9ef3-adc7ce3d8738", "_type": "AddressDoc", "title": "Alpen, Adresse", "_state": null, "_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_created": "2021-08-26T11:56:45.008654Z", "_version": 0, "lastName": "Alpen", "_modified": "2021-08-26T11:56:45.008654Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:56:45.019985Z", "actor": "ige", "action": "create", "target": "de35a797-a7be-41ca-9ef3-adc7ce3d8738", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:56:45.02+00');
INSERT INTO public.audit_log VALUES (151, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de35a797-a7be-41ca-9ef3-adc7ce3d8738", "_type": "AddressDoc", "title": "Alpen, Adresse", "_state": null, "_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "_created": "2021-08-26T11:56:45.008654Z", "_version": 0, "lastName": "Alpen", "_modified": "2021-08-26T11:56:45.008654Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:56:45.021962Z", "actor": "ige", "action": "update", "target": "de35a797-a7be-41ca-9ef3-adc7ce3d8738", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 11:56:45.022+00');
INSERT INTO public.audit_log VALUES (152, 'AuditLog', '{"cat": "data-history", "data": {"_id": "1e97007c-92fc-410a-8665-ddaa6a65adc4", "_type": "AddressDoc", "title": "Eifel, Adresse", "_state": null, "_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "_created": "2021-08-26T11:57:51.531045Z", "_version": 0, "lastName": "Eifel", "_modified": "2021-08-26T11:57:51.531045Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:57:51.542424Z", "actor": "ige", "action": "create", "target": "1e97007c-92fc-410a-8665-ddaa6a65adc4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:57:51.542+00');
INSERT INTO public.audit_log VALUES (153, 'AuditLog', '{"cat": "data-history", "data": {"_id": "1e97007c-92fc-410a-8665-ddaa6a65adc4", "_type": "AddressDoc", "title": "Eifel, Adresse", "_state": null, "_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "_created": "2021-08-26T11:57:51.531045Z", "_version": 0, "lastName": "Eifel", "_modified": "2021-08-26T11:57:51.531045Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:57:51.545752Z", "actor": "ige", "action": "update", "target": "1e97007c-92fc-410a-8665-ddaa6a65adc4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-6', 'INFO', '2021-08-26 11:57:51.545+00');
INSERT INTO public.audit_log VALUES (156, 'AuditLog', '{"cat": "data-history", "data": {"_id": "b59aebd7-f987-4bc9-ae51-3d1b74d2be7d", "_type": "AddressDoc", "title": "Franken, Adresse", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:59:46.1496Z", "_version": 0, "lastName": "Franken", "_modified": "2021-08-26T11:59:46.1496Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:59:46.159046Z", "actor": "ige", "action": "create", "target": "b59aebd7-f987-4bc9-ae51-3d1b74d2be7d", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:59:46.159+00');
INSERT INTO public.audit_log VALUES (157, 'AuditLog', '{"cat": "data-history", "data": {"_id": "b59aebd7-f987-4bc9-ae51-3d1b74d2be7d", "_type": "AddressDoc", "title": "Franken, Adresse", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T11:59:46.1496Z", "_version": 0, "lastName": "Franken", "_modified": "2021-08-26T11:59:46.1496Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T11:59:46.160770Z", "actor": "ige", "action": "update", "target": "b59aebd7-f987-4bc9-ae51-3d1b74d2be7d", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 11:59:46.16+00');
INSERT INTO public.audit_log VALUES (158, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a5af5754-eace-439c-baa3-90bc775559fe", "_type": "AddressDoc", "title": "Vogelsberg, Adresse", "_state": null, "_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_created": "2021-08-26T12:01:48.328245Z", "_version": 0, "lastName": "Vogelsberg", "_modified": "2021-08-26T12:01:48.328245Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:01:48.334923Z", "actor": "ige", "action": "create", "target": "a5af5754-eace-439c-baa3-90bc775559fe", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:01:48.335+00');
INSERT INTO public.audit_log VALUES (159, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a5af5754-eace-439c-baa3-90bc775559fe", "_type": "AddressDoc", "title": "Vogelsberg, Adresse", "_state": null, "_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "_created": "2021-08-26T12:01:48.328245Z", "_version": 0, "lastName": "Vogelsberg", "_modified": "2021-08-26T12:01:48.328245Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:01:48.336590Z", "actor": "ige", "action": "update", "target": "a5af5754-eace-439c-baa3-90bc775559fe", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:01:48.336+00');
INSERT INTO public.audit_log VALUES (160, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a3c71705-9560-4e4b-aa54-b9c4c0d85373", "_type": "AddressDoc", "title": "Wetterau, Adresse", "_state": null, "_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "_created": "2021-08-26T12:02:02.613212Z", "_version": 0, "lastName": "Wetterau", "_modified": "2021-08-26T12:02:02.613212Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:02:02.620185Z", "actor": "ige", "action": "create", "target": "a3c71705-9560-4e4b-aa54-b9c4c0d85373", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 12:02:02.62+00');
INSERT INTO public.audit_log VALUES (161, 'AuditLog', '{"cat": "data-history", "data": {"_id": "a3c71705-9560-4e4b-aa54-b9c4c0d85373", "_type": "AddressDoc", "title": "Wetterau, Adresse", "_state": null, "_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "_created": "2021-08-26T12:02:02.613212Z", "_version": 0, "lastName": "Wetterau", "_modified": "2021-08-26T12:02:02.613212Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:02:02.621780Z", "actor": "ige", "action": "update", "target": "a3c71705-9560-4e4b-aa54-b9c4c0d85373", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 12:02:02.621+00');
INSERT INTO public.audit_log VALUES (162, 'AuditLog', '{"cat": "data-history", "data": {"_id": "31aacdb8-da3a-4d97-ace0-ef0386929380", "_type": "AddressDoc", "title": "Bretagne, Adresse", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T12:03:25.562387Z", "_version": 0, "lastName": "Bretagne", "_modified": "2021-08-26T12:03:25.562387Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:03:25.570399Z", "actor": "ige", "action": "create", "target": "31aacdb8-da3a-4d97-ace0-ef0386929380", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:03:25.57+00');
INSERT INTO public.audit_log VALUES (163, 'AuditLog', '{"cat": "data-history", "data": {"_id": "31aacdb8-da3a-4d97-ace0-ef0386929380", "_type": "AddressDoc", "title": "Bretagne, Adresse", "_state": null, "_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_created": "2021-08-26T12:03:25.562387Z", "_version": 0, "lastName": "Bretagne", "_modified": "2021-08-26T12:03:25.562387Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:03:25.572268Z", "actor": "ige", "action": "update", "target": "31aacdb8-da3a-4d97-ace0-ef0386929380", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:03:25.572+00');
INSERT INTO public.audit_log VALUES (164, 'AuditLog', '{"cat": "data-history", "data": {"_id": "03e25bce-299d-4c75-8b75-8155aaed2eb9", "_type": "AddressDoc", "title": "Normandie, Adresse", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T12:03:46.776835Z", "_version": 0, "lastName": "Normandie", "_modified": "2021-08-26T12:03:46.776835Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:03:46.783062Z", "actor": "ige", "action": "create", "target": "03e25bce-299d-4c75-8b75-8155aaed2eb9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 12:03:46.783+00');
INSERT INTO public.audit_log VALUES (165, 'AuditLog', '{"cat": "data-history", "data": {"_id": "03e25bce-299d-4c75-8b75-8155aaed2eb9", "_type": "AddressDoc", "title": "Normandie, Adresse", "_state": null, "_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_created": "2021-08-26T12:03:46.776835Z", "_version": 0, "lastName": "Normandie", "_modified": "2021-08-26T12:03:46.776835Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:03:46.784796Z", "actor": "ige", "action": "update", "target": "03e25bce-299d-4c75-8b75-8155aaed2eb9", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-2', 'INFO', '2021-08-26 12:03:46.784+00');
INSERT INTO public.audit_log VALUES (168, 'AuditLog', '{"cat": "data-history", "data": {"_id": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "_type": "AddressDoc", "title": "Elsass, Adresse", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T12:05:08.437944Z", "_version": 0, "lastName": "Elsass", "_modified": "2021-08-26T12:05:08.437944Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:05:08.444957Z", "actor": "ige", "action": "create", "target": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 12:05:08.445+00');
INSERT INTO public.audit_log VALUES (169, 'AuditLog', '{"cat": "data-history", "data": {"_id": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "_type": "AddressDoc", "title": "Elsass, Adresse", "_state": null, "_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_created": "2021-08-26T12:05:08.437944Z", "_version": 0, "lastName": "Elsass", "_modified": "2021-08-26T12:05:08.437944Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:05:08.446695Z", "actor": "ige", "action": "update", "target": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-3', 'INFO', '2021-08-26 12:05:08.446+00');
INSERT INTO public.audit_log VALUES (170, 'AuditLog', '{"cat": "data-history", "data": {"_id": "4e9ae410-488b-4b48-b7e9-2d1b355f6339", "_type": "AddressDoc", "title": "Lothringen, Adresse", "_state": null, "_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_created": "2021-08-26T12:05:34.391311Z", "_version": 0, "lastName": "Lothringen", "_modified": "2021-08-26T12:05:34.391311Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:05:34.399306Z", "actor": "ige", "action": "create", "target": "4e9ae410-488b-4b48-b7e9-2d1b355f6339", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 12:05:34.399+00');
INSERT INTO public.audit_log VALUES (171, 'AuditLog', '{"cat": "data-history", "data": {"_id": "4e9ae410-488b-4b48-b7e9-2d1b355f6339", "_type": "AddressDoc", "title": "Lothringen, Adresse", "_state": null, "_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "_created": "2021-08-26T12:05:34.391311Z", "_version": 0, "lastName": "Lothringen", "_modified": "2021-08-26T12:05:34.391311Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:05:34.401697Z", "actor": "ige", "action": "update", "target": "4e9ae410-488b-4b48-b7e9-2d1b355f6339", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-9', 'INFO', '2021-08-26 12:05:34.401+00');
INSERT INTO public.audit_log VALUES (174, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de607d5b-5e1f-4240-bcd4-b43c039ebb37", "_type": "AddressDoc", "title": "Limousin, Adresse", "_state": null, "_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "_created": "2021-08-26T12:07:15.810236Z", "_version": 0, "lastName": "Limousin", "_modified": "2021-08-26T12:07:15.810236Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:07:15.817305Z", "actor": "ige", "action": "create", "target": "de607d5b-5e1f-4240-bcd4-b43c039ebb37", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 12:07:15.817+00');
INSERT INTO public.audit_log VALUES (175, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de607d5b-5e1f-4240-bcd4-b43c039ebb37", "_type": "AddressDoc", "title": "Limousin, Adresse", "_state": null, "_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "_created": "2021-08-26T12:07:15.810236Z", "_version": 0, "lastName": "Limousin", "_modified": "2021-08-26T12:07:15.810236Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:07:15.818964Z", "actor": "ige", "action": "update", "target": "de607d5b-5e1f-4240-bcd4-b43c039ebb37", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-1', 'INFO', '2021-08-26 12:07:15.819+00');
INSERT INTO public.audit_log VALUES (176, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de3c7849-b787-4f92-8d94-3975fa73405e", "_type": "AddressDoc", "title": "Auvergne, Adresse", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T12:08:25.948403Z", "_version": 0, "lastName": "Auvergne", "_modified": "2021-08-26T12:08:25.948403Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:08:25.954615Z", "actor": "ige", "action": "create", "target": "de3c7849-b787-4f92-8d94-3975fa73405e", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:08:25.954+00');
INSERT INTO public.audit_log VALUES (177, 'AuditLog', '{"cat": "data-history", "data": {"_id": "de3c7849-b787-4f92-8d94-3975fa73405e", "_type": "AddressDoc", "title": "Auvergne, Adresse", "_state": null, "_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_created": "2021-08-26T12:08:25.948403Z", "_version": 0, "lastName": "Auvergne", "_modified": "2021-08-26T12:08:25.948403Z", "firstName": "Adresse", "_hasChildren": false, "organization": "", "hasWritePermission": true}, "time": "2021-08-26T12:08:25.956522Z", "actor": "ige", "action": "update", "target": "de3c7849-b787-4f92-8d94-3975fa73405e", "record_type": "AuditLog"}', 'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '48', 'audit.data-history', 'http-nio-80-exec-8', 'INFO', '2021-08-26 12:08:25.956+00');


--
-- Data for Name: behaviour; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: catalog; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.catalog VALUES (1, 'test', 'mcloud', 'Test', '', '2021-06-14 10:17:06.102942+00', '2021-06-14 10:17:06.102942+00', NULL);
INSERT INTO public.catalog VALUES (2, 'new_catalog', 'mcloud', 'new Catalog', NULL, '2021-07-05 11:58:30.678883+00', '2021-07-05 11:58:30.678883+00', '{"lastLogSummary": null, "indexCronPattern": null}');


--
-- Data for Name: catalog_user_info; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.catalog_user_info VALUES (1, 1);
INSERT INTO public.catalog_user_info VALUES (1, 2);
INSERT INTO public.catalog_user_info VALUES (2, 1);
INSERT INTO public.catalog_user_info VALUES (1, 3);
INSERT INTO public.catalog_user_info VALUES (1, 4);
INSERT INTO public.catalog_user_info VALUES (1, 6);
INSERT INTO public.catalog_user_info VALUES (1, 10);
INSERT INTO public.catalog_user_info VALUES (1, 9);
INSERT INTO public.catalog_user_info VALUES (1, 12);
INSERT INTO public.catalog_user_info VALUES (1, 13);
INSERT INTO public.catalog_user_info VALUES (1, 14);
INSERT INTO public.catalog_user_info VALUES (1, 15);
INSERT INTO public.catalog_user_info VALUES (1, 16);
INSERT INTO public.catalog_user_info VALUES (1, 17);


--
-- Data for Name: codelist; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.codelist VALUES (1, '20000', 1, 'mCLOUD Kategorien', 'Dies sind die Kategorien, die innerhalb von mCLOUD verwendet werden', '[{"id": "railway", "localisations": {"de": "Bahn"}}, {"id": "waters", "localisations": {"de": "Wasserstraßen und Gewässer"}}, {"id": "infrastructure", "localisations": {"de": "Infrastruktur"}}, {"id": "climate", "localisations": {"de": "Klima und Wetter"}}, {"id": "aviation", "localisations": {"de": "Luft- und Raumfahrt"}}, {"id": "roads", "localisations": {"de": "Straßen"}}]', NULL);
INSERT INTO public.codelist VALUES (2, '20001', 1, 'OpenData Kategorien', 'Dies sind die Kategorien, die im OpenData Kontext verwendet werden', '[{"id": "SOCI", "localisations": {"de": "Bevölkerung und Gesellschaft"}}, {"id": "EDUC", "localisations": {"de": "Bildung, Kultur und Sport"}}, {"id": "ENER", "localisations": {"de": "Energie"}}, {"id": "HEAL", "localisations": {"de": "Gesundheit"}}, {"id": "INTR", "localisations": {"de": "Internationale Themen"}}, {"id": "JUST", "localisations": {"de": "Justiz, Rechtssystem und öffentliche Sicherheit"}}, {"id": "AGRI", "localisations": {"de": "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel"}}, {"id": "GOVE", "localisations": {"de": "Regierung und öffentlicher Sektor"}}, {"id": "REGI", "localisations": {"de": "Regionen und Städte"}}, {"id": "ENVI", "localisations": {"de": "Umwelt"}}, {"id": "TRAN", "localisations": {"de": "Verkehr"}}, {"id": "ECON", "localisations": {"de": "Wirtschaft und Finanzen"}}, {"id": "TECH", "localisations": {"de": "Wissenschaft und Technologie"}}]', NULL);
INSERT INTO public.codelist VALUES (3, '20000', 2, 'mCLOUD Kategorien', 'Dies sind die Kategorien, die innerhalb von mCLOUD verwendet werden', '[{"id": "railway", "localisations": {"de": "Bahn"}}, {"id": "waters", "localisations": {"de": "Wasserstraßen und Gewässer"}}, {"id": "infrastructure", "localisations": {"de": "Infrastruktur"}}, {"id": "climate", "localisations": {"de": "Klima und Wetter"}}, {"id": "aviation", "localisations": {"de": "Luft- und Raumfahrt"}}, {"id": "roads", "localisations": {"de": "Straßen"}}]', NULL);
INSERT INTO public.codelist VALUES (4, '20001', 2, 'OpenData Kategorien', 'Dies sind die Kategorien, die im OpenData Kontext verwendet werden', '[{"id": "SOCI", "localisations": {"de": "Bevölkerung und Gesellschaft"}}, {"id": "EDUC", "localisations": {"de": "Bildung, Kultur und Sport"}}, {"id": "ENER", "localisations": {"de": "Energie"}}, {"id": "HEAL", "localisations": {"de": "Gesundheit"}}, {"id": "INTR", "localisations": {"de": "Internationale Themen"}}, {"id": "JUST", "localisations": {"de": "Justiz, Rechtssystem und öffentliche Sicherheit"}}, {"id": "AGRI", "localisations": {"de": "Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel"}}, {"id": "GOVE", "localisations": {"de": "Regierung und öffentlicher Sektor"}}, {"id": "REGI", "localisations": {"de": "Regionen und Städte"}}, {"id": "ENVI", "localisations": {"de": "Umwelt"}}, {"id": "TRAN", "localisations": {"de": "Verkehr"}}, {"id": "ECON", "localisations": {"de": "Wirtschaft und Finanzen"}}, {"id": "TECH", "localisations": {"de": "Wissenschaft und Technologie"}}]', NULL);


--
-- Data for Name: document; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.document VALUES (1, 1, 'a0df9837-512a-4594-b2ef-2814f7c55c81', 'FOLDER', 'Neue Testdokumente', '{"_parent": null, "_hasChildren": false}', 0, '2020-11-05 11:05:56.497244+00', '2020-11-05 11:05:56.497244+00');
INSERT INTO public.document VALUES (2, 1, 'bdde3ecb-3629-489c-86df-12ffac978ef5', 'FOLDER', 'Testdokumente', '{"_parent": null, "_hasChildren": false}', 0, '2020-11-05 11:06:12.515366+00', '2020-11-05 11:06:12.515366+00');
INSERT INTO public.document VALUES (3, 1, 'b6a59b55-117f-4fd3-96e8-bf78de797b8f', 'FOLDER', 'Ordner 2. Ebene', '{"_parent": "bdde3ecb-3629-489c-86df-12ffac978ef5", "_hasChildren": false}', 0, '2020-11-05 11:06:27.772886+00', '2020-11-05 11:06:27.772886+00');
INSERT INTO public.document VALUES (4, 1, '9b264daf-3044-441d-864c-699b44c46dc1', 'mCloudDoc', 'Tiefes Dokument', '{"usage": null, "events": [], "origin": null, "_parent": "5aa38091-5822-4246-bc18-1ccdd838d67d", "license": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "description": null, "periodicity": null, "_hasChildren": false, "mfundProject": null, "mCloudCategories": [], "geoReferenceVisual": null, "openDataCategories": []}', 1, '2020-11-05 11:06:46.000251+00', '2020-11-05 11:06:52.021571+00');
INSERT INTO public.document VALUES (5, 1, 'e612e65b-7771-46eb-83ee-0118ba7a8b68', 'mCloudDoc', 'Leeres mCloud Test Objekt', '{"_parent": "bdde3ecb-3629-489c-86df-12ffac978ef5", "_hasChildren": false}', 0, '2020-11-05 11:07:26.084392+00', '2020-11-05 11:07:26.084392+00');
INSERT INTO public.document VALUES (7, 1, '7e9687e8-43f4-4b95-bdcb-27647197a8cb', 'TestDoc', 'Feature-Übersicht', '{"map": null, "text": null, "table": null, "usage": null, "events": [], "origin": null, "select": null, "_parent": "bdde3ecb-3629-489c-86df-12ffac978ef5", "license": null, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "_hasChildren": false, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": null, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 1, '2020-11-05 11:09:14.000211+00', '2020-11-05 11:09:23.689107+00');
INSERT INTO public.document VALUES (6, 1, '83c9b73c-5dcc-4c9f-8f2e-b0c74cfe267e', 'mCloudDoc', 'Test mCLOUD Dokument', '{"map": null, "text": null, "table": null, "usage": null, "events": [], "origin": null, "select": null, "_parent": "bdde3ecb-3629-489c-86df-12ffac978ef5", "license": null, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "_hasChildren": false, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": null, "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 1, '2020-11-05 11:07:40.00053+00', '2020-11-05 11:09:33.884021+00');
INSERT INTO public.document VALUES (8, 1, '5cd9519c-0388-494d-9091-7dd7a9795b84', 'FOLDER', 'Testadressen', '{"_parent": null, "_hasChildren": false}', 0, '2020-11-05 11:10:03.670797+00', '2020-11-05 11:10:03.670797+00');
INSERT INTO public.document VALUES (9, 1, '4ff589e1-d83c-4856-8bae-2ae783f69da6', 'FOLDER', 'Neue Testadressen', '{"_parent": null, "_hasChildren": false}', 0, '2020-11-05 11:10:15.357097+00', '2020-11-05 11:10:15.357097+00');
INSERT INTO public.document VALUES (10, 1, '57c913ed-bf0e-4d28-a8a0-895ada68a69a', 'FOLDER', 'Ordner 2. Ebene', '{"_parent": "c496c335-33dc-4470-8d5a-0866962e2f79", "_hasChildren": false}', 0, '2020-11-05 11:10:26.495632+00', '2020-11-05 11:10:26.495632+00');
INSERT INTO public.document VALUES (11, 1, '93ac91fc-4112-4975-86cb-48295a4d3915', 'AddressDoc', 'Tiefe Adresse', '{"_parent": "d7f34e1d-ccfb-4902-bd33-77c2dab29680", "address": {"PO": null, "plz": null, "city": null, "po-box": null, "street": null, "country": null, "administrativeArea": null}, "company": null, "contact": [], "lastName": "tiefe", "firstName": "adresse", "department": null, "salutation": null, "_hasChildren": false, "organization": "eine", "academic-title": null}', 2, '2020-11-05 11:10:51.000944+00', '2020-11-05 11:11:35.41128+00');
INSERT INTO public.document VALUES (12, 1, 'b9839399-05fa-4ec1-ab04-6969930f6390', 'AddressDoc', 'Testorganisation', '{"_parent": "964d7948-d03d-40d1-b5d3-dda8b35e3bfd", "company": null, "lastName": "", "firstName": "", "_hasChildren": false, "organization": "Testorganisation"}', 0, '2020-11-05 11:12:00.649829+00', '2020-11-05 11:12:00.649829+00');
INSERT INTO public.document VALUES (13, 1, '6e302935-55f3-4cfa-8b97-65f248840bd2', 'AddressDoc', 'ggg', '{"_state": "W", "_parent": null, "company": null, "lastName": "", "firstName": "", "_hasChildren": false, "organization": "ggg"}', 1, '2020-11-05 11:12:11.000471+00', '2020-11-05 11:13:03.010186+00');
INSERT INTO public.document VALUES (14, 1, '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10', 'AddressDoc', 'Published Testorganization', '{"_parent": null, "address": {"PO": null, "plz": null, "city": null, "po-box": null, "street": null, "country": null, "administrativeArea": null}, "company": null, "contact": [{"type": "1", "connection": "03351464321653"}], "lastName": "", "firstName": "", "department": null, "_hasChildren": false, "organization": "Published Testorganization"}', 2, '2020-11-05 11:12:57.000248+00', '2020-11-05 11:13:19.075264+00');
INSERT INTO public.document VALUES (15, 1, 'b495dd40-a006-4eb6-9c22-384f40fb6844', 'FOLDER', 'Drag''n''Drop', '{"_parent": null, "_hasChildren": false}', 0, '2020-11-13 09:44:20.531042+00', '2020-11-13 09:44:20.531042+00');
INSERT INTO public.document VALUES (16, 1, '60556f51-3420-48b6-ad1a-29fe2824444c', 'FOLDER', 'testordner_1', '{"_parent": null, "_hasChildren": false}', 0, '2021-06-30 15:32:05.569954+00', '2021-06-30 15:32:05.569954+00');
INSERT INTO public.document VALUES (19, 1, '2198f38c-7999-466d-ac67-efc1450a95a1', 'AddressDoc', 'test_x, test_x', '{"_parent": null, "lastName": "test_x", "firstName": "test_x", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:47:07.0255+00', '2021-06-30 15:47:07.0255+00');
INSERT INTO public.document VALUES (20, 1, '98615f8c-c9df-4830-838a-c326af585a66', 'AddressDoc', 'test_y, test_y', '{"_parent": null, "lastName": "test_y", "firstName": "test_y", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:48:09.409828+00', '2021-06-30 15:48:09.409828+00');
INSERT INTO public.document VALUES (21, 1, 'f4edbc48-9939-4a19-98ae-f9f76bbb213f', 'AddressDoc', 'test_z, test_z', '{"_parent": null, "lastName": "test_z", "firstName": "test_z", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:48:23.7701+00', '2021-06-30 15:48:23.7701+00');
INSERT INTO public.document VALUES (22, 1, 'd7fe4fef-2588-458f-ba35-4673adbdbdf4', 'AddressDoc', 'test_ö, test_ö', '{"_parent": null, "lastName": "test_ö", "firstName": "test_ö", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:48:38.02037+00', '2021-06-30 15:48:38.02037+00');
INSERT INTO public.document VALUES (23, 1, '92dc82d5-1a41-42e4-9600-3d09116718bd', 'AddressDoc', 'test_c, test_c', '{"_parent": null, "lastName": "test_c", "firstName": "test_c", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:48:49.15322+00', '2021-06-30 15:48:49.15322+00');
INSERT INTO public.document VALUES (24, 1, '8467f4e3-90d4-45e6-bd0c-fa97cb669435', 'AddressDoc', 'test_j, test_j', '{"_parent": null, "lastName": "test_j", "firstName": "test_j", "_hasChildren": false, "organization": ""}', 0, '2021-06-30 15:49:02.194981+00', '2021-06-30 15:49:02.194981+00');
INSERT INTO public.document VALUES (18, 1, '2ab150a3-d846-48a0-8aac-3b98d31e9c17', 'mCloudDoc', 'published with working', '{"usage": null, "events": [], "origin": null, "_parent": null, "license": "Andere Freeware Lizenz", "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "link-type", "title": null, "format": null}], "description": "test draft", "periodicity": null, "mfundProject": null, "mCloudCategories": ["railway"], "geoReferenceVisual": null, "openDataCategories": ["SOCI"]}', 2, '2021-06-30 15:42:52.147381+00', '2021-06-30 15:50:37.673874+00');
INSERT INTO public.document VALUES (25, 1, '2ab150a3-d846-48a0-8aac-3b98d31e9c17', 'mCloudDoc', 'Veröffentlichter Datensatz mit Bearbeitungsversion', '{"usage": null, "events": [], "origin": null, "_parent": null, "license": "Andere Freeware Lizenz", "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "link-type", "title": null, "format": null}], "description": "test - edited ", "periodicity": null, "mfundProject": null, "mCloudCategories": ["railway"], "geoReferenceVisual": null, "openDataCategories": ["SOCI"]}', 4, '2021-06-30 15:51:11.32981+00', '2021-06-30 15:52:16.033093+00');
INSERT INTO public.document VALUES (26, 1, '2294e4f3-821e-4ecd-b6c5-e8fc305275df', 'TestDoc', 'TestDocResearch', '{"map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "table": null, "select": null, "_parent": null, "checkbox": null, "addresses": null, "multiChips": [], "description": null, "multiInputs": [], "optionalText": null, "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 1, '2021-07-22 14:07:48.121799+00', '2021-07-22 14:08:21.892949+00');
INSERT INTO public.document VALUES (27, 1, '98b74a0e-0473-4a73-b0ff-c7764c8a25db', 'mCloudDoc', 'TestDocResearch1', '{"map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "table": null, "usage": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "München, Bayern, Deutschland", "value": {"lat1": 48.06156094250097, "lat2": 48.247997336790256, "lon1": 11.361236572265625, "lon2": 11.723098754882814}}], "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 1, '2021-07-22 14:08:44.143796+00', '2021-07-22 14:09:07.496197+00');
INSERT INTO public.document VALUES (29, 1, 'd94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3', 'mCloudDoc', 'TestDocResearch2', '{"map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "table": null, "usage": null, "events": [], "origin": null, "select": null, "_parent": null, "license": null, "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "multiChips": [], "description": null, "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": [], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Stuttgart, Baden-Württemberg, Deutschland", "value": {"lat1": 48.691866919887374, "lat2": 48.866521538507754, "lon1": 9.03831481933594, "lon2": 9.31571960449219}}], "openDataCategories": [], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 2, '2021-07-22 14:09:53.083124+00', '2021-07-22 14:10:26.387903+00');
INSERT INTO public.document VALUES (28, 1, 'ecc13939-8110-484b-86f2-1a203e35b8c2', 'mCloudDoc', 'TestDocResearch3', '{"map": [{"type": "free", "title": "Deutschland", "value": {"lat1": 47.279229002570844, "lat2": 55.10351605801967, "lon1": 5.866699218750001, "lon2": 15.051269531250002}}], "text": "Test Doc for testing Research Page", "table": null, "usage": null, "events": [], "origin": null, "select": null, "_parent": null, "license": "Andere Freeware Lizenz", "checkbox": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "typ"}], "multiChips": [], "description": "ederds", "multiInputs": [], "periodicity": null, "mfundProject": null, "optionalText": null, "mCloudCategories": ["roads"], "multiChipsSimple": [], "repeatListSimple": [], "repeatListStatic": [], "geoReferenceVisual": [{"type": "free", "title": "Mainz, Rheinland-Pfalz, Deutschland", "value": {"lat1": 49.89551905518783, "lat2": 50.03509159032692, "lon1": 8.14292907714844, "lon2": 8.342056274414064}}], "openDataCategories": ["ENVI"], "repeatListCodelist": [], "repeatDetailListLink": [], "repeatDetailListImage": [], "repeatListStaticSelect": []}', 3, '2021-07-22 14:09:18.578417+00', '2021-07-22 14:16:57.168627+00');
INSERT INTO public.document VALUES (30, 1, 'e5bc272c-142b-4ad6-8278-093e3de74b7c', 'mCloudDoc', 'TestDocResearch4', '{"usage": null, "events": [], "origin": null, "_parent": null, "license": "Andere Freeware Lizenz", "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": [{"ref": "214ca5bf-da1b-4003-b7b6-e73a2ef0ec10", "type": "10"}], "downloads": [{"link": {"value": "link.link", "asLink": true}, "type": "link Typ", "title": "", "format": ""}], "description": "test for research page", "periodicity": null, "mfundProject": null, "mCloudCategories": ["climate"], "geoReferenceVisual": [{"type": "free", "title": "Freiburg im Breisgau, Baden-Württemberg, Deutschland", "value": {"lat1": 47.90345483298757, "lat2": 48.07119708739186, "lon1": 7.662277221679688, "lon2": 7.930755615234376}}], "openDataCategories": ["SOCI"]}', 7, '2021-07-22 14:10:43.617803+00', '2021-07-22 14:25:24.938082+00');
INSERT INTO public.document VALUES (31, 1, '8bb38364-378e-434c-a92f-1bd32156c3da', 'FOLDER', 'Ordner_Ebene_2A', '{"_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_hasChildren": false}', 0, '2021-08-26 10:52:12.902302+00', '2021-08-26 10:52:12.902302+00');
INSERT INTO public.document VALUES (34, 1, '9cc60568-d529-4538-8ebc-664274e5ce81', 'FOLDER', 'Ordner_Ebene_2B', '{"_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_hasChildren": false}', 0, '2021-08-26 10:53:33.302538+00', '2021-08-26 10:53:33.302538+00');
INSERT INTO public.document VALUES (35, 1, 'a735083e-14f5-42d1-9f88-72aba5e5f171', 'FOLDER', 'Ordner_Ebene_2C', '{"_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_hasChildren": false}', 0, '2021-08-26 10:53:49.611439+00', '2021-08-26 10:53:49.611439+00');
INSERT INTO public.document VALUES (36, 1, 'f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0', 'FOLDER', 'Ordner_Ebene_3A', '{"_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_hasChildren": false}', 0, '2021-08-26 10:54:36.730215+00', '2021-08-26 10:54:36.730215+00');
INSERT INTO public.document VALUES (37, 1, 'e9fe4337-9f71-4225-861f-93260743a9d6', 'FOLDER', 'Ordner_Ebene_3B', '{"_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "_hasChildren": false}', 0, '2021-08-26 10:55:13.827409+00', '2021-08-26 10:55:13.827409+00');
INSERT INTO public.document VALUES (38, 1, '28a7812e-dadf-41e8-bbf7-8a4caef60361', 'FOLDER', 'Ordner_Ebene_3C', '{"_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_hasChildren": false}', 0, '2021-08-26 10:55:42.037937+00', '2021-08-26 10:55:42.037937+00');
INSERT INTO public.document VALUES (39, 1, '61fd6be2-9cb3-461b-93f0-41212d637c41', 'FOLDER', 'Ordner_Ebene_3D', '{"_parent": "a735083e-14f5-42d1-9f88-72aba5e5f171", "_hasChildren": false}', 0, '2021-08-26 10:55:59.390087+00', '2021-08-26 10:55:59.390087+00');
INSERT INTO public.document VALUES (40, 1, '175fd9c0-20cf-4edf-a490-1efdb104d96a', 'mCloudDoc', 'Datum_Ebene_3_1', '{"_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_hasChildren": false}', 0, '2021-08-26 10:56:29.767677+00', '2021-08-26 10:56:29.767677+00');
INSERT INTO public.document VALUES (41, 1, 'a4827541-26c7-4703-b94c-3393e742c9df', 'mCloudDoc', 'Datum_Ebene_3_2', '{"_parent": "9cc60568-d529-4538-8ebc-664274e5ce81", "_hasChildren": false}', 0, '2021-08-26 10:56:54.997235+00', '2021-08-26 10:56:54.997235+00');
INSERT INTO public.document VALUES (42, 1, 'f497af26-3571-4dfc-8505-d8d3d4899379', 'mCloudDoc', 'Datum_Ebene_4_1', '{"_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_hasChildren": false}', 0, '2021-08-26 10:57:28.608842+00', '2021-08-26 10:57:28.608842+00');
INSERT INTO public.document VALUES (43, 1, '58977711-f24a-471f-afc8-1179a7e2c703', 'mCloudDoc', 'Datum_Ebene_4_2', '{"_parent": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "_hasChildren": false}', 0, '2021-08-26 10:57:41.240765+00', '2021-08-26 10:57:41.240765+00');
INSERT INTO public.document VALUES (44, 1, '59bc4522-9456-44fe-8ab4-e98fe713b9c2', 'mCloudDoc', 'Datum_Ebene_4_3', '{"_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_hasChildren": false}', 0, '2021-08-26 10:58:25.277975+00', '2021-08-26 10:58:25.277975+00');
INSERT INTO public.document VALUES (45, 1, 'bc4e0d68-3023-444c-9e31-df858baceeef', 'mCloudDoc', 'Datum_Ebene_4_4', '{"_parent": "e9fe4337-9f71-4225-861f-93260743a9d6", "_hasChildren": false}', 0, '2021-08-26 10:58:44.887837+00', '2021-08-26 10:58:44.887837+00');
INSERT INTO public.document VALUES (46, 1, 'f3219242-018e-4f1b-b350-5970a9686176', 'mCloudDoc', 'Datum_Ebene_4_5', '{"_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_hasChildren": false}', 0, '2021-08-26 11:00:22.376102+00', '2021-08-26 11:00:22.376102+00');
INSERT INTO public.document VALUES (49, 1, 'bb9c0963-c6ec-4dd5-9f3f-33976556d1c9', 'mCloudDoc', 'Datum_Ebene_4_8', '{"_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_hasChildren": false}', 0, '2021-08-26 11:01:44.964146+00', '2021-08-26 11:01:44.964146+00');
INSERT INTO public.document VALUES (50, 1, 'f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c', 'mCloudDoc', 'Datum_Ebene_2_1', '{"_parent": "a0df9837-512a-4594-b2ef-2814f7c55c81", "_hasChildren": false}', 0, '2021-08-26 11:03:32.681918+00', '2021-08-26 11:03:32.681918+00');
INSERT INTO public.document VALUES (47, 1, '79ebf92f-67e3-4de7-958a-37e12aea9f39', 'mCloudDoc', 'Datum_Ebene_4_6', '{"_parent": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "_hasChildren": false}', 0, '2021-08-26 11:00:44.154685+00', '2021-08-26 11:00:44.154685+00');
INSERT INTO public.document VALUES (48, 1, 'c16af9ea-ab87-4d31-b86f-60ad96e4e9cb', 'mCloudDoc', 'Datum_Ebene_4_7', '{"_parent": "61fd6be2-9cb3-461b-93f0-41212d637c41", "_hasChildren": false}', 0, '2021-08-26 11:01:30.837085+00', '2021-08-26 11:01:30.837085+00');
INSERT INTO public.document VALUES (51, 1, 'c8da3ada-dab7-46c1-9147-248bb3a7d7df', 'mCloudDoc', 'Datum_Ebene_3_3', '{"usage": null, "events": [], "origin": null, "_parent": "8bb38364-378e-434c-a92f-1bd32156c3da", "license": null, "mfundFKZ": null, "timeSpan": {"rangeType": null, "timeSpanDate": null}, "addresses": null, "downloads": null, "description": null, "periodicity": null, "mfundProject": null, "mCloudCategories": [], "geoReferenceVisual": null, "openDataCategories": []}', 1, '2021-08-26 11:05:52.132856+00', '2021-08-26 11:06:37.234478+00');
INSERT INTO public.document VALUES (52, 1, '70b789f7-5caf-4197-9a78-9883395f0035', 'mCloudDoc', 'catalogue_admin_only_doc', '{"_parent": null, "_hasChildren": false}', 0, '2021-08-26 11:10:20.646916+00', '2021-08-26 11:10:20.646916+00');
INSERT INTO public.document VALUES (53, 1, '7bbe60f5-67db-4623-b245-1fbc091b9b76', 'FOLDER', 'Ordner_2.Ebene_B', '{"_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_hasChildren": false}', 0, '2021-08-26 11:16:33.21335+00', '2021-08-26 11:16:33.21335+00');
INSERT INTO public.document VALUES (54, 1, '376c9824-20a0-433c-af3e-e196ea04a077', 'FOLDER', 'Ordner_3.Ebene_A', '{"_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_hasChildren": false}', 0, '2021-08-26 11:16:52.616317+00', '2021-08-26 11:16:52.616317+00');
INSERT INTO public.document VALUES (56, 1, 'c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187', 'FOLDER', 'Ordner_3.Ebene_B', '{"_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "_hasChildren": false}', 0, '2021-08-26 11:17:54.77336+00', '2021-08-26 11:17:54.77336+00');
INSERT INTO public.document VALUES (57, 1, 'ab30a1dd-f0ec-4949-aa4e-10dbb99d509c', 'FOLDER', 'Ordner_3.Ebene_C', '{"_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_hasChildren": false}', 0, '2021-08-26 11:18:12.13876+00', '2021-08-26 11:18:12.13876+00');
INSERT INTO public.document VALUES (58, 1, 'f78e8095-88fe-4af4-bb57-abeb96b28e46', 'FOLDER', 'Ordner_3.Ebene_D', '{"_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "_hasChildren": false}', 0, '2021-08-26 11:18:23.338313+00', '2021-08-26 11:18:23.338313+00');
INSERT INTO public.document VALUES (59, 1, '2a03ccf3-1a99-498f-9a5c-29a84606f87c', 'FOLDER', 'Ordner_2.Ebene_C', '{"_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "_hasChildren": false}', 0, '2021-08-26 11:18:46.282316+00', '2021-08-26 11:18:46.282316+00');
INSERT INTO public.document VALUES (60, 1, 'd6371165-1be0-4a7c-b635-fd6952cad479', 'FOLDER', 'Ordner_3.Ebene_E', '{"_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_hasChildren": false}', 0, '2021-08-26 11:19:20.06179+00', '2021-08-26 11:19:20.06179+00');
INSERT INTO public.document VALUES (61, 1, '06cf2641-5931-406b-b7b3-aa8d1090aa82', 'FOLDER', 'Ordner_3.Ebene_F', '{"_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "_hasChildren": false}', 0, '2021-08-26 11:19:36.076162+00', '2021-08-26 11:19:36.076162+00');
INSERT INTO public.document VALUES (62, 1, '6237be21-04f8-4d40-bf87-a266543732ea', 'FOLDER', 'Ordner_4.Ebene_A', '{"_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_hasChildren": false}', 0, '2021-08-26 11:19:58.050663+00', '2021-08-26 11:19:58.050663+00');
INSERT INTO public.document VALUES (63, 1, 'cb549c15-21a7-43f4-96c5-b4e5f4a15885', 'FOLDER', 'Ordner_4.Ebene_B', '{"_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "_hasChildren": false}', 0, '2021-08-26 11:20:13.498075+00', '2021-08-26 11:20:13.498075+00');
INSERT INTO public.document VALUES (64, 1, '33f935ae-f177-4fc6-bb80-daf6a81dddf6', 'FOLDER', 'Ordner_4.Ebene_C', '{"_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_hasChildren": false}', 0, '2021-08-26 11:20:34.616365+00', '2021-08-26 11:20:34.616365+00');
INSERT INTO public.document VALUES (65, 1, '61f389f8-d198-445c-be89-c0e5128520f0', 'FOLDER', 'Ordner_4.Ebene_D', '{"_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "_hasChildren": false}', 0, '2021-08-26 11:20:50.432347+00', '2021-08-26 11:20:50.432347+00');
INSERT INTO public.document VALUES (66, 1, '556c875e-d471-4a35-8203-0c750737d296', 'AddressDoc', 'Taunus, Adresse', '{"_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "lastName": "Taunus", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:21:34.32136+00', '2021-08-26 11:21:34.32136+00');
INSERT INTO public.document VALUES (67, 1, 'eb792c63-0238-4207-a34a-46e0def02656', 'AddressDoc', 'Rhön, Adresse', '{"_parent": "d6371165-1be0-4a7c-b635-fd6952cad479", "lastName": "Rhön", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:21:46.783323+00', '2021-08-26 11:21:46.783323+00');
INSERT INTO public.document VALUES (68, 1, '08f38f6c-db28-4357-a361-4104804d53c9', 'AddressDoc', 'Odenwald, Adresse', '{"_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "lastName": "Odenwald", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:22:05.17921+00', '2021-08-26 11:22:05.17921+00');
INSERT INTO public.document VALUES (69, 1, 'd7c933b4-083c-473b-bcf7-9979fddd5b4d', 'AddressDoc', 'Schwarzwald, Adresse', '{"_parent": "06cf2641-5931-406b-b7b3-aa8d1090aa82", "lastName": "Schwarzwald", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:22:17.10488+00', '2021-08-26 11:22:17.10488+00');
INSERT INTO public.document VALUES (70, 1, 'd6d4d774-c17c-4ebd-a494-2b73d598cb50', 'AddressDoc', 'Harz, Adresse', '{"_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "lastName": "Harz", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:49:34.509443+00', '2021-08-26 11:49:34.509443+00');
INSERT INTO public.document VALUES (71, 1, 'bf93c9db-aea1-4851-8074-9f5badef7e6a', 'AddressDoc', 'Hunsrück, Adresse', '{"_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "lastName": "Hunsrück", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:50:02.406441+00', '2021-08-26 11:50:02.406441+00');
INSERT INTO public.document VALUES (72, 1, '3e3c3e48-e6e3-47de-a35b-e298a2a53e83', 'AddressDoc', 'Picardie, Adresse', '{"_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "lastName": "Picardie", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:50:31.223721+00', '2021-08-26 11:50:31.223721+00');
INSERT INTO public.document VALUES (73, 1, '05b2e466-b55f-4d16-a10b-358b447eeb50', 'AddressDoc', 'Provence, Adresse', '{"_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "lastName": "Provence", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:50:49.988784+00', '2021-08-26 11:50:49.988784+00');
INSERT INTO public.document VALUES (74, 1, '93374b77-5cc4-404f-be1f-a478458a617c', 'AddressDoc', 'Aquitanien, Adresse', '{"_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "lastName": "Aquitanien", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:51:33.333215+00', '2021-08-26 11:51:33.333215+00');
INSERT INTO public.document VALUES (75, 1, '1db03de3-510f-4149-adf0-3973a515a954', 'AddressDoc', 'Vendee, Adresse', '{"_parent": "376c9824-20a0-433c-af3e-e196ea04a077", "lastName": "Vendee", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:51:59.024539+00', '2021-08-26 11:51:59.024539+00');
INSERT INTO public.document VALUES (76, 1, 'e629f81d-f9fc-4a97-b224-e00df74b1043', 'AddressDoc', 'Pays-Basque, Adresse', '{"_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "lastName": "Pays-Basque", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:52:45.119741+00', '2021-08-26 11:52:45.119741+00');
INSERT INTO public.document VALUES (77, 1, '6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c', 'AddressDoc', 'Périgord, Adresse', '{"_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "lastName": "Périgord", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:53:55.911459+00', '2021-08-26 11:53:55.911459+00');
INSERT INTO public.document VALUES (78, 1, '8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353', 'AddressDoc', 'Rheinland, Adresse', '{"_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "lastName": "Rheinland", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:54:28.968721+00', '2021-08-26 11:54:28.968721+00');
INSERT INTO public.document VALUES (79, 1, '61ca7795-e9ce-43d1-a333-2c540238163f', 'AddressDoc', 'Allgäu, Adresse', '{"_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "lastName": "Allgäu", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:56:31.808546+00', '2021-08-26 11:56:31.808546+00');
INSERT INTO public.document VALUES (80, 1, 'de35a797-a7be-41ca-9ef3-adc7ce3d8738', 'AddressDoc', 'Alpen, Adresse', '{"_parent": "cb549c15-21a7-43f4-96c5-b4e5f4a15885", "lastName": "Alpen", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:56:45.008654+00', '2021-08-26 11:56:45.008654+00');
INSERT INTO public.document VALUES (81, 1, '1e97007c-92fc-410a-8665-ddaa6a65adc4', 'AddressDoc', 'Eifel, Adresse', '{"_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "lastName": "Eifel", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:57:51.531045+00', '2021-08-26 11:57:51.531045+00');
INSERT INTO public.document VALUES (82, 1, 'f13adb8a-03af-493c-b6e4-39350dc8f436', 'AddressDoc', 'Pfalz, Adresse', '{"_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "lastName": "Pfalz", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:58:47.341816+00', '2021-08-26 11:58:47.341816+00');
INSERT INTO public.document VALUES (83, 1, 'b59aebd7-f987-4bc9-ae51-3d1b74d2be7d', 'AddressDoc', 'Franken, Adresse', '{"_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "lastName": "Franken", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 11:59:46.1496+00', '2021-08-26 11:59:46.1496+00');
INSERT INTO public.document VALUES (84, 1, 'a5af5754-eace-439c-baa3-90bc775559fe', 'AddressDoc', 'Vogelsberg, Adresse', '{"_parent": "33f935ae-f177-4fc6-bb80-daf6a81dddf6", "lastName": "Vogelsberg", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:01:48.328245+00', '2021-08-26 12:01:48.328245+00');
INSERT INTO public.document VALUES (85, 1, 'a3c71705-9560-4e4b-aa54-b9c4c0d85373', 'AddressDoc', 'Wetterau, Adresse', '{"_parent": "61f389f8-d198-445c-be89-c0e5128520f0", "lastName": "Wetterau", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:02:02.613212+00', '2021-08-26 12:02:02.613212+00');
INSERT INTO public.document VALUES (86, 1, '31aacdb8-da3a-4d97-ace0-ef0386929380', 'AddressDoc', 'Bretagne, Adresse', '{"_parent": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "lastName": "Bretagne", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:03:25.562387+00', '2021-08-26 12:03:25.562387+00');
INSERT INTO public.document VALUES (87, 1, '03e25bce-299d-4c75-8b75-8155aaed2eb9', 'AddressDoc', 'Normandie, Adresse', '{"_parent": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "lastName": "Normandie", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:03:46.776835+00', '2021-08-26 12:03:46.776835+00');
INSERT INTO public.document VALUES (89, 1, '310aa57d-2e95-4a4b-8c03-206c0f0ff5d4', 'AddressDoc', 'Elsass, Adresse', '{"_parent": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "lastName": "Elsass", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:05:08.437944+00', '2021-08-26 12:05:08.437944+00');
INSERT INTO public.document VALUES (90, 1, '4e9ae410-488b-4b48-b7e9-2d1b355f6339', 'AddressDoc', 'Lothringen, Adresse', '{"_parent": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "lastName": "Lothringen", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:05:34.391311+00', '2021-08-26 12:05:34.391311+00');
INSERT INTO public.document VALUES (92, 1, 'de607d5b-5e1f-4240-bcd4-b43c039ebb37', 'AddressDoc', 'Limousin, Adresse', '{"_parent": "6237be21-04f8-4d40-bf87-a266543732ea", "lastName": "Limousin", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:07:15.810236+00', '2021-08-26 12:07:15.810236+00');
INSERT INTO public.document VALUES (93, 1, 'de3c7849-b787-4f92-8d94-3975fa73405e', 'AddressDoc', 'Auvergne, Adresse', '{"_parent": "c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187", "lastName": "Auvergne", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:08:25.948403+00', '2021-08-26 12:08:25.948403+00');
INSERT INTO public.document VALUES (88, 1, 'a09b5461-b4c7-41dc-917f-cfeb0baf0788', 'AddressDoc', 'Okzitanien, Adresse', '{"_parent": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "lastName": "Okzitanien", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:04:11.292767+00', '2021-08-26 12:04:11.292767+00');
INSERT INTO public.document VALUES (91, 1, 'b3b8f1d7-531e-407d-8ae3-55bfafa1bf46', 'AddressDoc', 'Bourgogne, Adresse', '{"_parent": "f78e8095-88fe-4af4-bb57-abeb96b28e46", "lastName": "Bourgogne", "firstName": "Adresse", "_hasChildren": false, "organization": ""}', 0, '2021-08-26 12:06:24.491914+00', '2021-08-26 12:06:24.491914+00');


--
-- Data for Name: document_archive; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: document_wrapper; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.document_wrapper VALUES (1, 1, NULL, 'a0df9837-512a-4594-b2ef-2814f7c55c81', 'FOLDER', 'data', 1, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (2, 1, NULL, 'bdde3ecb-3629-489c-86df-12ffac978ef5', 'FOLDER', 'data', 2, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (8, 1, NULL, '5cd9519c-0388-494d-9091-7dd7a9795b84', 'FOLDER', 'address', 8, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (9, 1, NULL, '4ff589e1-d83c-4856-8bae-2ae783f69da6', 'FOLDER', 'address', 9, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (13, 1, NULL, '6e302935-55f3-4cfa-8b97-65f248840bd2', 'AddressDoc', 'address', 13, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (14, 1, NULL, '214ca5bf-da1b-4003-b7b6-e73a2ef0ec10', 'AddressDoc', 'address', NULL, 14, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (15, 1, NULL, 'b495dd40-a006-4eb6-9c22-384f40fb6844', 'FOLDER', 'data', 15, NULL, NULL, NULL);
INSERT INTO public.document_wrapper VALUES (3, 1, 2, 'b6a59b55-117f-4fd3-96e8-bf78de797b8f', 'FOLDER', 'data', 3, NULL, NULL, '{bdde3ecb-3629-489c-86df-12ffac978ef5}');
INSERT INTO public.document_wrapper VALUES (4, 1, 3, '9b264daf-3044-441d-864c-699b44c46dc1', 'mCloudDoc', 'data', 4, NULL, NULL, '{bdde3ecb-3629-489c-86df-12ffac978ef5,b6a59b55-117f-4fd3-96e8-bf78de797b8f}');
INSERT INTO public.document_wrapper VALUES (5, 1, 2, 'e612e65b-7771-46eb-83ee-0118ba7a8b68', 'mCloudDoc', 'data', 5, NULL, NULL, '{bdde3ecb-3629-489c-86df-12ffac978ef5}');
INSERT INTO public.document_wrapper VALUES (7, 1, 2, '7e9687e8-43f4-4b95-bdcb-27647197a8cb', 'TestDoc', 'data', 7, NULL, NULL, '{bdde3ecb-3629-489c-86df-12ffac978ef5}');
INSERT INTO public.document_wrapper VALUES (6, 1, 2, '83c9b73c-5dcc-4c9f-8f2e-b0c74cfe267e', 'mCloudDoc', 'data', 6, NULL, NULL, '{bdde3ecb-3629-489c-86df-12ffac978ef5}');
INSERT INTO public.document_wrapper VALUES (12, 1, 8, 'b9839399-05fa-4ec1-ab04-6969930f6390', 'AddressDoc', 'address', 12, NULL, NULL, '{5cd9519c-0388-494d-9091-7dd7a9795b84}');
INSERT INTO public.document_wrapper VALUES (10, 1, 9, '57c913ed-bf0e-4d28-a8a0-895ada68a69a', 'FOLDER', 'address', 10, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6}');
INSERT INTO public.document_wrapper VALUES (11, 1, 10, '93ac91fc-4112-4975-86cb-48295a4d3915', 'AddressDoc', 'address', 11, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a}');
INSERT INTO public.document_wrapper VALUES (16, 1, NULL, '60556f51-3420-48b6-ad1a-29fe2824444c', 'FOLDER', 'address', 16, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (19, 1, NULL, '2198f38c-7999-466d-ac67-efc1450a95a1', 'AddressDoc', 'address', 19, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (20, 1, NULL, '98615f8c-c9df-4830-838a-c326af585a66', 'AddressDoc', 'address', 20, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (21, 1, NULL, 'f4edbc48-9939-4a19-98ae-f9f76bbb213f', 'AddressDoc', 'address', 21, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (22, 1, NULL, 'd7fe4fef-2588-458f-ba35-4673adbdbdf4', 'AddressDoc', 'address', 22, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (23, 1, NULL, '92dc82d5-1a41-42e4-9600-3d09116718bd', 'AddressDoc', 'address', 23, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (24, 1, NULL, '8467f4e3-90d4-45e6-bd0c-fa97cb669435', 'AddressDoc', 'address', 24, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (18, 1, NULL, '2ab150a3-d846-48a0-8aac-3b98d31e9c17', 'mCloudDoc', 'data', 25, 18, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (25, 1, NULL, '2294e4f3-821e-4ecd-b6c5-e8fc305275df', 'TestDoc', 'data', 26, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (26, 1, NULL, '98b74a0e-0473-4a73-b0ff-c7764c8a25db', 'mCloudDoc', 'data', 27, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (27, 1, NULL, 'ecc13939-8110-484b-86f2-1a203e35b8c2', 'mCloudDoc', 'data', 28, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (28, 1, NULL, 'd94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3', 'mCloudDoc', 'data', 29, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (29, 1, NULL, 'e5bc272c-142b-4ad6-8278-093e3de74b7c', 'mCloudDoc', 'data', NULL, 30, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (30, 1, 1, '8bb38364-378e-434c-a92f-1bd32156c3da', 'FOLDER', 'data', 31, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81}');
INSERT INTO public.document_wrapper VALUES (45, 1, 37, 'f3219242-018e-4f1b-b350-5970a9686176', 'mCloudDoc', 'data', 46, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171,28a7812e-dadf-41e8-bbf7-8a4caef60361}');
INSERT INTO public.document_wrapper VALUES (46, 1, 37, '79ebf92f-67e3-4de7-958a-37e12aea9f39', 'mCloudDoc', 'data', 47, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171,28a7812e-dadf-41e8-bbf7-8a4caef60361}');
INSERT INTO public.document_wrapper VALUES (33, 1, 1, '9cc60568-d529-4538-8ebc-664274e5ce81', 'FOLDER', 'data', 34, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81}');
INSERT INTO public.document_wrapper VALUES (34, 1, 1, 'a735083e-14f5-42d1-9f88-72aba5e5f171', 'FOLDER', 'data', 35, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81}');
INSERT INTO public.document_wrapper VALUES (35, 1, 30, 'f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0', 'FOLDER', 'data', 36, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da}');
INSERT INTO public.document_wrapper VALUES (36, 1, 30, 'e9fe4337-9f71-4225-861f-93260743a9d6', 'FOLDER', 'data', 37, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da}');
INSERT INTO public.document_wrapper VALUES (37, 1, 34, '28a7812e-dadf-41e8-bbf7-8a4caef60361', 'FOLDER', 'data', 38, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171}');
INSERT INTO public.document_wrapper VALUES (38, 1, 34, '61fd6be2-9cb3-461b-93f0-41212d637c41', 'FOLDER', 'data', 39, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171}');
INSERT INTO public.document_wrapper VALUES (39, 1, 33, '175fd9c0-20cf-4edf-a490-1efdb104d96a', 'mCloudDoc', 'data', 40, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,9cc60568-d529-4538-8ebc-664274e5ce81}');
INSERT INTO public.document_wrapper VALUES (40, 1, 33, 'a4827541-26c7-4703-b94c-3393e742c9df', 'mCloudDoc', 'data', 41, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,9cc60568-d529-4538-8ebc-664274e5ce81}');
INSERT INTO public.document_wrapper VALUES (41, 1, 35, 'f497af26-3571-4dfc-8505-d8d3d4899379', 'mCloudDoc', 'data', 42, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da,f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0}');
INSERT INTO public.document_wrapper VALUES (42, 1, 35, '58977711-f24a-471f-afc8-1179a7e2c703', 'mCloudDoc', 'data', 43, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da,f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0}');
INSERT INTO public.document_wrapper VALUES (43, 1, 36, '59bc4522-9456-44fe-8ab4-e98fe713b9c2', 'mCloudDoc', 'data', 44, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da,e9fe4337-9f71-4225-861f-93260743a9d6}');
INSERT INTO public.document_wrapper VALUES (44, 1, 36, 'bc4e0d68-3023-444c-9e31-df858baceeef', 'mCloudDoc', 'data', 45, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da,e9fe4337-9f71-4225-861f-93260743a9d6}');
INSERT INTO public.document_wrapper VALUES (47, 1, 38, 'c16af9ea-ab87-4d31-b86f-60ad96e4e9cb', 'mCloudDoc', 'data', 48, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171,61fd6be2-9cb3-461b-93f0-41212d637c41}');
INSERT INTO public.document_wrapper VALUES (48, 1, 38, 'bb9c0963-c6ec-4dd5-9f3f-33976556d1c9', 'mCloudDoc', 'data', 49, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,a735083e-14f5-42d1-9f88-72aba5e5f171,61fd6be2-9cb3-461b-93f0-41212d637c41}');
INSERT INTO public.document_wrapper VALUES (49, 1, 1, 'f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c', 'mCloudDoc', 'data', 50, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81}');
INSERT INTO public.document_wrapper VALUES (50, 1, 30, 'c8da3ada-dab7-46c1-9147-248bb3a7d7df', 'mCloudDoc', 'data', 51, NULL, NULL, '{a0df9837-512a-4594-b2ef-2814f7c55c81,8bb38364-378e-434c-a92f-1bd32156c3da}');
INSERT INTO public.document_wrapper VALUES (51, 1, NULL, '70b789f7-5caf-4197-9a78-9883395f0035', 'mCloudDoc', 'data', 52, NULL, NULL, '{}');
INSERT INTO public.document_wrapper VALUES (52, 1, 9, '7bbe60f5-67db-4623-b245-1fbc091b9b76', 'FOLDER', 'address', 53, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6}');
INSERT INTO public.document_wrapper VALUES (53, 1, 10, '376c9824-20a0-433c-af3e-e196ea04a077', 'FOLDER', 'address', 54, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a}');
INSERT INTO public.document_wrapper VALUES (82, 1, 9, 'b59aebd7-f987-4bc9-ae51-3d1b74d2be7d', 'AddressDoc', 'address', 83, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6}');
INSERT INTO public.document_wrapper VALUES (55, 1, 10, 'c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187', 'FOLDER', 'address', 56, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a}');
INSERT INTO public.document_wrapper VALUES (56, 1, 52, 'ab30a1dd-f0ec-4949-aa4e-10dbb99d509c', 'FOLDER', 'address', 57, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76}');
INSERT INTO public.document_wrapper VALUES (57, 1, 52, 'f78e8095-88fe-4af4-bb57-abeb96b28e46', 'FOLDER', 'address', 58, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76}');
INSERT INTO public.document_wrapper VALUES (58, 1, 9, '2a03ccf3-1a99-498f-9a5c-29a84606f87c', 'FOLDER', 'address', 59, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6}');
INSERT INTO public.document_wrapper VALUES (59, 1, 58, 'd6371165-1be0-4a7c-b635-fd6952cad479', 'FOLDER', 'address', 60, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c}');
INSERT INTO public.document_wrapper VALUES (60, 1, 58, '06cf2641-5931-406b-b7b3-aa8d1090aa82', 'FOLDER', 'address', 61, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c}');
INSERT INTO public.document_wrapper VALUES (61, 1, 53, '6237be21-04f8-4d40-bf87-a266543732ea', 'FOLDER', 'address', 62, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077}');
INSERT INTO public.document_wrapper VALUES (62, 1, 53, 'cb549c15-21a7-43f4-96c5-b4e5f4a15885', 'FOLDER', 'address', 63, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077}');
INSERT INTO public.document_wrapper VALUES (63, 1, 55, '33f935ae-f177-4fc6-bb80-daf6a81dddf6', 'FOLDER', 'address', 64, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187}');
INSERT INTO public.document_wrapper VALUES (64, 1, 55, '61f389f8-d198-445c-be89-c0e5128520f0', 'FOLDER', 'address', 65, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187}');
INSERT INTO public.document_wrapper VALUES (65, 1, 59, '556c875e-d471-4a35-8203-0c750737d296', 'AddressDoc', 'address', 66, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c,d6371165-1be0-4a7c-b635-fd6952cad479}');
INSERT INTO public.document_wrapper VALUES (66, 1, 59, 'eb792c63-0238-4207-a34a-46e0def02656', 'AddressDoc', 'address', 67, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c,d6371165-1be0-4a7c-b635-fd6952cad479}');
INSERT INTO public.document_wrapper VALUES (67, 1, 60, '08f38f6c-db28-4357-a361-4104804d53c9', 'AddressDoc', 'address', 68, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c,06cf2641-5931-406b-b7b3-aa8d1090aa82}');
INSERT INTO public.document_wrapper VALUES (68, 1, 60, 'd7c933b4-083c-473b-bcf7-9979fddd5b4d', 'AddressDoc', 'address', 69, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c,06cf2641-5931-406b-b7b3-aa8d1090aa82}');
INSERT INTO public.document_wrapper VALUES (69, 1, 58, 'd6d4d774-c17c-4ebd-a494-2b73d598cb50', 'AddressDoc', 'address', 70, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c}');
INSERT INTO public.document_wrapper VALUES (70, 1, 52, 'bf93c9db-aea1-4851-8074-9f5badef7e6a', 'AddressDoc', 'address', 71, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76}');
INSERT INTO public.document_wrapper VALUES (71, 1, 55, '3e3c3e48-e6e3-47de-a35b-e298a2a53e83', 'AddressDoc', 'address', 72, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187}');
INSERT INTO public.document_wrapper VALUES (72, 1, 53, '05b2e466-b55f-4d16-a10b-358b447eeb50', 'AddressDoc', 'address', 73, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077}');
INSERT INTO public.document_wrapper VALUES (73, 1, 10, '93374b77-5cc4-404f-be1f-a478458a617c', 'AddressDoc', 'address', 74, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a}');
INSERT INTO public.document_wrapper VALUES (74, 1, 53, '1db03de3-510f-4149-adf0-3973a515a954', 'AddressDoc', 'address', 75, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077}');
INSERT INTO public.document_wrapper VALUES (75, 1, 56, 'e629f81d-f9fc-4a97-b224-e00df74b1043', 'AddressDoc', 'address', 76, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76,ab30a1dd-f0ec-4949-aa4e-10dbb99d509c}');
INSERT INTO public.document_wrapper VALUES (76, 1, 63, '6aa1c39d-9c7a-4652-9c2a-8fca4ed70e9c', 'AddressDoc', 'address', 77, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187,33f935ae-f177-4fc6-bb80-daf6a81dddf6}');
INSERT INTO public.document_wrapper VALUES (77, 1, 61, '8aa20d8f-7ea6-4bf1-8394-eb6ef4d7c353', 'AddressDoc', 'address', 78, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077,6237be21-04f8-4d40-bf87-a266543732ea}');
INSERT INTO public.document_wrapper VALUES (78, 1, 62, '61ca7795-e9ce-43d1-a333-2c540238163f', 'AddressDoc', 'address', 79, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077,cb549c15-21a7-43f4-96c5-b4e5f4a15885}');
INSERT INTO public.document_wrapper VALUES (79, 1, 62, 'de35a797-a7be-41ca-9ef3-adc7ce3d8738', 'AddressDoc', 'address', 80, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077,cb549c15-21a7-43f4-96c5-b4e5f4a15885}');
INSERT INTO public.document_wrapper VALUES (80, 1, 64, '1e97007c-92fc-410a-8665-ddaa6a65adc4', 'AddressDoc', 'address', 81, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187,61f389f8-d198-445c-be89-c0e5128520f0}');
INSERT INTO public.document_wrapper VALUES (81, 1, 57, 'f13adb8a-03af-493c-b6e4-39350dc8f436', 'AddressDoc', 'address', 82, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76,f78e8095-88fe-4af4-bb57-abeb96b28e46}');
INSERT INTO public.document_wrapper VALUES (83, 1, 63, 'a5af5754-eace-439c-baa3-90bc775559fe', 'AddressDoc', 'address', 84, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187,33f935ae-f177-4fc6-bb80-daf6a81dddf6}');
INSERT INTO public.document_wrapper VALUES (84, 1, 64, 'a3c71705-9560-4e4b-aa54-b9c4c0d85373', 'AddressDoc', 'address', 85, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187,61f389f8-d198-445c-be89-c0e5128520f0}');
INSERT INTO public.document_wrapper VALUES (85, 1, 10, '31aacdb8-da3a-4d97-ace0-ef0386929380', 'AddressDoc', 'address', 86, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a}');
INSERT INTO public.document_wrapper VALUES (86, 1, 52, '03e25bce-299d-4c75-8b75-8155aaed2eb9', 'AddressDoc', 'address', 87, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76}');
INSERT INTO public.document_wrapper VALUES (88, 1, 9, '310aa57d-2e95-4a4b-8c03-206c0f0ff5d4', 'AddressDoc', 'address', 89, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6}');
INSERT INTO public.document_wrapper VALUES (89, 1, 56, '4e9ae410-488b-4b48-b7e9-2d1b355f6339', 'AddressDoc', 'address', 90, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76,ab30a1dd-f0ec-4949-aa4e-10dbb99d509c}');
INSERT INTO public.document_wrapper VALUES (91, 1, 61, 'de607d5b-5e1f-4240-bcd4-b43c039ebb37', 'AddressDoc', 'address', 92, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,376c9824-20a0-433c-af3e-e196ea04a077,6237be21-04f8-4d40-bf87-a266543732ea}');
INSERT INTO public.document_wrapper VALUES (92, 1, 55, 'de3c7849-b787-4f92-8d94-3975fa73405e', 'AddressDoc', 'address', 93, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,57c913ed-bf0e-4d28-a8a0-895ada68a69a,c3a85adb-0a75-42ac-9f3d-2ac5d0ffe187}');
INSERT INTO public.document_wrapper VALUES (87, 1, 58, 'a09b5461-b4c7-41dc-917f-cfeb0baf0788', 'AddressDoc', 'address', 88, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,2a03ccf3-1a99-498f-9a5c-29a84606f87c}');
INSERT INTO public.document_wrapper VALUES (90, 1, 57, 'b3b8f1d7-531e-407d-8ae3-55bfafa1bf46', 'AddressDoc', 'address', 91, NULL, NULL, '{4ff589e1-d83c-4856-8bae-2ae783f69da6,7bbe60f5-67db-4623-b245-1fbc091b9b76,f78e8095-88fe-4af4-bb57-abeb96b28e46}');


--
-- Data for Name: manager; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.manager VALUES (3, 1, 1);
INSERT INTO public.manager VALUES (4, 1, 1);
INSERT INTO public.manager VALUES (6, 1, 1);
INSERT INTO public.manager VALUES (10, 1, 1);
INSERT INTO public.manager VALUES (9, 1, 1);
INSERT INTO public.manager VALUES (12, 1, 1);
INSERT INTO public.manager VALUES (14, 1, 1);
INSERT INTO public.manager VALUES (15, 1, 1);
INSERT INTO public.manager VALUES (16, 1, 1);
INSERT INTO public.manager VALUES (13, 16, 1);
INSERT INTO public.manager VALUES (17, 1, 1);


--
-- Data for Name: permission_group; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.permission_group VALUES (4, 1, 'to Delete', 'es existiert nur um gelöscht zu werden', '{"pages": {"form": null, "user": null, "address": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [], "documents": []}', '{"creationDate": 1627929289590, "modificationDate": 1627929309279}', 1);
INSERT INTO public.permission_group VALUES (3, 1, 'test_gruppe_1', 'Gruppe mit bestimmten Berechtigungen', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "title": "Ordner_2.Ebene_C", "isFolder": true, "permission": "writeTree"}, {"uuid": "93374b77-5cc4-404f-be1f-a478458a617c", "title": "Aquitanien, Adresse", "isFolder": false, "permission": "writeTree"}, {"uuid": "b59aebd7-f987-4bc9-ae51-3d1b74d2be7d", "title": "Franken, Adresse", "isFolder": false, "permission": "writeTree"}], "documents": [{"uuid": "a735083e-14f5-42d1-9f88-72aba5e5f171", "title": "Ordner_Ebene_2C", "isFolder": true, "permission": "writeTree"}, {"uuid": "c8da3ada-dab7-46c1-9147-248bb3a7d7df", "title": "Datum_Ebene_3_3", "isFolder": false, "permission": "writeTree"}]}', '{"creationDate": 1627928953177, "modificationDate": 1629980553465}', 1);
INSERT INTO public.permission_group VALUES (5, 1, 'gruppe_mit_datenrechten', 'Gruppe, die Rechte an bestimmten Daten hat', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [], "documents": [{"uuid": "98b74a0e-0473-4a73-b0ff-c7764c8a25db", "title": "TestDocResearch1", "isFolder": false, "permission": "writeTree"}, {"uuid": "28a7812e-dadf-41e8-bbf7-8a4caef60361", "title": "Ordner_Ebene_3C", "isFolder": true, "permission": "writeTree"}]}', '{"creationDate": 1629106475478, "modificationDate": 1629980845399}', 1);
INSERT INTO public.permission_group VALUES (6, 1, 'gruppe_mit_ortsrechten', 'Gruppe, die Rechte an bestimmten Orten hat', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "92dc82d5-1a41-42e4-9600-3d09116718bd", "title": "test_c, test_c", "isFolder": false, "permission": "writeTree"}, {"uuid": "f4edbc48-9939-4a19-98ae-f9f76bbb213f", "title": "test_z, test_z", "isFolder": false, "permission": "writeTree"}, {"uuid": "ab30a1dd-f0ec-4949-aa4e-10dbb99d509c", "title": "Ordner_3.Ebene_C", "isFolder": true, "permission": "writeTree"}], "documents": [{"uuid": "8bb38364-378e-434c-a92f-1bd32156c3da", "title": "Ordner_Ebene_2A", "isFolder": true, "permission": "writeTree"}]}', '{"creationDate": 1629106531466, "modificationDate": 1629980369577}', 1);
INSERT INTO public.permission_group VALUES (1, 1, 'test_gruppe_3', NULL, '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "57c913ed-bf0e-4d28-a8a0-895ada68a69a", "title": "Ordner 2. Ebene", "isFolder": true, "permission": "writeTree"}], "documents": [{"uuid": "a0df9837-512a-4594-b2ef-2814f7c55c81", "title": "Neue Testdokumente", "isFolder": true, "permission": "writeTree"}]}', '{"creationDate": 1626172493723, "modificationDate": 1629980433935}', 1);
INSERT INTO public.permission_group VALUES (2, 1, 'test_gruppe_2', NULL, '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "7bbe60f5-67db-4623-b245-1fbc091b9b76", "title": "Ordner_2.Ebene_B", "isFolder": true, "permission": "writeTree"}, {"uuid": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "title": "Elsass, Adresse", "isFolder": false, "permission": "writeTree"}], "documents": [{"uuid": "ecc13939-8110-484b-86f2-1a203e35b8c2", "title": "TestDocResearch3", "isFolder": false, "permission": "readTree"}, {"uuid": "9cc60568-d529-4538-8ebc-664274e5ce81", "title": "Ordner_Ebene_2B", "isFolder": true, "permission": "writeTree"}, {"uuid": "f25f4b11-23ad-4b0f-9c71-2d0c77f0ad6c", "title": "Datum_Ebene_2_1", "isFolder": false, "permission": "writeTree"}]}', '{"creationDate": 1626258603926, "modificationDate": 1629980507220}', 17);
INSERT INTO public.permission_group VALUES (9, 1, 'leere_Gruppe', 'Gruppe ohne jegliche Daten', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [], "documents": []}', '{"creationDate": 1629980573469, "modificationDate": 1629980585985}', 1);
INSERT INTO public.permission_group VALUES (7, 1, 'gruppe_mit_lese_datenrechten', 'kann auf Daten zugreifen, aber read only', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [], "documents": [{"uuid": "d94575fa-1da9-4bfb-a4dc-3bbfcc4b49b3", "title": "TestDocResearch2", "isFolder": false, "permission": "readTree"}, {"uuid": "61fd6be2-9cb3-461b-93f0-41212d637c41", "title": "Ordner_Ebene_3D", "isFolder": true, "permission": "readTree"}]}', '{"creationDate": 1629107835898, "modificationDate": 1629980870278}', 1);
INSERT INTO public.permission_group VALUES (8, 1, 'gruppe_mit_lese_ortsrechten', 'Gruppe mit Zugriffsrechten auf Orte, aber read only', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "2198f38c-7999-466d-ac67-efc1450a95a1", "title": "test_x, test_x", "isFolder": false, "permission": "readTree"}, {"uuid": "310aa57d-2e95-4a4b-8c03-206c0f0ff5d4", "title": "Elsass, Adresse", "isFolder": false, "permission": "readTree"}, {"uuid": "d6371165-1be0-4a7c-b635-fd6952cad479", "title": "Ordner_3.Ebene_E", "isFolder": true, "permission": "readTree"}], "documents": []}', '{"creationDate": 1629107884136, "modificationDate": 1629980897890}', 1);
INSERT INTO public.permission_group VALUES (10, 1, 'test_gruppe_4', NULL, '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "376c9824-20a0-433c-af3e-e196ea04a077", "title": "Ordner_3.Ebene_A", "isFolder": true, "permission": "writeTree"}, {"uuid": "d6371165-1be0-4a7c-b635-fd6952cad479", "title": "Ordner_3.Ebene_E", "isFolder": true, "permission": "writeTree"}], "documents": [{"uuid": "61fd6be2-9cb3-461b-93f0-41212d637c41", "title": "Ordner_Ebene_3D", "isFolder": true, "permission": "writeTree"}, {"uuid": "f2d7f5b8-a76d-4957-8d5d-51c358cd2fd0", "title": "Ordner_Ebene_3A", "isFolder": true, "permission": "writeTree"}]}', '{"creationDate": 1629980603079, "modificationDate": 1629980649914}', 1);
INSERT INTO public.permission_group VALUES (11, 1, 'test_gruppe_5', NULL, '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "4ff589e1-d83c-4856-8bae-2ae783f69da6", "title": "Neue Testadressen", "isFolder": true, "permission": "writeTree"}], "documents": [{"uuid": "f3219242-018e-4f1b-b350-5970a9686176", "title": "Datum_Ebene_4_5", "isFolder": false, "permission": "writeTree"}]}', '{"creationDate": 1629980669489, "modificationDate": 1629980702682}', 1);
INSERT INTO public.permission_group VALUES (12, 1, 'gruppe_nur_Adressen', 'hat nur Rechte an Adressen', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [{"uuid": "2a03ccf3-1a99-498f-9a5c-29a84606f87c", "title": "Ordner_2.Ebene_C", "isFolder": true, "permission": "writeTree"}], "documents": []}', '{"creationDate": 1629980716885, "modificationDate": 1629980740717}', 1);
INSERT INTO public.permission_group VALUES (13, 1, 'gruppe_nur_daten', 'Gruppe hat nur Recht an Daten', '{"pages": {"form": null, "user": null, "address": null, "profile": null, "catalogs": null, "research": null, "settings": null, "dashboard": null, "importExport": null}, "actions": {"demo": null, "test": null}, "addresses": [], "documents": [{"uuid": "8bb38364-378e-434c-a92f-1bd32156c3da", "title": "Ordner_Ebene_2A", "isFolder": true, "permission": "writeTree"}]}', '{"creationDate": 1629980756735, "modificationDate": 1629980782773}', 1);


--
-- Data for Name: query; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.role VALUES (1, 'ige-super-admin', NULL);
INSERT INTO public.role VALUES (2, 'cat-admin', NULL);
INSERT INTO public.role VALUES (3, 'md-admin', NULL);
INSERT INTO public.role VALUES (4, 'author', NULL);


--
-- Data for Name: stand_in; Type: TABLE DATA; Schema: public; Owner: admin
--



--
-- Data for Name: user_group; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.user_group VALUES (14, 3);
INSERT INTO public.user_group VALUES (14, 6);
INSERT INTO public.user_group VALUES (15, 1);
INSERT INTO public.user_group VALUES (15, 5);
INSERT INTO public.user_group VALUES (13, 1);
INSERT INTO public.user_group VALUES (17, 6);


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.user_info VALUES (3, 'eins', NULL, '{"creationDate": 1626258586646, "organisation": "", "recentLogins": [], "modificationDate": 1626258586646}', 2);
INSERT INTO public.user_info VALUES (4, 'toDel', NULL, '{"creationDate": 1627928675495, "organisation": "", "recentLogins": [], "modificationDate": 1627928675495}', 2);
INSERT INTO public.user_info VALUES (6, 'meta', NULL, '{"creationDate": 1627929085698, "organisation": "", "recentLogins": [], "modificationDate": 1627929085698}', 3);
INSERT INTO public.user_info VALUES (10, 'autor', NULL, '{"creationDate": 1627935749266, "organisation": "", "recentLogins": [], "modificationDate": 1627935749266}', 4);
INSERT INTO public.user_info VALUES (9, 'loginZ', NULL, '{"creationDate": 1627936908296, "organisation": "", "recentLogins": [], "modificationDate": 1627936908296}', 2);
INSERT INTO public.user_info VALUES (12, 'todel', NULL, '{"creationDate": 1627937288430, "organisation": "", "recentLogins": [], "modificationDate": 1627937288430}', 4);
INSERT INTO public.user_info VALUES (2, 'ige2', 1, '{"creationDate": 1625486207290, "organisation": "wemove digital solutions", "recentLogins": [1627937326000, 1627937326000], "modificationDate": 1625486207290}', 2);
INSERT INTO public.user_info VALUES (13, 'autor2', NULL, '{"creationDate": 1629106869823, "organisation": "", "recentLogins": [], "modificationDate": 1629106869823}', 4);
INSERT INTO public.user_info VALUES (14, 'meta2', NULL, '{"creationDate": 1629107129259, "organisation": "", "recentLogins": [], "modificationDate": 1629107129259}', 3);
INSERT INTO public.user_info VALUES (15, 'zwei', NULL, '{"creationDate": 1629107228623, "organisation": "", "recentLogins": [], "modificationDate": 1629107228623}', 2);
INSERT INTO public.user_info VALUES (16, 'drei', NULL, '{"creationDate": 1629107483823, "organisation": "", "recentLogins": [], "modificationDate": 1629107483823}', 2);
INSERT INTO public.user_info VALUES (17, 'meta3', NULL, '{"creationDate": 1629107668914, "organisation": "", "recentLogins": [], "modificationDate": 1629107668914}', 3);
INSERT INTO public.user_info VALUES (1, 'ige', 1, '{"creationDate": null, "organisation": null, "recentLogins": [1629106399000, 1629974848000], "modificationDate": null}', 1);


--
-- Data for Name: version_info; Type: TABLE DATA; Schema: public; Owner: admin
--

INSERT INTO public.version_info VALUES (1, 'schema_version', '0.34');


--
-- Name: acl_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.acl_class_id_seq', 2, false);


--
-- Name: acl_entry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.acl_entry_id_seq', 81, true);


--
-- Name: acl_object_identity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.acl_object_identity_id_seq', 107, true);


--
-- Name: acl_sid_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.acl_sid_id_seq', 12, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 177, true);


--
-- Name: behaviour_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.behaviour_id_seq', 1, false);


--
-- Name: catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.catalog_id_seq', 2, true);


--
-- Name: codelist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.codelist_id_seq', 4, true);


--
-- Name: document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.document_id_seq', 93, true);


--
-- Name: document_wrapper_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.document_wrapper_id_seq', 92, true);


--
-- Name: permission_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.permission_group_id_seq', 13, true);


--
-- Name: query_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.query_id_seq', 1, false);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.role_id_seq', 5, false);


--
-- Name: user_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_info_id_seq', 17, true);


--
-- Name: version_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.version_info_id_seq', 2, false);


--
-- Name: acl_class acl_class_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_class
    ADD CONSTRAINT acl_class_pkey PRIMARY KEY (id);


--
-- Name: acl_entry acl_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_entry
    ADD CONSTRAINT acl_entry_pkey PRIMARY KEY (id);


--
-- Name: acl_object_identity acl_object_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity
    ADD CONSTRAINT acl_object_identity_pkey PRIMARY KEY (id);


--
-- Name: acl_sid acl_sid_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_sid
    ADD CONSTRAINT acl_sid_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: behaviour behaviour_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.behaviour
    ADD CONSTRAINT behaviour_pkey PRIMARY KEY (id);


--
-- Name: catalog catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalog
    ADD CONSTRAINT catalog_pkey PRIMARY KEY (id);


--
-- Name: catalog_user_info catalog_user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalog_user_info
    ADD CONSTRAINT catalog_user_info_pkey PRIMARY KEY (catalog_id, user_info_id);


--
-- Name: codelist codelist_identifier_catalog_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.codelist
    ADD CONSTRAINT codelist_identifier_catalog_id_key UNIQUE (identifier, catalog_id);


--
-- Name: codelist codelist_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.codelist
    ADD CONSTRAINT codelist_pkey PRIMARY KEY (id);


--
-- Name: document_archive document_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_archive
    ADD CONSTRAINT document_archive_pkey PRIMARY KEY (wrapper_id, document_id);


--
-- Name: document document_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);


--
-- Name: document_wrapper document_wrapper_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper
    ADD CONSTRAINT document_wrapper_pkey PRIMARY KEY (id);


--
-- Name: manager manager_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.manager
    ADD CONSTRAINT manager_pkey PRIMARY KEY (user_id, catalog_id);


--
-- Name: permission_group permission_group_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_pkey PRIMARY KEY (id);


--
-- Name: query query_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_pkey PRIMARY KEY (id);


--
-- Name: role role_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pk PRIMARY KEY (id);


--
-- Name: stand_in stand_in_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stand_in
    ADD CONSTRAINT stand_in_pkey PRIMARY KEY (user_id, stand_in_id, catalog_id);


--
-- Name: acl_sid unique_uk_1; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_sid
    ADD CONSTRAINT unique_uk_1 UNIQUE (sid, principal);


--
-- Name: acl_class unique_uk_2; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_class
    ADD CONSTRAINT unique_uk_2 UNIQUE (class);


--
-- Name: acl_object_identity unique_uk_3; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity
    ADD CONSTRAINT unique_uk_3 UNIQUE (object_id_class, object_id_identity);


--
-- Name: acl_entry unique_uk_4; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_entry
    ADD CONSTRAINT unique_uk_4 UNIQUE (acl_object_identity, ace_order);


--
-- Name: user_group user_group_pk; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_group
    ADD CONSTRAINT user_group_pk PRIMARY KEY (user_info_id, group_id);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (id);


--
-- Name: version_info version_info_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.version_info
    ADD CONSTRAINT version_info_pkey PRIMARY KEY (id);


--
-- Name: idx_behaviour_data; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_behaviour_data ON public.behaviour USING btree (data);


--
-- Name: behaviour behaviour_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.behaviour
    ADD CONSTRAINT behaviour_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: catalog_user_info catalog_user_info_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalog_user_info
    ADD CONSTRAINT catalog_user_info_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: catalog_user_info catalog_user_info_user_info_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.catalog_user_info
    ADD CONSTRAINT catalog_user_info_user_info_id_fkey FOREIGN KEY (user_info_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: codelist codelist_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.codelist
    ADD CONSTRAINT codelist_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: document_archive document_archive_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_archive
    ADD CONSTRAINT document_archive_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.document(id) ON DELETE CASCADE;


--
-- Name: document_archive document_archive_wrapper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_archive
    ADD CONSTRAINT document_archive_wrapper_id_fkey FOREIGN KEY (wrapper_id) REFERENCES public.document_wrapper(id) ON DELETE CASCADE;


--
-- Name: document document_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: document_wrapper document_wrapper_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper
    ADD CONSTRAINT document_wrapper_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: document_wrapper document_wrapper_draft_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper
    ADD CONSTRAINT document_wrapper_draft_fkey FOREIGN KEY (draft) REFERENCES public.document(id) ON DELETE SET NULL;


--
-- Name: document_wrapper document_wrapper_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper
    ADD CONSTRAINT document_wrapper_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.document_wrapper(id) ON DELETE CASCADE;


--
-- Name: document_wrapper document_wrapper_published_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.document_wrapper
    ADD CONSTRAINT document_wrapper_published_fkey FOREIGN KEY (published) REFERENCES public.document(id) ON DELETE SET NULL;


--
-- Name: acl_object_identity foreign_fk_1; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity
    ADD CONSTRAINT foreign_fk_1 FOREIGN KEY (parent_object) REFERENCES public.acl_object_identity(id);


--
-- Name: acl_object_identity foreign_fk_2; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity
    ADD CONSTRAINT foreign_fk_2 FOREIGN KEY (object_id_class) REFERENCES public.acl_class(id);


--
-- Name: acl_object_identity foreign_fk_3; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_object_identity
    ADD CONSTRAINT foreign_fk_3 FOREIGN KEY (owner_sid) REFERENCES public.acl_sid(id);


--
-- Name: acl_entry foreign_fk_4; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_entry
    ADD CONSTRAINT foreign_fk_4 FOREIGN KEY (acl_object_identity) REFERENCES public.acl_object_identity(id);


--
-- Name: acl_entry foreign_fk_5; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.acl_entry
    ADD CONSTRAINT foreign_fk_5 FOREIGN KEY (sid) REFERENCES public.acl_sid(id);


--
-- Name: manager manager_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.manager
    ADD CONSTRAINT manager_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: manager manager_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.manager
    ADD CONSTRAINT manager_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: manager manager_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.manager
    ADD CONSTRAINT manager_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: permission_group permission_group_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: permission_group permission_group_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: query query_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: query query_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.query
    ADD CONSTRAINT query_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: stand_in stand_in_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stand_in
    ADD CONSTRAINT stand_in_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalog(id) ON DELETE CASCADE;


--
-- Name: stand_in stand_in_stand_in_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stand_in
    ADD CONSTRAINT stand_in_stand_in_id_fkey FOREIGN KEY (stand_in_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: stand_in stand_in_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.stand_in
    ADD CONSTRAINT stand_in_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id) ON DELETE CASCADE;


--
-- Name: user_group user_group_permission_group_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_group
    ADD CONSTRAINT user_group_permission_group_id_fk FOREIGN KEY (group_id) REFERENCES public.permission_group(id) ON DELETE CASCADE;


--
-- Name: user_group user_group_user_info_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_group
    ADD CONSTRAINT user_group_user_info_id_fk FOREIGN KEY (user_info_id) REFERENCES public.user_info(id);


--
-- Name: user_info user_info_cur_catalog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_cur_catalog_id_fkey FOREIGN KEY (cur_catalog_id) REFERENCES public.catalog(id) ON DELETE SET NULL;


--
-- Name: user_info user_info_role_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_role_id_fk FOREIGN KEY (role_id) REFERENCES public.role(id);


--
-- PostgreSQL database dump complete
--

