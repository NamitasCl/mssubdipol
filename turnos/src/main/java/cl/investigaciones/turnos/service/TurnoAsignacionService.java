package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.DiaAsignacionDTO;
import cl.investigaciones.turnos.dto.MesResumenDTO;
import cl.investigaciones.turnos.dto.TurnoAsignacionDTO;
import cl.investigaciones.turnos.dto.UnidadResumenDTO;
import cl.investigaciones.turnos.model.DiaAsignacion;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.model.UnidadColaboradora;
import cl.investigaciones.turnos.repository.TurnoAsignacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;


@Service
public class TurnoAsignacionService {

    @Autowired
    private TurnoAsignacionRepository repository;

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
            dia.setUnidades(diaDto.getUnidades());
            dia.setError(diaDto.getError());
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
    public void openOrCloseMonth(int mes, int anio, boolean open, int turnos) {
        // 1) Buscar o crear el registro del mes actual
        TurnoAsignacion turnoAsignacion = repository.findByMesAndAnio(mes, anio)
                .orElseGet(() -> {
                    // Si no existe, lo creamos (inactivo por defecto)
                    TurnoAsignacion nuevo = new TurnoAsignacion();
                    nuevo.setMes(mes);
                    nuevo.setAnio(anio);
                    nuevo.setActivo(false);
                    return nuevo;
                });

        // 2) Cambiar estado activo según parámetro open
        turnoAsignacion.setActivo(open);

        // 3) Solo crear los días si es la PRIMERA vez que se abre el mes (para evitar duplicados)
        if ((turnoAsignacion.getAsignaciones() == null || turnoAsignacion.getAsignaciones().isEmpty()) && open) {
            int daysInMonth = YearMonth.of(turnoAsignacion.getAnio(), turnoAsignacion.getMes()).lengthOfMonth();
            List<DiaAsignacion> dias = new ArrayList<>(daysInMonth);
            for (int d = 1; d <= daysInMonth; d++) {
                DiaAsignacion dia = new DiaAsignacion();
                dia.setDia(d);
                dia.setDiaSemana(
                        LocalDate.of(turnoAsignacion.getAnio(), turnoAsignacion.getMes(), d)
                                .getDayOfWeek()
                                .getDisplayName(TextStyle.SHORT, new Locale("es", "CL"))
                );
                dia.setUnidades(Collections.emptyList());
                dia.setTurnoAsignacion(turnoAsignacion);
                dias.add(dia);
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

            resumen.add(dto);
        }

        return resumen;
    }





}