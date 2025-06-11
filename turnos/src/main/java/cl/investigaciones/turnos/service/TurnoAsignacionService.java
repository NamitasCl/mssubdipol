package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.*;
import cl.investigaciones.turnos.mapper.TurnoAsignacionMapper;
import cl.investigaciones.turnos.model.*;
import cl.investigaciones.turnos.repository.PlantillaTurnoRepository;
import cl.investigaciones.turnos.repository.TurnoAsignacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class TurnoAsignacionService {

    @Autowired
    private TurnoAsignacionRepository repository;

    @Autowired
    private PlantillaTurnoRepository plantillaRepo;

    @Autowired
    private TurnoAsignacionMapper turnoAsignacionMapper;
    @Autowired
    private TurnoAsignacionRepository turnoAsignacionRepository;

    /**
     * Crea o actualiza un TurnoAsignacion (registro mensual).
     */
    public TurnoAsignacion saveTurnoAsignacion(TurnoAsignacionDTO dto) {
        // 1. Buscar si ya existe el registro
        TurnoAsignacion registro = repository.findByMesAndAnio(dto.getMes(), dto.getAnio())
                .orElseThrow(() -> new RuntimeException(
                        "El mes no fue creado previamente. Debes abrir el mes antes de guardar turnos."));

        //registro.setTipo(dto.getTipo());
        //registro.setUnidadPrincipal(dto.getUnidadPrincipal());
        //registro.setIdFuncionario(dto.getIdFuncionario());
        //registro.setIdUnidad(dto.getIdUnidad());

        // (Opcional: otros campos nuevos como autoría)
        // registro.setIdFuncionarioCreador(dto.getIdFuncionarioCreador());
        // registro.setNombreCreador(dto.getNombreCreador());
        // registro.setUnidadCreador(dto.getUnidadCreador());

        // 2. Limpiar asignaciones actuales (forma segura)
        if (registro.getAsignaciones() != null) {
            registro.getAsignaciones().clear();
        }

        // 3. Convertir DTOs en entidades y agregar una por una
        for (DiaAsignacionDTO diaDto : dto.getAsignaciones()) {
            DiaAsignacion dia = new DiaAsignacion();
            dia.setDia(diaDto.getDia());
            dia.setDiaSemana(diaDto.getDiaSemana());
            dia.setTurnoAsignacion(registro); // importante para relación bidireccional

            registro.getAsignaciones().add(dia); // aquí es donde evitamos el problema
        }

        return repository.save(registro);
    }

    /**
     * Retorna el TurnoAsignacion (opcional) para mes y anio.
     */
    public Optional<TurnoAsignacion> getByMesAnio(int mes, int anio) {
        return repository.findByMesAndAnio(mes, anio);
    }

    /**
     * Abre o cierra un mes. Al abrir un mes, verifica que el mes anterior esté cerrado.
     */
    public void openOrCloseMonth(TurnoAsignacionOpenCloseDTO openCloseDTO) {
        // 1) Buscar o crear el registro del mes actual
        TurnoAsignacion turnoAsignacion = repository.findByMesAndAnioAndNombreCalendario(openCloseDTO.getMes(), openCloseDTO.getAnio(), openCloseDTO.getNombreCalendario())
                .orElseGet(() -> {
                    // Si no existe, lo creamos (inactivo por defecto)
                    TurnoAsignacion nuevo = new TurnoAsignacion();
                    nuevo.setMes(openCloseDTO.getMes());
                    nuevo.setAnio(openCloseDTO.getAnio());
                    nuevo.setNombreCalendario(openCloseDTO.getNombreCalendario());
                    nuevo.setCreatedAt(openCloseDTO.getCreatedAt());
                    nuevo.setUpdatedAt(openCloseDTO.getUpdatedAt());
                    nuevo.setIdFuncionario(openCloseDTO.getCreador());
                    nuevo.setActivo(false);
                    return nuevo;
                });

        // 2) Cambiar estado activo según parámetro open
        turnoAsignacion.setActivo(openCloseDTO.isOpen());

        // 3) Solo crear los días si es la PRIMERA vez que se abre el mes (para evitar duplicados)
        if ((turnoAsignacion.getAsignaciones() == null || turnoAsignacion.getAsignaciones().isEmpty()) && openCloseDTO.isOpen()) {
            int daysInMonth = YearMonth.of(turnoAsignacion.getAnio(), turnoAsignacion.getMes()).lengthOfMonth();
            List<Long> idsPlantillas = openCloseDTO.getIds();
            List<DiaAsignacion> dias = new ArrayList<>(daysInMonth);
            for (int d = 1; d <= daysInMonth; d++) {
                DiaAsignacion dia = new DiaAsignacion();
                dia.setDia(d);
                dia.setDiaSemana(
                        LocalDate.of(turnoAsignacion.getAnio(), turnoAsignacion.getMes(), d)
                                .getDayOfWeek()
                                .getDisplayName(TextStyle.FULL, new Locale("es", "CL"))
                );
                dia.setTurnoAsignacion(turnoAsignacion);

                // Crea la lista para los servicios de este día
                List<ServicioDiario> servicios = new ArrayList<>();

                for (Long idPlantilla : idsPlantillas) {
                    System.out.println("Buscando plantilla " + idPlantilla);
                    PlantillaTurno plantilla = plantillaRepo.findById(idPlantilla)
                            .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));
                    System.out.println("Plantilla encontrada: " + plantilla);

                    ServicioDiario servicioDiario = new ServicioDiario();
                    servicioDiario.setDiaAsignacion(dia);
                    servicioDiario.setPlantillaTurno(plantilla);
                    servicioDiario.setTurnoAsignacion(turnoAsignacion);

                    servicios.add(servicioDiario); // <-- AGREGAS el servicio a la lista del día
                }
                dia.setServicios(servicios); // <-- ASOCIAS la lista de servicios al día

                dias.add(dia); // Agregas el día a la lista de días del mes
            }
            turnoAsignacion.setAsignaciones(dias);
        }

        // 4) Guardar cambios
        repository.save(turnoAsignacion);



    }


    public Optional<TurnoAsignacion> findByMesAndAnio(int mes, int anio) {
        return repository.findByMesAndAnio(mes, anio);
    }

    /*public List<UnidadResumenDTO> getMesesActivos() {
        List<TurnoAsignacion> respuesta = repository.findByActivoTrue();
        return respuesta.stream()
                .map(registro -> {
                   UnidadResumenDTO dto = new UnidadResumenDTO();
                   dto.setMes(registro.getMes());
                   dto.setAnio(registro.getAnio());
                   return dto;
                })
                .collect(Collectors.toList());


    }*/

    public List<MesResumenDTO> getResumenAgrupadoPorMes() {
        List<TurnoAsignacion> mesesActivos = repository.findAll();
        List<MesResumenDTO> resumen = new ArrayList<>();

        for (TurnoAsignacion mes : mesesActivos) {
            List<UnidadResumenDTO> unidades = new ArrayList<>();

            for (UnidadColaboradora unidadColab : mes.getUnidadesColaboradoras()) {
                UnidadResumenDTO unidad = new UnidadResumenDTO();
                unidad.setUnidad(unidadColab.getNombreUnidad());
                unidad.setCantidadPersonasNecesarias(unidadColab.getCantFuncAporte()); // ✅ usa lo que el usuario definió
                unidades.add(unidad);
            }

            MesResumenDTO dto = new MesResumenDTO();
            dto.setMes(mes.getMes());
            dto.setAnio(mes.getAnio());
            dto.setUnidades(unidades);
            dto.setNombreCalendario(mes.getNombreCalendario());
            dto.setIdFuncionario(mes.getIdFuncionario());

            resumen.add(dto);
        }

        return resumen;
    }

    public List<MisCalendariosDTO> findAllByIdFuncionario(Integer idFuncionario) {
        return repository.findAllByIdFuncionario(idFuncionario)
                .stream()
                .map(calendario -> {
                    MisCalendariosDTO dto = new MisCalendariosDTO();
                    dto.setId(calendario.getId());
                    dto.setNombreCalendario(calendario.getNombreCalendario());
                    return dto;
                })
                .collect(Collectors.toList());
    }


    public void deleteById(Long id) {
        turnoAsignacionRepository.deleteById(id);
    }
}