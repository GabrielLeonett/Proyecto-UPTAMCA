--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-03-21 14:34:30

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- TOC entry 249 (class 1259 OID 17117)
-- Name: administradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administradores (
    id bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_rol bigint NOT NULL
);


ALTER TABLE public.administradores OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17116)
-- Name: administradores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administradores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administradores_id_seq OWNER TO postgres;

--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 248
-- Name: administradores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administradores_id_seq OWNED BY public.administradores.id;


--
-- TOC entry 223 (class 1259 OID 16974)
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16981)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17018)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id bigint NOT NULL,
    nombre_categoria character varying(255) NOT NULL
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17017)
-- Name: categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_id_seq OWNER TO postgres;

--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 230
-- Name: categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_id_seq OWNED BY public.categoria.id;


--
-- TOC entry 251 (class 1259 OID 17135)
-- Name: coordinadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordinadores (
    id bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_ubicacion bigint NOT NULL,
    id_pnf bigint NOT NULL
);


ALTER TABLE public.coordinadores OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 17134)
-- Name: coordinadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coordinadores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coordinadores_id_seq OWNER TO postgres;

--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 250
-- Name: coordinadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coordinadores_id_seq OWNED BY public.coordinadores.id;


--
-- TOC entry 233 (class 1259 OID 17025)
-- Name: dedicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dedicacion (
    id bigint NOT NULL,
    nombre_dedicacion character varying(255) NOT NULL
);


ALTER TABLE public.dedicacion OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17024)
-- Name: dedicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dedicacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dedicacion_id_seq OWNER TO postgres;

--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 232
-- Name: dedicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dedicacion_id_seq OWNED BY public.dedicacion.id;


--
-- TOC entry 229 (class 1259 OID 17006)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17005)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 228
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 253 (class 1259 OID 17158)
-- Name: horarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horarios (
    id bigint NOT NULL,
    dia_horario character varying(10),
    inicio_horario time(0) without time zone,
    final_horario time(0) without time zone
);


ALTER TABLE public.horarios OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17157)
-- Name: horarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_id_seq OWNER TO postgres;

--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 252
-- Name: horarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_id_seq OWNED BY public.horarios.id;


--
-- TOC entry 227 (class 1259 OID 16998)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16989)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16988)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 225
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 218 (class 1259 OID 16940)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16939)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 217
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 221 (class 1259 OID 16958)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17046)
-- Name: pnfs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pnfs (
    id bigint NOT NULL,
    nombre_pnf character varying(255),
    descripcion_pnf character varying(400)
);


ALTER TABLE public.pnfs OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 17045)
-- Name: pnfs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pnfs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pnfs_id_seq OWNER TO postgres;

--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 238
-- Name: pnfs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pnfs_id_seq OWNED BY public.pnfs.id;


--
-- TOC entry 247 (class 1259 OID 17088)
-- Name: profesores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesores (
    id bigint NOT NULL,
    id_categoria bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_dedicacion bigint NOT NULL,
    id_ubicacion bigint NOT NULL,
    pre_grado character varying(300),
    pos_grado character varying(300),
    fecha_ingreso date,
    disponibilidad integer
);


ALTER TABLE public.profesores OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 17087)
-- Name: profesores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesores_id_seq OWNER TO postgres;

--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 246
-- Name: profesores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesores_id_seq OWNED BY public.profesores.id;


--
-- TOC entry 255 (class 1259 OID 17165)
-- Name: r_horarios_unidad_curricular; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.r_horarios_unidad_curricular (
    id bigint NOT NULL,
    id_horario bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL
);


ALTER TABLE public.r_horarios_unidad_curricular OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17164)
-- Name: r_horarios_unidad_curricular_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.r_horarios_unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.r_horarios_unidad_curricular_id_seq OWNER TO postgres;

--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 254
-- Name: r_horarios_unidad_curricular_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.r_horarios_unidad_curricular_id_seq OWNED BY public.r_horarios_unidad_curricular.id;


--
-- TOC entry 257 (class 1259 OID 17182)
-- Name: r_profesores_unidad_curricular; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.r_profesores_unidad_curricular (
    id bigint NOT NULL,
    id_profesores bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL
);


ALTER TABLE public.r_profesores_unidad_curricular OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17181)
-- Name: r_profesores_unidad_curricular_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.r_profesores_unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.r_profesores_unidad_curricular_id_seq OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 256
-- Name: r_profesores_unidad_curricular_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.r_profesores_unidad_curricular_id_seq OWNED BY public.r_profesores_unidad_curricular.id;


--
-- TOC entry 259 (class 1259 OID 17199)
-- Name: r_unidad_curricular_seccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.r_unidad_curricular_seccion (
    id bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL,
    id_seccion bigint NOT NULL
);


ALTER TABLE public.r_unidad_curricular_seccion OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17198)
-- Name: r_unidad_curricular_seccion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.r_unidad_curricular_seccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.r_unidad_curricular_seccion_id_seq OWNER TO postgres;

--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 258
-- Name: r_unidad_curricular_seccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.r_unidad_curricular_seccion_id_seq OWNED BY public.r_unidad_curricular_seccion.id;


--
-- TOC entry 237 (class 1259 OID 17039)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    tipo_rol integer NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 17038)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 236
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 245 (class 1259 OID 17076)
-- Name: secciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secciones (
    id bigint NOT NULL,
    valor_seccion integer,
    id_trayecto bigint NOT NULL
);


ALTER TABLE public.secciones OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 17075)
-- Name: secciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secciones_id_seq OWNER TO postgres;

--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 244
-- Name: secciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secciones_id_seq OWNED BY public.secciones.id;


--
-- TOC entry 222 (class 1259 OID 16965)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17064)
-- Name: trayectos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trayectos (
    id bigint NOT NULL,
    valor_trayecto integer,
    id_pnf bigint NOT NULL
);


ALTER TABLE public.trayectos OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 17063)
-- Name: trayectos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trayectos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trayectos_id_seq OWNER TO postgres;

--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 242
-- Name: trayectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trayectos_id_seq OWNED BY public.trayectos.id;


--
-- TOC entry 235 (class 1259 OID 17032)
-- Name: ubicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicacion (
    id bigint NOT NULL,
    nombre_ubicacion character varying(255) NOT NULL
);


ALTER TABLE public.ubicacion OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17031)
-- Name: ubicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicacion_id_seq OWNER TO postgres;

--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 234
-- Name: ubicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicacion_id_seq OWNED BY public.ubicacion.id;


--
-- TOC entry 241 (class 1259 OID 17055)
-- Name: unidad_curricular; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidad_curricular (
    id bigint NOT NULL,
    nombre_unidad_curricular character varying(255),
    descripcion_unidad_curricular character varying(400),
    carga_horas integer NOT NULL
);


ALTER TABLE public.unidad_curricular OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 17054)
-- Name: unidad_curricular_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unidad_curricular_id_seq OWNER TO postgres;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 240
-- Name: unidad_curricular_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unidad_curricular_id_seq OWNED BY public.unidad_curricular.id;


--
-- TOC entry 220 (class 1259 OID 16947)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nombres character varying(255),
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    direccion character varying(255),
    password character varying(255),
    telefono_movil character varying(255),
    telefono_local character varying(255),
    fecha_nacimiento date,
    genero character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT users_genero_check CHECK (((genero)::text = ANY ((ARRAY['masculino'::character varying, 'femenino'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16946)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4765 (class 2604 OID 17120)
-- Name: administradores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores ALTER COLUMN id SET DEFAULT nextval('public.administradores_id_seq'::regclass);


--
-- TOC entry 4756 (class 2604 OID 17021)
-- Name: categoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 17138)
-- Name: coordinadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores ALTER COLUMN id SET DEFAULT nextval('public.coordinadores_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 17028)
-- Name: dedicacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion ALTER COLUMN id SET DEFAULT nextval('public.dedicacion_id_seq'::regclass);


--
-- TOC entry 4754 (class 2604 OID 17009)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4767 (class 2604 OID 17161)
-- Name: horarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id SET DEFAULT nextval('public.horarios_id_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 16992)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4751 (class 2604 OID 16943)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4760 (class 2604 OID 17049)
-- Name: pnfs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs ALTER COLUMN id SET DEFAULT nextval('public.pnfs_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 17091)
-- Name: profesores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores ALTER COLUMN id SET DEFAULT nextval('public.profesores_id_seq'::regclass);


--
-- TOC entry 4768 (class 2604 OID 17168)
-- Name: r_horarios_unidad_curricular id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_horarios_unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.r_horarios_unidad_curricular_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 17185)
-- Name: r_profesores_unidad_curricular id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_profesores_unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.r_profesores_unidad_curricular_id_seq'::regclass);


--
-- TOC entry 4770 (class 2604 OID 17202)
-- Name: r_unidad_curricular_seccion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_unidad_curricular_seccion ALTER COLUMN id SET DEFAULT nextval('public.r_unidad_curricular_seccion_id_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 17042)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 17079)
-- Name: secciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones ALTER COLUMN id SET DEFAULT nextval('public.secciones_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 17067)
-- Name: trayectos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos ALTER COLUMN id SET DEFAULT nextval('public.trayectos_id_seq'::regclass);


--
-- TOC entry 4758 (class 2604 OID 17035)
-- Name: ubicacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion ALTER COLUMN id SET DEFAULT nextval('public.ubicacion_id_seq'::regclass);


--
-- TOC entry 4761 (class 2604 OID 17058)
-- Name: unidad_curricular id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.unidad_curricular_id_seq'::regclass);


--
-- TOC entry 4752 (class 2604 OID 16950)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5023 (class 0 OID 17117)
-- Dependencies: 249
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administradores (id, id_cedula, id_rol) FROM stdin;
\.


--
-- TOC entry 4997 (class 0 OID 16974)
-- Dependencies: 223
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- TOC entry 4998 (class 0 OID 16981)
-- Dependencies: 224
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5005 (class 0 OID 17018)
-- Dependencies: 231
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id, nombre_categoria) FROM stdin;
\.


--
-- TOC entry 5025 (class 0 OID 17135)
-- Dependencies: 251
-- Data for Name: coordinadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordinadores (id, id_cedula, id_ubicacion, id_pnf) FROM stdin;
\.


--
-- TOC entry 5007 (class 0 OID 17025)
-- Dependencies: 233
-- Data for Name: dedicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dedicacion (id, nombre_dedicacion) FROM stdin;
\.


--
-- TOC entry 5003 (class 0 OID 17006)
-- Dependencies: 229
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5027 (class 0 OID 17158)
-- Dependencies: 253
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (id, dia_horario, inicio_horario, final_horario) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 16998)
-- Dependencies: 227
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5000 (class 0 OID 16989)
-- Dependencies: 226
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 4992 (class 0 OID 16940)
-- Dependencies: 218
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_03_19_200000_tipos_estados	1
5	2025_03_19_200001_academica	1
6	2025_03_19_200002_autoridades	1
7	2025_03_19_200003_horarios	1
8	2025_03_19_200004_muchos_muchos	1
\.


--
-- TOC entry 4995 (class 0 OID 16958)
-- Dependencies: 221
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5013 (class 0 OID 17046)
-- Dependencies: 239
-- Data for Name: pnfs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pnfs (id, nombre_pnf, descripcion_pnf) FROM stdin;
\.


--
-- TOC entry 5021 (class 0 OID 17088)
-- Dependencies: 247
-- Data for Name: profesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesores (id, id_categoria, id_cedula, id_dedicacion, id_ubicacion, pre_grado, pos_grado, fecha_ingreso, disponibilidad) FROM stdin;
\.


--
-- TOC entry 5029 (class 0 OID 17165)
-- Dependencies: 255
-- Data for Name: r_horarios_unidad_curricular; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.r_horarios_unidad_curricular (id, id_horario, id_unidad_curricular) FROM stdin;
\.


--
-- TOC entry 5031 (class 0 OID 17182)
-- Dependencies: 257
-- Data for Name: r_profesores_unidad_curricular; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.r_profesores_unidad_curricular (id, id_profesores, id_unidad_curricular) FROM stdin;
\.


--
-- TOC entry 5033 (class 0 OID 17199)
-- Dependencies: 259
-- Data for Name: r_unidad_curricular_seccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.r_unidad_curricular_seccion (id, id_unidad_curricular, id_seccion) FROM stdin;
\.


--
-- TOC entry 5011 (class 0 OID 17039)
-- Dependencies: 237
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, tipo_rol) FROM stdin;
\.


--
-- TOC entry 5019 (class 0 OID 17076)
-- Dependencies: 245
-- Data for Name: secciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secciones (id, valor_seccion, id_trayecto) FROM stdin;
\.


--
-- TOC entry 4996 (class 0 OID 16965)
-- Dependencies: 222
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 5017 (class 0 OID 17064)
-- Dependencies: 243
-- Data for Name: trayectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trayectos (id, valor_trayecto, id_pnf) FROM stdin;
\.


--
-- TOC entry 5009 (class 0 OID 17032)
-- Dependencies: 235
-- Data for Name: ubicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicacion (id, nombre_ubicacion) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 17055)
-- Dependencies: 241
-- Data for Name: unidad_curricular; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unidad_curricular (id, nombre_unidad_curricular, descripcion_unidad_curricular, carga_horas) FROM stdin;
\.


--
-- TOC entry 4994 (class 0 OID 16947)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nombres, email, email_verified_at, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero, remember_token, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 248
-- Name: administradores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administradores_id_seq', 1, false);


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 230
-- Name: categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_id_seq', 1, false);


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 250
-- Name: coordinadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coordinadores_id_seq', 1, false);


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 232
-- Name: dedicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dedicacion_id_seq', 1, false);


--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 228
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 252
-- Name: horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_id_seq', 1, false);


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 225
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 217
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 8, true);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 238
-- Name: pnfs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pnfs_id_seq', 1, false);


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 246
-- Name: profesores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesores_id_seq', 1, false);


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 254
-- Name: r_horarios_unidad_curricular_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.r_horarios_unidad_curricular_id_seq', 1, false);


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 256
-- Name: r_profesores_unidad_curricular_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.r_profesores_unidad_curricular_id_seq', 1, false);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 258
-- Name: r_unidad_curricular_seccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.r_unidad_curricular_seccion_id_seq', 1, false);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 236
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 244
-- Name: secciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secciones_id_seq', 1, false);


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 242
-- Name: trayectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trayectos_id_seq', 1, false);


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 234
-- Name: ubicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicacion_id_seq', 1, false);


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 240
-- Name: unidad_curricular_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unidad_curricular_id_seq', 1, false);


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 4817 (class 2606 OID 17122)
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (id);


--
-- TOC entry 4787 (class 2606 OID 16987)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4785 (class 2606 OID 16980)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4798 (class 2606 OID 17023)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 17140)
-- Name: coordinadores coordinadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_pkey PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 17030)
-- Name: dedicacion dedicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion
    ADD CONSTRAINT dedicacion_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 17014)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 17016)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4822 (class 2606 OID 17163)
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 17004)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 16996)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 16945)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 16964)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4806 (class 2606 OID 17053)
-- Name: pnfs pnfs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 17095)
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 17170)
-- Name: r_horarios_unidad_curricular r_horarios_unidad_curricular_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_horarios_unidad_curricular
    ADD CONSTRAINT r_horarios_unidad_curricular_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 17187)
-- Name: r_profesores_unidad_curricular r_profesores_unidad_curricular_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_profesores_unidad_curricular
    ADD CONSTRAINT r_profesores_unidad_curricular_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 17204)
-- Name: r_unidad_curricular_seccion r_unidad_curricular_seccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_unidad_curricular_seccion
    ADD CONSTRAINT r_unidad_curricular_seccion_pkey PRIMARY KEY (id);


--
-- TOC entry 4804 (class 2606 OID 17044)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4812 (class 2606 OID 17081)
-- Name: secciones secciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 16971)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 17069)
-- Name: trayectos trayectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_pkey PRIMARY KEY (id);


--
-- TOC entry 4802 (class 2606 OID 17037)
-- Name: ubicacion ubicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 17062)
-- Name: unidad_curricular unidad_curricular_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidad_curricular
    ADD CONSTRAINT unidad_curricular_pkey PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 16957)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4777 (class 2606 OID 16955)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4815 (class 1259 OID 17133)
-- Name: administradores_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX administradores_id_index ON public.administradores USING btree (id);


--
-- TOC entry 4818 (class 1259 OID 17156)
-- Name: coordinadores_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX coordinadores_id_index ON public.coordinadores USING btree (id);


--
-- TOC entry 4790 (class 1259 OID 16997)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4780 (class 1259 OID 16973)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4783 (class 1259 OID 16972)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 4835 (class 2606 OID 17123)
-- Name: administradores administradores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(id);


--
-- TOC entry 4836 (class 2606 OID 17128)
-- Name: administradores administradores_id_rol_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_id_rol_foreign FOREIGN KEY (id_rol) REFERENCES public.roles(id);


--
-- TOC entry 4837 (class 2606 OID 17141)
-- Name: coordinadores coordinadores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(id);


--
-- TOC entry 4838 (class 2606 OID 17151)
-- Name: coordinadores coordinadores_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id);


--
-- TOC entry 4839 (class 2606 OID 17146)
-- Name: coordinadores coordinadores_id_ubicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_ubicacion_foreign FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id);


--
-- TOC entry 4831 (class 2606 OID 17096)
-- Name: profesores profesores_id_categoria_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_categoria_foreign FOREIGN KEY (id_categoria) REFERENCES public.categoria(id);


--
-- TOC entry 4832 (class 2606 OID 17101)
-- Name: profesores profesores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(id);


--
-- TOC entry 4833 (class 2606 OID 17106)
-- Name: profesores profesores_id_dedicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_dedicacion_foreign FOREIGN KEY (id_dedicacion) REFERENCES public.dedicacion(id);


--
-- TOC entry 4834 (class 2606 OID 17111)
-- Name: profesores profesores_id_ubicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_ubicacion_foreign FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id);


--
-- TOC entry 4840 (class 2606 OID 17171)
-- Name: r_horarios_unidad_curricular r_horarios_unidad_curricular_id_horario_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_horarios_unidad_curricular
    ADD CONSTRAINT r_horarios_unidad_curricular_id_horario_foreign FOREIGN KEY (id_horario) REFERENCES public.horarios(id);


--
-- TOC entry 4841 (class 2606 OID 17176)
-- Name: r_horarios_unidad_curricular r_horarios_unidad_curricular_id_unidad_curricular_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_horarios_unidad_curricular
    ADD CONSTRAINT r_horarios_unidad_curricular_id_unidad_curricular_foreign FOREIGN KEY (id_unidad_curricular) REFERENCES public.unidad_curricular(id);


--
-- TOC entry 4842 (class 2606 OID 17188)
-- Name: r_profesores_unidad_curricular r_profesores_unidad_curricular_id_profesores_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_profesores_unidad_curricular
    ADD CONSTRAINT r_profesores_unidad_curricular_id_profesores_foreign FOREIGN KEY (id_profesores) REFERENCES public.profesores(id);


--
-- TOC entry 4843 (class 2606 OID 17193)
-- Name: r_profesores_unidad_curricular r_profesores_unidad_curricular_id_unidad_curricular_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_profesores_unidad_curricular
    ADD CONSTRAINT r_profesores_unidad_curricular_id_unidad_curricular_foreign FOREIGN KEY (id_unidad_curricular) REFERENCES public.unidad_curricular(id);


--
-- TOC entry 4844 (class 2606 OID 17210)
-- Name: r_unidad_curricular_seccion r_unidad_curricular_seccion_id_seccion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_unidad_curricular_seccion
    ADD CONSTRAINT r_unidad_curricular_seccion_id_seccion_foreign FOREIGN KEY (id_seccion) REFERENCES public.secciones(id);


--
-- TOC entry 4845 (class 2606 OID 17205)
-- Name: r_unidad_curricular_seccion r_unidad_curricular_seccion_id_unidad_curricular_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.r_unidad_curricular_seccion
    ADD CONSTRAINT r_unidad_curricular_seccion_id_unidad_curricular_foreign FOREIGN KEY (id_unidad_curricular) REFERENCES public.unidad_curricular(id);


--
-- TOC entry 4830 (class 2606 OID 17082)
-- Name: secciones secciones_id_trayecto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_id_trayecto_foreign FOREIGN KEY (id_trayecto) REFERENCES public.trayectos(id);


--
-- TOC entry 4829 (class 2606 OID 17070)
-- Name: trayectos trayectos_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id);


-- Completed on 2025-03-21 14:34:31

--
-- PostgreSQL database dump complete
--

