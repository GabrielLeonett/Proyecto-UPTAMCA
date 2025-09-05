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

CREATE OR REPLACE VIEW public.profesores_informacion_completa
    AS
     SELECT 
    u.nombres,
    u.apellidos,
    u.cedula::text AS cedula,
    u.telefono_movil,
    u.telefono_local,
    u.fecha_nacimiento,
    u.genero,
    u.email,
    pr.fecha_ingreso,
    ( SELECT dedicaciones.nombre_dedicacion
           FROM dedicaciones
          WHERE dedicaciones.id_dedicacion = (( SELECT relacion_dedicacion_profesor.dedicacion_id
                   FROM relacion_dedicacion_profesor
                  WHERE relacion_dedicacion_profesor.profesor_id = pr.id_profesor AND relacion_dedicacion_profesor.fecha_fin IS NULL))) AS dedicacion,
    ( SELECT categorias.nombre_categoria
           FROM categorias
          WHERE categorias.id_categoria = (( SELECT relacion_categoria_profesor.categoria_id
                   FROM relacion_categoria_profesor
                  WHERE relacion_categoria_profesor.profesor_id = pr.id_profesor AND relacion_categoria_profesor.fecha_fin IS NULL))) AS categoria,
    ARRAY( SELECT areas_de_conocimiento.nombre_area_conocimiento
           FROM areas_de_conocimiento
          WHERE (areas_de_conocimiento.id_area_conocimiento IN ( SELECT profesor_area_conocimiento.area_id
                   FROM profesor_area_conocimiento
                  WHERE profesor_area_conocimiento.profesor_id = pr.id_profesor))) AS areas_de_conocimiento,
    ARRAY( SELECT format('%s %s'::text, pre_grado.tipo_pre_grado, pre_grado.nombre_pre_grado) AS format
           FROM pre_grado
          WHERE (pre_grado.id_pre_grado IN ( SELECT relacion_profesor_pre_grado.pre_grado_id
                   FROM relacion_profesor_pre_grado
                  WHERE relacion_profesor_pre_grado.profesor_id = pr.id_profesor))) AS pre_grados,
    ARRAY( SELECT format('%s %s'::text, pos_grado.tipo_pos_grado, pos_grado.nombre_pos_grado) AS format
           FROM pos_grado
          WHERE (pos_grado.id_pos_grado IN ( SELECT relacion_profesor_pos_grado.pos_grado_id
                   FROM relacion_profesor_pos_grado
                  WHERE relacion_profesor_pos_grado.profesor_id = pr.id_profesor))) AS pos_grados,
    (( SELECT dedicaciones.horas_docencia_semanales
           FROM dedicaciones
          WHERE dedicaciones.id_dedicacion = (( SELECT relacion_dedicacion_profesor.dedicacion_id
                   FROM relacion_dedicacion_profesor
                  WHERE relacion_dedicacion_profesor.profesor_id = pr.id_profesor AND relacion_dedicacion_profesor.fecha_fin IS NULL)))) - COALESCE(( SELECT sum(h.hora_fin - h.hora_inicio) AS sum
           FROM horarios h
          WHERE h.profesor_id = pr.id_profesor), '00:00:00'::interval) AS disponibilidad
   FROM profesores pr
     JOIN users u ON pr.id_cedula = u.cedula;

-- Completed on 2025-06-24 19:22:33

--
-- PostgreSQL database dump complete
--

