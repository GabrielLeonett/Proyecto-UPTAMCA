--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4


-- TOC entry 249 (class 1259 OID 77165)
-- Name: horarios_completos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.horarios_completos AS
 SELECT h.id_horario,
    h.hora_inicio,
    h.hora_fin,
    concat(u.nombres, ' ', u.apellidos) AS nombre_completo_profesor,
    uc.nombre_unidad_curricular,
    s.valor_seccion,
    tr.valor_trayecto,
    tur.nombre_turno,
    pnf.nombre_pnf,
    h.dia_semana,
    uc.codigo_unidad AS codigo_uc,
    pnf.codigo_pnf
   FROM (((((((public.horarios h
     JOIN public.profesores p ON ((h.profesor_id = p.id_profesor)))
     JOIN public.users u ON ((p.id_cedula = u.cedula)))
     JOIN public.unidades_curriculares uc ON ((h.unidad_curricular_id = uc.id_unidad_curricular)))
     JOIN public.secciones s ON ((h.seccion_id = s.id_seccion)))
     JOIN public.turnos tur ON ((s.id_turno = tur.id_turno)))
     JOIN public.trayectos tr ON ((uc.id_trayecto = tr.id_trayecto)))
     JOIN public.pnfs pnf ON ((tr.id_pnf = pnf.id_pnf)));


ALTER VIEW public.horarios_completos OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 101474)
-- Name: profesores_informacion_completa; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.profesores_informacion_completa AS
 SELECT (p.id_cedula)::character varying AS id,
    (u.nombres)::character varying AS nombres,
    (u.apellidos)::character varying AS apellidos,
    (u.email)::character varying AS email,
    (d.nombre_dedicacion)::character varying AS dedicacion,
    (c.nombre_categoria)::character varying AS categoria,
    (p.post_grado)::character varying AS post_grado,
    (p.pre_grado)::character varying AS pre_grado,
    (ub.nombre_ubicacion)::character varying AS ubicacion,
    (p.area_de_conocimiento)::character varying AS area_de_conocimiento,
    p.fecha_ingreso,
    (u.genero)::character varying AS genero,
    (d.horas_docencia_semanales - ( SELECT COALESCE(sum((h2.hora_fin - h2.hora_inicio)), '00:00:00'::interval) AS "coalesce"
           FROM public.horarios h2
          WHERE (h2.profesor_id = p.id_profesor))) AS disponibilidad
   FROM ((((public.profesores p
     JOIN public.users u ON ((p.id_cedula = u.cedula)))
     LEFT JOIN public.dedicaciones d ON ((p.id_dedicacion = d.id_dedicacion)))
     LEFT JOIN public.categorias c ON ((p.id_categoria = c.id_categoria)))
     LEFT JOIN public.ubicaciones ub ON ((p.id_ubicacion = ub.id_ubicacion)));


ALTER VIEW public.profesores_informacion_completa OWNER TO postgres;

-- Completed on 2025-06-24 19:22:33

--
-- PostgreSQL database dump complete
--

