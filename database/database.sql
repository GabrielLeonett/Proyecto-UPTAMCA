PGDMP  /                     }            proyecto_uptamca    17.4    17.4 U    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16385    proyecto_uptamca    DATABASE     v   CREATE DATABASE proyecto_uptamca WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'es-ES';
     DROP DATABASE proyecto_uptamca;
                     postgres    false            �            1259    17117    administradores    TABLE     {   CREATE TABLE public.administradores (
    id bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_rol bigint NOT NULL
);
 #   DROP TABLE public.administradores;
       public         heap r       postgres    false            �            1259    17116    administradores_id_seq    SEQUENCE        CREATE SEQUENCE public.administradores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.administradores_id_seq;
       public               postgres    false    249            �           0    0    administradores_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.administradores_id_seq OWNED BY public.administradores.id;
          public               postgres    false    248            �            1259    16974    cache    TABLE     �   CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);
    DROP TABLE public.cache;
       public         heap r       postgres    false            �            1259    16981    cache_locks    TABLE     �   CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);
    DROP TABLE public.cache_locks;
       public         heap r       postgres    false            �            1259    17018 	   categoria    TABLE     p   CREATE TABLE public.categoria (
    id bigint NOT NULL,
    nombre_categoria character varying(255) NOT NULL
);
    DROP TABLE public.categoria;
       public         heap r       postgres    false            �            1259    17017    categoria_id_seq    SEQUENCE     y   CREATE SEQUENCE public.categoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.categoria_id_seq;
       public               postgres    false    231            �           0    0    categoria_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.categoria_id_seq OWNED BY public.categoria.id;
          public               postgres    false    230            �            1259    17135    coordinadores    TABLE     �   CREATE TABLE public.coordinadores (
    id bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_ubicacion bigint NOT NULL,
    id_pnf bigint NOT NULL
);
 !   DROP TABLE public.coordinadores;
       public         heap r       postgres    false            �            1259    17134    coordinadores_id_seq    SEQUENCE     }   CREATE SEQUENCE public.coordinadores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.coordinadores_id_seq;
       public               postgres    false    251            �           0    0    coordinadores_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.coordinadores_id_seq OWNED BY public.coordinadores.id;
          public               postgres    false    250            �            1259    17025 
   dedicacion    TABLE     r   CREATE TABLE public.dedicacion (
    id bigint NOT NULL,
    nombre_dedicacion character varying(255) NOT NULL
);
    DROP TABLE public.dedicacion;
       public         heap r       postgres    false            �            1259    17024    dedicacion_id_seq    SEQUENCE     z   CREATE SEQUENCE public.dedicacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.dedicacion_id_seq;
       public               postgres    false    233            �           0    0    dedicacion_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.dedicacion_id_seq OWNED BY public.dedicacion.id;
          public               postgres    false    232            �            1259    17006    failed_jobs    TABLE     &  CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.failed_jobs;
       public         heap r       postgres    false            �            1259    17005    failed_jobs_id_seq    SEQUENCE     {   CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.failed_jobs_id_seq;
       public               postgres    false    229            �           0    0    failed_jobs_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;
          public               postgres    false    228            �            1259    17158    horarios    TABLE     �   CREATE TABLE public.horarios (
    id bigint NOT NULL,
    dia_horario character varying(10),
    inicio_horario time(0) without time zone,
    final_horario time(0) without time zone
);
    DROP TABLE public.horarios;
       public         heap r       postgres    false            �            1259    17157    horarios_id_seq    SEQUENCE     x   CREATE SEQUENCE public.horarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.horarios_id_seq;
       public               postgres    false    253            �           0    0    horarios_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.horarios_id_seq OWNED BY public.horarios.id;
          public               postgres    false    252            �            1259    16998    job_batches    TABLE     d  CREATE TABLE public.job_batches (
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
    DROP TABLE public.job_batches;
       public         heap r       postgres    false            �            1259    16989    jobs    TABLE     �   CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);
    DROP TABLE public.jobs;
       public         heap r       postgres    false            �            1259    16988    jobs_id_seq    SEQUENCE     t   CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.jobs_id_seq;
       public               postgres    false    226            �           0    0    jobs_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;
          public               postgres    false    225            �            1259    16940 
   migrations    TABLE     �   CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);
    DROP TABLE public.migrations;
       public         heap r       postgres    false            �            1259    16939    migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.migrations_id_seq;
       public               postgres    false    218            �           0    0    migrations_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
          public               postgres    false    217            �            1259    16958    password_reset_tokens    TABLE     �   CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);
 )   DROP TABLE public.password_reset_tokens;
       public         heap r       postgres    false            �            1259    17046    pnfs    TABLE     �   CREATE TABLE public.pnfs (
    id bigint NOT NULL,
    nombre_pnf character varying(255),
    descripcion_pnf character varying(400)
);
    DROP TABLE public.pnfs;
       public         heap r       postgres    false            �            1259    17045    pnfs_id_seq    SEQUENCE     t   CREATE SEQUENCE public.pnfs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.pnfs_id_seq;
       public               postgres    false    239            �           0    0    pnfs_id_seq    SEQUENCE OWNED BY     ;   ALTER SEQUENCE public.pnfs_id_seq OWNED BY public.pnfs.id;
          public               postgres    false    238            �            1259    17088 
   profesores    TABLE     A  CREATE TABLE public.profesores (
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
    DROP TABLE public.profesores;
       public         heap r       postgres    false            �            1259    17087    profesores_id_seq    SEQUENCE     z   CREATE SEQUENCE public.profesores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.profesores_id_seq;
       public               postgres    false    247            �           0    0    profesores_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.profesores_id_seq OWNED BY public.profesores.id;
          public               postgres    false    246            �            1259    17165    r_horarios_unidad_curricular    TABLE     �   CREATE TABLE public.r_horarios_unidad_curricular (
    id bigint NOT NULL,
    id_horario bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL
);
 0   DROP TABLE public.r_horarios_unidad_curricular;
       public         heap r       postgres    false            �            1259    17164 #   r_horarios_unidad_curricular_id_seq    SEQUENCE     �   CREATE SEQUENCE public.r_horarios_unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE public.r_horarios_unidad_curricular_id_seq;
       public               postgres    false    255            �           0    0 #   r_horarios_unidad_curricular_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE public.r_horarios_unidad_curricular_id_seq OWNED BY public.r_horarios_unidad_curricular.id;
          public               postgres    false    254                       1259    17182    r_profesores_unidad_curricular    TABLE     �   CREATE TABLE public.r_profesores_unidad_curricular (
    id bigint NOT NULL,
    id_profesores bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL
);
 2   DROP TABLE public.r_profesores_unidad_curricular;
       public         heap r       postgres    false                        1259    17181 %   r_profesores_unidad_curricular_id_seq    SEQUENCE     �   CREATE SEQUENCE public.r_profesores_unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 <   DROP SEQUENCE public.r_profesores_unidad_curricular_id_seq;
       public               postgres    false    257            �           0    0 %   r_profesores_unidad_curricular_id_seq    SEQUENCE OWNED BY     o   ALTER SEQUENCE public.r_profesores_unidad_curricular_id_seq OWNED BY public.r_profesores_unidad_curricular.id;
          public               postgres    false    256                       1259    17199    r_unidad_curricular_seccion    TABLE     �   CREATE TABLE public.r_unidad_curricular_seccion (
    id bigint NOT NULL,
    id_unidad_curricular bigint NOT NULL,
    id_seccion bigint NOT NULL
);
 /   DROP TABLE public.r_unidad_curricular_seccion;
       public         heap r       postgres    false                       1259    17198 "   r_unidad_curricular_seccion_id_seq    SEQUENCE     �   CREATE SEQUENCE public.r_unidad_curricular_seccion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE public.r_unidad_curricular_seccion_id_seq;
       public               postgres    false    259            �           0    0 "   r_unidad_curricular_seccion_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE public.r_unidad_curricular_seccion_id_seq OWNED BY public.r_unidad_curricular_seccion.id;
          public               postgres    false    258            �            1259    17039    roles    TABLE     U   CREATE TABLE public.roles (
    id bigint NOT NULL,
    tipo_rol integer NOT NULL
);
    DROP TABLE public.roles;
       public         heap r       postgres    false            �            1259    17038    roles_id_seq    SEQUENCE     u   CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    237            �           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    236            �            1259    17076 	   secciones    TABLE     v   CREATE TABLE public.secciones (
    id bigint NOT NULL,
    valor_seccion integer,
    id_trayecto bigint NOT NULL
);
    DROP TABLE public.secciones;
       public         heap r       postgres    false            �            1259    17075    secciones_id_seq    SEQUENCE     y   CREATE SEQUENCE public.secciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.secciones_id_seq;
       public               postgres    false    245            �           0    0    secciones_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.secciones_id_seq OWNED BY public.secciones.id;
          public               postgres    false    244            �            1259    16965    sessions    TABLE     �   CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);
    DROP TABLE public.sessions;
       public         heap r       postgres    false            �            1259    17064 	   trayectos    TABLE     r   CREATE TABLE public.trayectos (
    id bigint NOT NULL,
    valor_trayecto integer,
    id_pnf bigint NOT NULL
);
    DROP TABLE public.trayectos;
       public         heap r       postgres    false            �            1259    17063    trayectos_id_seq    SEQUENCE     y   CREATE SEQUENCE public.trayectos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.trayectos_id_seq;
       public               postgres    false    243            �           0    0    trayectos_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.trayectos_id_seq OWNED BY public.trayectos.id;
          public               postgres    false    242            �            1259    17032 	   ubicacion    TABLE     p   CREATE TABLE public.ubicacion (
    id bigint NOT NULL,
    nombre_ubicacion character varying(255) NOT NULL
);
    DROP TABLE public.ubicacion;
       public         heap r       postgres    false            �            1259    17031    ubicacion_id_seq    SEQUENCE     y   CREATE SEQUENCE public.ubicacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.ubicacion_id_seq;
       public               postgres    false    235            �           0    0    ubicacion_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.ubicacion_id_seq OWNED BY public.ubicacion.id;
          public               postgres    false    234            �            1259    17055    unidad_curricular    TABLE     �   CREATE TABLE public.unidad_curricular (
    id bigint NOT NULL,
    nombre_unidad_curricular character varying(255),
    descripcion_unidad_curricular character varying(400),
    carga_horas integer NOT NULL
);
 %   DROP TABLE public.unidad_curricular;
       public         heap r       postgres    false            �            1259    17054    unidad_curricular_id_seq    SEQUENCE     �   CREATE SEQUENCE public.unidad_curricular_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.unidad_curricular_id_seq;
       public               postgres    false    241            �           0    0    unidad_curricular_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.unidad_curricular_id_seq OWNED BY public.unidad_curricular.id;
          public               postgres    false    240            �            1259    16947    users    TABLE     �  CREATE TABLE public.users (
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
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16946    users_id_seq    SEQUENCE     u   CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    220            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    219            �           2604    17120    administradores id    DEFAULT     x   ALTER TABLE ONLY public.administradores ALTER COLUMN id SET DEFAULT nextval('public.administradores_id_seq'::regclass);
 A   ALTER TABLE public.administradores ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    249    248    249            �           2604    17021    categoria id    DEFAULT     l   ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);
 ;   ALTER TABLE public.categoria ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    230    231    231            �           2604    17138    coordinadores id    DEFAULT     t   ALTER TABLE ONLY public.coordinadores ALTER COLUMN id SET DEFAULT nextval('public.coordinadores_id_seq'::regclass);
 ?   ALTER TABLE public.coordinadores ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    250    251    251            �           2604    17028    dedicacion id    DEFAULT     n   ALTER TABLE ONLY public.dedicacion ALTER COLUMN id SET DEFAULT nextval('public.dedicacion_id_seq'::regclass);
 <   ALTER TABLE public.dedicacion ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    232    233            �           2604    17009    failed_jobs id    DEFAULT     p   ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);
 =   ALTER TABLE public.failed_jobs ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    229    229            �           2604    17161    horarios id    DEFAULT     j   ALTER TABLE ONLY public.horarios ALTER COLUMN id SET DEFAULT nextval('public.horarios_id_seq'::regclass);
 :   ALTER TABLE public.horarios ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    253    252    253            �           2604    16992    jobs id    DEFAULT     b   ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);
 6   ALTER TABLE public.jobs ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    16943    migrations id    DEFAULT     n   ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
 <   ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    17049    pnfs id    DEFAULT     b   ALTER TABLE ONLY public.pnfs ALTER COLUMN id SET DEFAULT nextval('public.pnfs_id_seq'::regclass);
 6   ALTER TABLE public.pnfs ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    238    239    239            �           2604    17091    profesores id    DEFAULT     n   ALTER TABLE ONLY public.profesores ALTER COLUMN id SET DEFAULT nextval('public.profesores_id_seq'::regclass);
 <   ALTER TABLE public.profesores ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    246    247    247            �           2604    17168    r_horarios_unidad_curricular id    DEFAULT     �   ALTER TABLE ONLY public.r_horarios_unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.r_horarios_unidad_curricular_id_seq'::regclass);
 N   ALTER TABLE public.r_horarios_unidad_curricular ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    254    255    255            �           2604    17185 !   r_profesores_unidad_curricular id    DEFAULT     �   ALTER TABLE ONLY public.r_profesores_unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.r_profesores_unidad_curricular_id_seq'::regclass);
 P   ALTER TABLE public.r_profesores_unidad_curricular ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    256    257    257            �           2604    17202    r_unidad_curricular_seccion id    DEFAULT     �   ALTER TABLE ONLY public.r_unidad_curricular_seccion ALTER COLUMN id SET DEFAULT nextval('public.r_unidad_curricular_seccion_id_seq'::regclass);
 M   ALTER TABLE public.r_unidad_curricular_seccion ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    259    258    259            �           2604    17042    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    236    237            �           2604    17079    secciones id    DEFAULT     l   ALTER TABLE ONLY public.secciones ALTER COLUMN id SET DEFAULT nextval('public.secciones_id_seq'::regclass);
 ;   ALTER TABLE public.secciones ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    245    245            �           2604    17067    trayectos id    DEFAULT     l   ALTER TABLE ONLY public.trayectos ALTER COLUMN id SET DEFAULT nextval('public.trayectos_id_seq'::regclass);
 ;   ALTER TABLE public.trayectos ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    243    242    243            �           2604    17035    ubicacion id    DEFAULT     l   ALTER TABLE ONLY public.ubicacion ALTER COLUMN id SET DEFAULT nextval('public.ubicacion_id_seq'::regclass);
 ;   ALTER TABLE public.ubicacion ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    235    234    235            �           2604    17058    unidad_curricular id    DEFAULT     |   ALTER TABLE ONLY public.unidad_curricular ALTER COLUMN id SET DEFAULT nextval('public.unidad_curricular_id_seq'::regclass);
 C   ALTER TABLE public.unidad_curricular ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    241    240    241            �           2604    16950    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220           