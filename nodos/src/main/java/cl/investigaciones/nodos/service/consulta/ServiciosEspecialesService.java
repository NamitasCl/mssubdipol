package cl.investigaciones.nodos.service.consulta;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaDroga;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaVehiculo;
import cl.investigaciones.nodos.dto.consulta.*;
import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import cl.investigaciones.nodos.mapper.consulta.FichaPersonaSimpleMapper;
import cl.investigaciones.nodos.repository.auditoriamemos.MemoRevisadoRepository;
import cl.investigaciones.nodos.repository.consulta.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ServiciosEspecialesService {

    private final FichaMemoRepository memoRepo;
    private final ListaUnidadRepository unidadRepo;
    private final FichaPersonaRepository personaRepo;
    private final MemoRevisadoRepository memoRevisadoRepository;
    private final FichaPersonaSimpleMapper fichaPersonaSimpleMapper;
    private final FichaVehiculoRepository fichaVehiculoRepository;
    private final FichaDrogaRepository fichaDrogaRepository;


    public ServiciosEspecialesService(FichaMemoRepository memoRepo,
                                      ListaUnidadRepository unidadRepo,
                                      FichaPersonaRepository personaRepo,
                                      MemoRevisadoRepository memoRevisadoRepository,
                                      FichaPersonaSimpleMapper fichaPersonaSimpleMapper,
                                      FichaVehiculoRepository fichaVehiculoRepository,
                                      FichaDrogaRepository fichaDrogaRepository) {
        this.memoRepo = memoRepo;
        this.unidadRepo = unidadRepo;
        this.personaRepo = personaRepo;
        this.memoRevisadoRepository = memoRevisadoRepository;
        this.fichaPersonaSimpleMapper = fichaPersonaSimpleMapper;
        this.fichaVehiculoRepository = fichaVehiculoRepository;
        this.fichaDrogaRepository = fichaDrogaRepository;
    }


    @Transactional(readOnly = true)
    public List<FichaMemoDTO> listarMemos(FichaMemoRequestDTO solicitud) {

        if (solicitud == null) return List.of();

        // Fechas en UTC (defensivo con null). Now the DTO already carries an OffsetDateTime in UTC.
        OffsetDateTime fechaInicio = solicitud.getFechaInicioUtc();
        OffsetDateTime fechaTermino = solicitud.getFechaTerminoUtc();
        // Normalizar a UTC por seguridad
        if (fechaInicio != null) fechaInicio = fechaInicio.withOffsetSameInstant(java.time.ZoneOffset.UTC);
        if (fechaTermino != null) fechaTermino = fechaTermino.withOffsetSameInstant(java.time.ZoneOffset.UTC);

        // Si el picker del frontend envía precisión a minutos (step=60), hacemos el término inclusivo al final del minuto
        if (fechaTermino != null && fechaTermino.getSecond() == 0 && fechaTermino.getNano() == 0) {
            fechaTermino = fechaTermino.plusMinutes(1).minusNanos(1);
        }

        String tipoMemo = solicitud.getTipoMemo();
        boolean filtraTipo = tipoMemo != null && !tipoMemo.trim().isEmpty() && !"TODOS".equals(tipoMemo);

        // Filtro de detenidos (DB-level)
        boolean filtroDetenidos = solicitud.getFiltroDetenidos() != null && Boolean.TRUE.equals(solicitud.getFiltroDetenidos());
        List<Long> idsMemosConDetenidos = null;
        if (filtroDetenidos) {
            idsMemosConDetenidos = obtenerIdsMemosConDetenidos(fechaInicio, fechaTermino, solicitud.getTipoFecha());
            if (idsMemosConDetenidos == null || idsMemosConDetenidos.isEmpty()) {
                return List.of();
            }
        }

        // ⭐ NUEVO: Procesamiento de identificadoresUnidades (IDs de idUnidad)
        List<Long> unidadIdsDesdeIdentificadores = null;
        if (solicitud.getIdentificadoresUnidades() != null && !solicitud.getIdentificadoresUnidades().isEmpty()) {
            System.out.println("[DEBUG] Procesando identificadoresUnidades: " + solicitud.getIdentificadoresUnidades());

            // Convertir los IDs a List<Long> si es necesario
            List<Long> identificadores = solicitud.getIdentificadoresUnidades();

            // Llamar al método del repositorio que convierte idUnidad -> id
            unidadIdsDesdeIdentificadores = unidadRepo.findIdsByIdUnidadIn(identificadores);

            System.out.println("[DEBUG] IDs de ListaUnidades obtenidos: " + unidadIdsDesdeIdentificadores);

            if (unidadIdsDesdeIdentificadores == null || unidadIdsDesdeIdentificadores.isEmpty()) {
                System.out.println("[WARN] No se encontraron unidades para los identificadores proporcionados");
                return List.of();
            }
        }

        // 1) Unificar unidad (string) + unidades (lista) en una sola lista de nombres únicos
        List<String> nombresUnidades = new ArrayList<>();
        if (solicitud.getUnidades() != null) {
            nombresUnidades.addAll(solicitud.getUnidades());
        }
        if (solicitud.getUnidad() != null && !solicitud.getUnidad().isBlank()) {
            nombresUnidades.add(solicitud.getUnidad());
        }
        // limpiar nulos/espacios y deduplicar case-insensitive
        nombresUnidades = nombresUnidades.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.collectingAndThen(
                        Collectors.toCollection(() -> new TreeSet<>(String.CASE_INSENSITIVE_ORDER)),
                        ArrayList::new
                ));

        List<FichaMemo> memos;

        // ⭐ PRIORIDAD A identificadoresUnidades si vienen
        if (unidadIdsDesdeIdentificadores != null && !unidadIdsDesdeIdentificadores.isEmpty()) {
            System.out.println("[DEBUG] Consultando memos con IDs de unidades: " + unidadIdsDesdeIdentificadores);

            if (filtroDetenidos) {
                memos = memoRepo.findByIdsAndUnidadIdIn(idsMemosConDetenidos, unidadIdsDesdeIdentificadores);
                if (filtraTipo) {
                    memos = memos.stream().filter(m -> tipoMemo.equals(m.getFormulario())).toList();
                }
            } else if (filtraTipo) {
                if (solicitud.getTipoFecha() != null && solicitud.getTipoFecha().equals("FECHA DEL HECHO")) {
                    memos = memoRepo.findByFormularioAndFechaBetweenAndUnidadIdIn(
                            tipoMemo, fechaInicio, fechaTermino, unidadIdsDesdeIdentificadores
                    );
                } else {
                    memos = memoRepo.findByFormularioAndCreatedAtBetweenAndUnidadIdIn(
                            tipoMemo, fechaInicio, fechaTermino, unidadIdsDesdeIdentificadores
                    );
                }
            } else {
                // No filtrar por tipo de memo: obtenemos por fecha y filtramos por unidades
                if (solicitud.getTipoFecha() != null && solicitud.getTipoFecha().equals("FECHA DEL HECHO")) {
                    List<FichaMemo> todosPorFecha = memoRepo.findByFechaBetween(fechaInicio, fechaTermino);
                    Set<Long> setUnidadIds = new HashSet<>(unidadIdsDesdeIdentificadores);
                    memos = todosPorFecha.stream()
                            .filter(m -> m.getUnidad() != null && m.getUnidad().getId() != null && setUnidadIds.contains(m.getUnidad().getId()))
                            .toList();
                } else {
                    List<FichaMemo> todosPorFecha = memoRepo.findByCreatedAtBetween(fechaInicio, fechaTermino);
                    Set<Long> setUnidadIds = new HashSet<>(unidadIdsDesdeIdentificadores);
                    memos = todosPorFecha.stream()
                            .filter(m -> m.getUnidad() != null && m.getUnidad().getId() != null && setUnidadIds.contains(m.getUnidad().getId()))
                            .toList();
                }
            }

        } else if (!nombresUnidades.isEmpty()) {
            // 2) Resolver cada unidad por nombre normalizado (tolerante a mayúsculas/espacios)
            List<Long> unidadIds = new ArrayList<>();
            for (String nombre : nombresUnidades) {
                var u = unidadRepo.findOneByNombreUnidadNormalized(nombre);
                if (u != null) {
                    unidadIds.add(u.getId());
                } else {
                    System.out.println("[WARN] Unidad no encontrada (normalizada) = '" + nombre + "'");
                }
            }

            if (unidadIds.isEmpty()) {
                return List.of();
            }

            // 3) Buscar memos para el set de unidades
            if (filtroDetenidos) {
                memos = memoRepo.findByIdsAndUnidadIdIn(idsMemosConDetenidos, unidadIds);
                if (filtraTipo) {
                    memos = memos.stream().filter(m -> tipoMemo.equals(m.getFormulario())).toList();
                }
            } else if (filtraTipo) {
                if (solicitud.getTipoFecha() != null && solicitud.getTipoFecha().equals("FECHA DEL HECHO")) {
                    memos = memoRepo.findByFormularioAndFechaBetweenAndUnidadIdIn(
                            tipoMemo, fechaInicio, fechaTermino, unidadIds
                    );
                } else {
                    memos = memoRepo.findByFormularioAndCreatedAtBetweenAndUnidadIdIn(
                            tipoMemo, fechaInicio, fechaTermino, unidadIds
                    );
                }
            } else {
                // No filtrar por tipo de memo: obtenemos por fecha y filtramos por unidades en memoria
                List<FichaMemo> todosPorFecha = memoRepo.findByFechaBetween(fechaInicio, fechaTermino);
                Set<Long> setUnidadIds = new HashSet<>(unidadIds);
                memos = todosPorFecha.stream()
                        .filter(m -> m.getUnidad() != null && m.getUnidad().getId() != null && setUnidadIds.contains(m.getUnidad().getId()))
                        .toList();
            }

        } else if (solicitud.getRegion() != null && !solicitud.getRegion().isBlank()) {
            // 4) (Opcional) Filtro por región si no se enviaron unidades
            List<Long> ids = unidadRepo.findIdsByNombreRegion(solicitud.getRegion().trim());
            if (ids == null || ids.isEmpty()) {
                return List.of();
            }
            if (filtroDetenidos) {
                memos = memoRepo.findByIdsAndUnidadIdIn(idsMemosConDetenidos, ids);
                if (filtraTipo) {
                    memos = memos.stream().filter(m -> tipoMemo.equals(m.getFormulario())).toList();
                }
            } else if (filtraTipo) {
                memos = memoRepo.findByFormularioAndFechaBetweenAndUnidadIdIn(
                        tipoMemo, fechaInicio, fechaTermino, ids
                );
            } else {
                List<FichaMemo> todosPorFecha = memoRepo.findByFechaBetween(fechaInicio, fechaTermino);
                Set<Long> setUnidadIds = new HashSet<>(ids);
                memos = todosPorFecha.stream()
                        .filter(m -> m.getUnidad() != null && m.getUnidad().getId() != null && setUnidadIds.contains(m.getUnidad().getId()))
                        .toList();
            }

        } else {
            // 5) Fallback: por fechas (todas las unidades)
            if (filtroDetenidos) {
                memos = memoRepo.findAllById(idsMemosConDetenidos);
                if (filtraTipo) {
                    memos = memos.stream().filter(m -> tipoMemo.equals(m.getFormulario())).toList();
                }
            } else if (filtraTipo) {
                if (solicitud.getTipoFecha() != null && solicitud.getTipoFecha().equals("FECHA DEL HECHO")) {
                    memos = memoRepo.findByFormularioAndFechaBetween(tipoMemo, fechaInicio, fechaTermino);
                } else {
                    // usar createdAt cuando es FECHA REGISTRO
                    memos = memoRepo.findByFormularioAndCreatedAtBetween(tipoMemo, fechaInicio, fechaTermino);
                }
            } else {
                if (solicitud.getTipoFecha() != null && solicitud.getTipoFecha().equals("FECHA DEL HECHO")) {
                    memos = memoRepo.findByFechaBetween(fechaInicio, fechaTermino);
                } else {
                    // usar createdAt cuando es FECHA REGISTRO
                    memos = memoRepo.findByCreatedAtBetween(fechaInicio, fechaTermino);
                }
            }
        }

        if (memos == null || memos.isEmpty()) {
            return List.of();
        }

        // ---- Mapping a DTO (igual que tenías, con null-safety puntual) ----
        return memos.stream().map(registro -> {
            FichaMemoDTO dto = new FichaMemoDTO();
            dto.setId(registro.getId());
            dto.setFormulario(registro.getFormulario());
            dto.setFecha(registro.getFecha());
            dto.setCreatedAt(registro.getCreatedAt());
            dto.setFolioBrain(registro.getFolioBrain());
            dto.setRuc(registro.getRuc());
            dto.setModusDescripcion(registro.getModusDescripcion());
            dto.setTipo(registro.getTipo());

            if (registro.getUnidad() != null) {
                ListaUnidadDTO unidadDto = new ListaUnidadDTO();
                unidadDto.setId(registro.getUnidad().getId());
                unidadDto.setNombreUnidad(registro.getUnidad().getNombreUnidad());
                dto.setUnidad(unidadDto);
            }

            if (registro.getFichaPersonas() != null) {
                dto.setFichaPersonas(registro.getFichaPersonas().stream()
                        .map(fichaPersonaSimpleMapper::toDto)
                        .toList());
            }

            if (registro.getFichaArmas() != null) {
                dto.setFichaArmas(registro.getFichaArmas().stream().map(arma -> {
                    FichaArmaDTO ar = new FichaArmaDTO();
                    ar.setSerieArma(arma.getSerieArma());
                    ar.setMarcaArma(arma.getMarcaArma());
                    ar.setTipoArma(arma.getTipoArma().toString());
                    return ar;
                }).toList());
            }

            if (registro.getFichaDineros() != null) {
                dto.setFichaDineros(registro.getFichaDineros().stream().map(dinero -> {
                    FichaDineroDTO din = new FichaDineroDTO();
                    din.setCalidad(dinero.getCalidad());
                    din.setMonto(dinero.getMonto());
                    din.setObs(dinero.getObs());
                    return din;
                }).toList());
            }

            if (registro.getFichaDrogas() != null) {
                dto.setFichaDrogas(registro.getFichaDrogas().stream().map(droga -> {
                    FichaDrogaDTO dro = new FichaDrogaDTO();
                    dro.setTipoDroga(droga.getTipoDroga());
                    dro.setCantidadDroga(droga.getCantidadDroga());
                    dro.setUnidadMedida(droga.getUnidadMedida());
                    dro.setObs(droga.getObs());
                    return dro;
                }).toList());
            }

            if (registro.getFichaFuncionarios() != null) {
                dto.setFichaFuncionarios(registro.getFichaFuncionarios().stream().map(funcionario -> {
                    FichaFuncionarioDTO fun = new FichaFuncionarioDTO();
                    fun.setFuncionario(funcionario.getFuncionario());
                    fun.setResponsabilidadMemo(funcionario.getResponsabilidadMemo());
                    return fun;
                }).toList());
            }

            if (registro.getFichaMuniciones() != null) {
                dto.setFichaMuniciones(registro.getFichaMuniciones().stream().map(municion -> {
                    FichaMunicionDTO mun = new FichaMunicionDTO();
                    mun.setObs(municion.getObs());
                    return mun;
                }).toList());
            }

            if (registro.getFichaVehiculos() != null) {
                dto.setFichaVehiculos(registro.getFichaVehiculos().stream().map(vehiculo -> {
                    FichaVehiculoDTO veh = new FichaVehiculoDTO();
                    veh.setPatente(vehiculo.getPatente());
                    veh.setMarca(vehiculo.getMarca() != null ? vehiculo.getMarca().toString() : null);
                    veh.setModelo(vehiculo.getModelo() != null ? vehiculo.getModelo().toString() : null);
                    veh.setCalidad(vehiculo.getCalidad());
                    veh.setObs(vehiculo.getObs());
                    return veh;
                }).toList());
            }

            if (registro.getFichaSitioSucesos() != null) {
                dto.setFichaSitioSucesos(registro.getFichaSitioSucesos().stream().map(fichaSs -> {
                    FichaSitioSucesoDTO sitio = new FichaSitioSucesoDTO();
                    sitio.setFechaConcurrenciaSs(fichaSs.getFechaConcurrenciaSs());
                    sitio.setCalle(fichaSs.getCalle());
                    sitio.setNumero(fichaSs.getNumero());
                    sitio.setDepto(fichaSs.getDepto());
                    sitio.setBlock(fichaSs.getBlock());
                    sitio.setComuna(fichaSs.getComuna());
                    sitio.setRegion(fichaSs.getRegion());
                    sitio.setTipoSitioSuceso(fichaSs.getTipoSitioSuceso());
                    return sitio;
                }).toList());
            }

            if (registro.getFichaOtrasEspecies() != null) {
                dto.setFichaOtrasEspecies(registro.getFichaOtrasEspecies().stream().map(oe -> {
                    FichaOtrasEspeciesDTO oeDto = new FichaOtrasEspeciesDTO();
                    oeDto.setId(oe.getId());
                    oeDto.setCalidad(oe.getCalidad());
                    oeDto.setDescripcion(oe.getDescripcion());
                    oeDto.setNue(oe.getNue());
                    oeDto.setCantidad(oe.getCantidad());
                    oeDto.setAvaluo(oe.getAvaluo());
                    oeDto.setUtilizadoComoArma(oe.getUtilizadoComoArma());
                    oeDto.setSitioSuceso(oe.getSitioSuceso());
                    return oeDto;
                }).toList());
            }

            return dto;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<FichaMemoDTO> listarMemosPorId(List<Long> ids) {

        List<Long> idMemos = ids;

        if (idMemos == null || idMemos.isEmpty()) {
            return List.of();
        }

        List<FichaMemo> memos = memoRepo.findAllByIdWithPersonasAndEstados(idMemos);

        // ---- Mapping a DTO (igual que tenías, con null-safety puntual) ----
        return memos.stream().map(registro -> {

            FichaMemoDTO dto = new FichaMemoDTO();
            dto.setId(registro.getId());
            dto.setFormulario(registro.getFormulario());
            dto.setFecha(registro.getFecha());
            dto.setCreatedAt(registro.getCreatedAt());
            dto.setFolioBrain(registro.getFolioBrain());
            dto.setRuc(registro.getRuc());
            dto.setModusDescripcion(registro.getModusDescripcion());
            dto.setTipo(registro.getTipo());

            if (registro.getUnidad() != null) {
                ListaUnidadDTO unidadDto = new ListaUnidadDTO();
                unidadDto.setId(registro.getUnidad().getId());
                unidadDto.setNombreUnidad(registro.getUnidad().getNombreUnidad());
                dto.setUnidad(unidadDto);
            }

            if (registro.getFichaPersonas() != null) {
                dto.setFichaPersonas(registro.getFichaPersonas().stream()
                        .map(fichaPersonaSimpleMapper::toDto)
                        .toList());
            }

            if (registro.getFichaArmas() != null) {
                dto.setFichaArmas(registro.getFichaArmas().stream().map(arma -> {
                    FichaArmaDTO ar = new FichaArmaDTO();
                    ar.setSerieArma(arma.getSerieArma());
                    ar.setMarcaArma(arma.getMarcaArma());
                    ar.setTipoArma(arma.getTipoArma().toString());
                    return ar;
                }).toList());
            }

            if (registro.getFichaDineros() != null) {
                dto.setFichaDineros(registro.getFichaDineros().stream().map(dinero -> {
                    FichaDineroDTO din = new FichaDineroDTO();
                    din.setCalidad(dinero.getCalidad());
                    din.setMonto(dinero.getMonto());
                    din.setObs(dinero.getObs());
                    return din;
                }).toList());
            }

            if (registro.getFichaDrogas() != null) {
                dto.setFichaDrogas(registro.getFichaDrogas().stream().map(droga -> {
                    FichaDrogaDTO dro = new FichaDrogaDTO();
                    dro.setTipoDroga(droga.getTipoDroga());
                    dro.setCantidadDroga(droga.getCantidadDroga());
                    dro.setUnidadMedida(droga.getUnidadMedida());
                    dro.setObs(droga.getObs());
                    return dro;
                }).toList());
            }

            if (registro.getFichaFuncionarios() != null) {
                dto.setFichaFuncionarios(registro.getFichaFuncionarios().stream().map(funcionario -> {
                    FichaFuncionarioDTO fun = new FichaFuncionarioDTO();
                    fun.setFuncionario(funcionario.getFuncionario());
                    fun.setResponsabilidadMemo(funcionario.getResponsabilidadMemo());
                    return fun;
                }).toList());
            }

            if (registro.getFichaMuniciones() != null) {
                dto.setFichaMuniciones(registro.getFichaMuniciones().stream().map(municion -> {
                    FichaMunicionDTO mun = new FichaMunicionDTO();
                    mun.setObs(municion.getObs());
                    return mun;
                }).toList());
            }

            if (registro.getFichaVehiculos() != null) {
                dto.setFichaVehiculos(registro.getFichaVehiculos().stream().map(vehiculo -> {
                    FichaVehiculoDTO veh = new FichaVehiculoDTO();
                    veh.setPatente(vehiculo.getPatente());
                    veh.setMarca(vehiculo.getMarca() != null ? vehiculo.getMarca().toString() : null);
                    veh.setModelo(vehiculo.getModelo() != null ? vehiculo.getModelo().toString() : null);
                    veh.setCalidad(vehiculo.getCalidad());
                    veh.setObs(vehiculo.getObs());
                    return veh;
                }).toList());
            }

            if (registro.getFichaSitioSucesos() != null) {
                dto.setFichaSitioSucesos(registro.getFichaSitioSucesos().stream().map(fichaSs -> {
                    FichaSitioSucesoDTO sitio = new FichaSitioSucesoDTO();
                    sitio.setFechaConcurrenciaSs(fichaSs.getFechaConcurrenciaSs());
                    sitio.setCalle(fichaSs.getCalle());
                    sitio.setNumero(fichaSs.getNumero());
                    sitio.setDepto(fichaSs.getDepto());
                    sitio.setBlock(fichaSs.getBlock());
                    sitio.setComuna(fichaSs.getComuna());
                    sitio.setRegion(fichaSs.getRegion());
                    sitio.setTipoSitioSuceso(fichaSs.getTipoSitioSuceso());
                    return sitio;
                }).toList());
            }

            if (registro.getFichaOtrasEspecies() != null) {
                dto.setFichaOtrasEspecies(registro.getFichaOtrasEspecies().stream().map(oe -> {
                    FichaOtrasEspeciesDTO oeDto = new FichaOtrasEspeciesDTO();
                    oeDto.setId(oe.getId());
                    oeDto.setCalidad(oe.getCalidad());
                    oeDto.setDescripcion(oe.getDescripcion());
                    oeDto.setNue(oe.getNue());
                    oeDto.setCantidad(oe.getCantidad());
                    oeDto.setAvaluo(oe.getAvaluo());
                    oeDto.setUtilizadoComoArma(oe.getUtilizadoComoArma());
                    oeDto.setSitioSuceso(oe.getSitioSuceso());
                    return oeDto;
                }).toList());
            }

            return dto;
        }).toList();

    }


    @Transactional(readOnly = true)
    public List<FichaMemoConEstadoDTO> listarMemosConEstado(FichaMemoRequestDTO solicitud) {
        List<FichaMemoDTO> base = listarMemos(solicitud);
        if (base == null || base.isEmpty()) return List.of();
        List<Long> ids = base.stream().map(FichaMemoDTO::getId).filter(Objects::nonNull).toList();
        Map<Long, MemoRevisado> porId = new HashMap<>();
        if (!ids.isEmpty()) {
            List<MemoRevisado> ultimos = memoRevisadoRepository.findUltimoPorMemoIdIn(ids);
            porId = ultimos.stream().collect(Collectors.toMap(r -> r.getMemo().getId(), r -> r, (a, b) -> a));
        }
        List<FichaMemoConEstadoDTO> res = new ArrayList<>();
        for (FichaMemoDTO dto : base) {
            FichaMemoConEstadoDTO fe = new FichaMemoConEstadoDTO();
            // copiar campos (por herencia ya están, pero debemos setear)
            fe.setId(dto.getId());
            fe.setFormulario(dto.getFormulario());
            fe.setFecha(dto.getFecha());
            fe.setCreatedAt(dto.getCreatedAt());
            fe.setFolioBrain(dto.getFolioBrain());
            fe.setRuc(dto.getRuc());
            fe.setModusDescripcion(dto.getModusDescripcion());
            fe.setTipo(dto.getTipo());
            fe.setUnidad(dto.getUnidad());
            fe.setFichaPersonas(dto.getFichaPersonas());
            fe.setFichaArmas(dto.getFichaArmas());
            fe.setFichaDineros(dto.getFichaDineros());
            fe.setFichaDrogas(dto.getFichaDrogas());
            fe.setFichaFuncionarios(dto.getFichaFuncionarios());
            fe.setFichaMuniciones(dto.getFichaMuniciones());
            fe.setFichaVehiculos(dto.getFichaVehiculos());
            fe.setFichaSitioSucesos(dto.getFichaSitioSucesos());
            fe.setFichaOtrasEspecies(dto.getFichaOtrasEspecies());

            MemoRevisado r = porId.get(dto.getId());
            if (r != null) {
                fe.setEstadoRevision(r.getEstado() != null ? r.getEstado().name() : "SIN_REVISAR");
                fe.setObservacionesRevision(r.getObservaciones());
                fe.setNombreRevisor(r.getNombreRevisor());
                fe.setUnidadRevisor(r.getUnidadRevisor());
                fe.setRolRevisor(r.getRolRevisor() != null ? r.getRolRevisor().name() : null);
                fe.setFechaRevision(r.getCreatedAt());
            } else {
                fe.setEstadoRevision("SIN_REVISAR");
            }
            res.add(fe);
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<FichaMemoConEstadoDTO> listarMemosPorIdConEstado(List<Long> ids) {
        List<FichaMemoDTO> base = listarMemosPorId(ids);
        if (base == null || base.isEmpty()) return List.of();
        List<Long> memoIds = base.stream().map(FichaMemoDTO::getId).filter(Objects::nonNull).toList();
        Map<Long, MemoRevisado> porId = new HashMap<>();
        if (!memoIds.isEmpty()) {
            List<MemoRevisado> ultimos = memoRevisadoRepository.findUltimoPorMemoIdIn(memoIds);
            porId = ultimos.stream().collect(Collectors.toMap(r -> r.getMemo().getId(), r -> r, (a, b) -> a));
        }
        List<FichaMemoConEstadoDTO> res = new ArrayList<>();
        for (FichaMemoDTO dto : base) {
            FichaMemoConEstadoDTO fe = new FichaMemoConEstadoDTO();
            fe.setId(dto.getId());
            fe.setFormulario(dto.getFormulario());
            fe.setFecha(dto.getFecha());
            fe.setCreatedAt(dto.getCreatedAt());
            fe.setFolioBrain(dto.getFolioBrain());
            fe.setRuc(dto.getRuc());
            fe.setModusDescripcion(dto.getModusDescripcion());
            fe.setTipo(dto.getTipo());
            fe.setUnidad(dto.getUnidad());
            fe.setFichaPersonas(dto.getFichaPersonas());
            fe.setFichaArmas(dto.getFichaArmas());
            fe.setFichaDineros(dto.getFichaDineros());
            fe.setFichaDrogas(dto.getFichaDrogas());
            fe.setFichaFuncionarios(dto.getFichaFuncionarios());
            fe.setFichaMuniciones(dto.getFichaMuniciones());
            fe.setFichaVehiculos(dto.getFichaVehiculos());
            fe.setFichaSitioSucesos(dto.getFichaSitioSucesos());
            fe.setFichaOtrasEspecies(dto.getFichaOtrasEspecies());

            MemoRevisado r = porId.get(dto.getId());
            if (r != null) {
                fe.setEstadoRevision(r.getEstado() != null ? r.getEstado().name() : "SIN_REVISAR");
                fe.setObservacionesRevision(r.getObservaciones());
                fe.setNombreRevisor(r.getNombreRevisor());
                fe.setUnidadRevisor(r.getUnidadRevisor());
                fe.setRolRevisor(r.getRolRevisor() != null ? r.getRolRevisor().name() : null);
                fe.setFechaRevision(r.getCreatedAt());
            } else {
                fe.setEstadoRevision("SIN_REVISAR");
            }
            res.add(fe);
        }
        return res;
    }


    // Obtener IDs de memos que tienen personas detenidas
    private List<Long> obtenerIdsMemosConDetenidos(OffsetDateTime fechaInicio, OffsetDateTime fechaTermino, String tipoFecha) {
        String campoFecha = (tipoFecha != null && tipoFecha.equals("FECHA DEL HECHO")) ? "fm.fecha" : "fm.created_at";
        return memoRepo.findMemoIdsWithDetenidos(fechaInicio, fechaTermino, campoFecha);
    }

    // Helper: determina si el memo contiene personas con estados de detenido
    private boolean memoTienePersonasDetenidas(FichaMemoDTO memo) {
        if (memo == null || memo.getFichaPersonas() == null || memo.getFichaPersonas().isEmpty()) {
            return false;
        }
        return memo.getFichaPersonas().stream().anyMatch(persona -> {
            if (persona == null || persona.getEstados() == null || persona.getEstados().isEmpty()) {
                return false;
            }
            return persona.getEstados().stream().anyMatch(estado -> {
                if (estado == null) return false;
                String estadoUpper = estado.toUpperCase();
                return "DETENIDO POR PDI".equals(estadoUpper) ||
                        "ARRESTADO".equals(estadoUpper) ||
                        estadoUpper.contains("DETE");
            });
        });
    }

    @Transactional(readOnly = true)
    public List<FichaPersonaModificableDTO> listarPersonas() {
        // Usar una consulta optimizada con fetch joins para evitar lazy loading issues
        List<FichaPersona> personas = personaRepo.findAllWithRelations();

        return personas.stream().map(persona -> {
            FichaPersonaModificableDTO dto = new FichaPersonaModificableDTO();
            dto.setRut(persona.getRut());
            dto.setCreatedAt(persona.getCreatedAt());
            dto.setNombre(persona.getNombre());
            dto.setApellidoPat(persona.getApellidoPat());
            dto.setApellidoMat(persona.getApellidoMat());
            dto.setDireccion(persona.getDireccion());
            dto.setDireccionNumero(persona.getDireccionNumero());
            dto.setDepartamento(persona.getDepartamento());
            dto.setBlock(persona.getBlock());
            dto.setCondicionMigratoria(persona.getCondicionMigratoria());
            dto.setApodo(persona.getApodo());
            dto.setCiudadNacimiento(persona.getCiudadNacimiento());
            dto.setObservaciones(persona.getObservaciones());
            dto.setFono(persona.getFono());
            dto.setCorreoElectronico(persona.getCorreoElectronico());
            dto.setSexo(persona.getSexo());
            dto.setEdad(persona.getEdad());


            // Mapeo seguro de nacionalidad
            if (persona.getNacionalidad() != null) {
                dto.setNacionalidadNombre(persona.getNacionalidad().getNacionalidad());
            }

            // Mapeo seguro de delitos
            if (persona.getDelitos() != null) {
                dto.setDelitosNombres(persona.getDelitos().stream()
                        .filter(Objects::nonNull)
                        .map(delito -> delito.getDelito())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()));
            } else {
                dto.setDelitosNombres(new HashSet<>());
            }

            // Mapeo seguro de estados
            if (persona.getEstados() != null) {
                dto.setEstadosNombres(persona.getEstados().stream()
                        .filter(Objects::nonNull)
                        .map(estado -> estado.getCalidad())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet()));
            } else {
                dto.setEstadosNombres(new HashSet<>());
            }

            // Mapeo seguro del memo y tipo de diligencia
            if (persona.getMemo() != null) {
                dto.setMemoId(persona.getMemo().getId());
                dto.setTipoDiligencia(persona.getMemo().getTipo());
                dto.setFechaHecho(persona.getMemo().getFecha());
                dto.setFechaRegistroMemo(persona.getMemo().getCreatedAt());

                var unidad = persona.getMemo().getUnidad();
                dto.setUnidad(unidad != null ? unidad.getNombreUnidad() : null);
            } else {
                dto.setMemoId(null);
                dto.setTipoDiligencia(null);
                dto.setFechaHecho(null);
                dto.setFechaRegistroMemo(null);
                dto.setUnidad(null);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<FichaVehiculoModificableDTO> listarVehiculos() {

        List<FichaVehiculo> vehiculos = fichaVehiculoRepository.findAllWithRelations();

        return vehiculos.stream().map(vehiculo -> {
            FichaVehiculoModificableDTO dto = new FichaVehiculoModificableDTO();

            dto.setId(vehiculo.getId());
            dto.setPatente(vehiculo.getPatente());
            dto.setCreatedAt(vehiculo.getMemo() != null ? vehiculo.getMemo().getCreatedAt() : null);
            dto.setCalidad(vehiculo.getCalidad());
            dto.setObservaciones(vehiculo.getObs());

            // Relaciones básicas
            if (vehiculo.getMarca() != null) {
                dto.setMarca(vehiculo.getMarca().getMarca());
            }

            if (vehiculo.getModelo() != null) {
                dto.setModelo(vehiculo.getModelo().getModelo());
            }

            // Memo asociado (y unidad si existe)
            if (vehiculo.getMemo() != null) {
                dto.setMemoId(vehiculo.getMemo().getId());
                dto.setTipo(vehiculo.getTipo().getTipoVehiculo());

                if (vehiculo.getMemo().getUnidad() != null) {
                    dto.setUnidad(vehiculo.getMemo().getUnidad().getNombreUnidad());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public List<FichaDrogaModificableDTO> listarDroga() {

        List<FichaDroga> drogaEncontrada = fichaDrogaRepository.findAll();

        return drogaEncontrada.stream().map(itemDroga -> {
            FichaDrogaModificableDTO dto = new FichaDrogaModificableDTO();

            dto.setId(itemDroga.getId());
            dto.setCreatedAt(itemDroga.getCreatedAt());
            dto.setTipoDroga(itemDroga.getTipoDroga());
            dto.setUnidadMedida(itemDroga.getUnidadMedida());
            dto.setCantidadDroga(itemDroga.getCantidadDroga());
            dto.setObs(itemDroga.getObs());
            dto.setMemo(itemDroga.getMemo().getId());
            dto.setFechaHechoMemo(itemDroga.getMemo().getFecha());

            return dto;
        }).collect(Collectors.toList());
    }
}