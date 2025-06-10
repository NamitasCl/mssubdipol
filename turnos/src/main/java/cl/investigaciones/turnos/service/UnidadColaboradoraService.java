package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.UnidadColaboradoraDTO;
import cl.investigaciones.turnos.dto.UnidadColaboradoraRequestDTO;
import cl.investigaciones.turnos.dto.UnidadColaboradoraResponseDTO;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.model.UnidadColaboradora;
import cl.investigaciones.turnos.repository.TurnoAsignacionRepository;
import cl.investigaciones.turnos.repository.UnidadColaboradoraRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UnidadColaboradoraService {

    private final UnidadColaboradoraRepository unidadColaboradoraRepository;
    private final TurnoAsignacionRepository turnoAsignacionRepository;

    public UnidadColaboradoraService(UnidadColaboradoraRepository unidadColaboradoraRepository,
                                     TurnoAsignacionRepository turnoAsignacionRepository) {
        this.unidadColaboradoraRepository = unidadColaboradoraRepository;
        this.turnoAsignacionRepository = turnoAsignacionRepository;
    }

    public UnidadColaboradoraResponseDTO save(UnidadColaboradoraRequestDTO request) {
        // Busca el registro de TurnoAsignacion para el mes y año indicados
        TurnoAsignacion registro = turnoAsignacionRepository
                .findByMesAndAnio(request.getMes(), request.getAnio())
                .orElseThrow(() -> new RuntimeException(
                        "No existe registro para el mes " + request.getMes() + " y año " + request.getAnio()));

        UnidadColaboradora entidad = new UnidadColaboradora();
        entidad.setNombreUnidad(request.getName());
        entidad.setCantFuncAporte(request.getTotalPeople());
        entidad.setMaxTurnos(request.getMaxShifts());
        entidad.setTrabajadoresPorDia(request.getWorkersPerDay());
        entidad.setTrabajaFindesemana(!request.isNoWeekend());
        // Ojo: request.noWeekend=true => "No trabaja findes" => setTrabajaFindesemana(false)

        // Asocia la unidad al registro encontrado
        entidad.setTurnoAsignacion(registro);

        UnidadColaboradora savedEntity = unidadColaboradoraRepository.save(entidad);

        UnidadColaboradoraResponseDTO response = new UnidadColaboradoraResponseDTO();
        response.setId(savedEntity.getId());
        response.setNombreUnidad(savedEntity.getNombreUnidad());
        response.setCantFuncAporte(savedEntity.getCantFuncAporte());
        response.setMaxTurnos(savedEntity.getMaxTurnos());
        response.setTrabajadoresPorDia(savedEntity.getTrabajadoresPorDia());
        response.setTrabajaFindesemana(savedEntity.isTrabajaFindesemana());

        return response;
    }

    public List<UnidadColaboradora> findByTurnoAsignacion_MesAndTurnoAsignacion_Anio(int mes, int anio) {
        return unidadColaboradoraRepository.findByTurnoAsignacion_MesAndTurnoAsignacion_Anio(mes, anio);
    }

    public UnidadColaboradora saveOrUpdate(UnidadColaboradoraDTO dto) {

        Optional<TurnoAsignacion> turnoAsignacion = turnoAsignacionRepository
                .findById(dto.getIdCalendario());

        if (!turnoAsignacion.isPresent()) {
            throw new RuntimeException("TurnoAsignacion no encontrado en unidades colaboradoras.");
        }


        UnidadColaboradora entidad = unidadColaboradoraRepository
                .findByTurnoAsignacion(turnoAsignacion.get())
                .orElseGet(UnidadColaboradora::new);

        entidad.setNombreUnidad(dto.getName());
        entidad.setCantFuncAporte(dto.getTotalPeople());
        entidad.setMaxTurnos(dto.getMaxShifts());
        entidad.setTrabajadoresPorDia(dto.getWorkersPerDay());
        entidad.setTrabajaFindesemana(dto.isNoWeekend());
        entidad.setTurnoAsignacion(turnoAsignacion.get());

        return unidadColaboradoraRepository.save(entidad);
    }

}