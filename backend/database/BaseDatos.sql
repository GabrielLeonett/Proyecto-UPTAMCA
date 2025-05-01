-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- TOC entry 4756 (class 2604 OID 17021)
-- Name: categoria id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 17028)
-- Name: dedicacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion ALTER COLUMN id SET DEFAULT nextval('public.dedicacion_id_seq'::regclass);


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
-- TOC entry 4767 (class 2604 OID 17161)
-- Name: horarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id SET DEFAULT nextval('public.horarios_id_seq'::regclass);


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
-- TOC entry 4765 (class 2604 OID 17120)
-- Name: administradores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores ALTER COLUMN id SET DEFAULT nextval('public.administradores_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 17138)
-- Name: coordinadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores ALTER COLUMN id SET DEFAULT nextval('public.coordinadores_id_seq'::regclass);


--
-- TOC entry 4798 (class 2606 OID 17023)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id);


--
-- TOC entry 4800 (class 2606 OID 17030)
-- Name: dedicacion dedicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion
    ADD CONSTRAINT dedicacion_pkey PRIMARY KEY (id);


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
-- TOC entry 4822 (class 2606 OID 17163)
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);


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
-- TOC entry 4817 (class 2606 OID 17122)
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 17140)
-- Name: coordinadores coordinadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_pkey PRIMARY KEY (id);


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
-- TOC entry 4831 (class 2606 OID 17096)
-- Name: profesores profesores_id_categoria_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_categoria_foreign FOREIGN KEY (id_categoria) REFERENCES public.categoria(id);


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