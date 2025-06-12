package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.FuncionarioAsignadoDTO;
import cl.investigaciones.turnos.dto.FuncionarioDiasNoDisponibleDTO;
import cl.investigaciones.turnos.dto.FuncionariosDisponiblesResponseDTO;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.model.TurnoAsignacion;
import cl.investigaciones.turnos.repository.AsignacionFuncionarioRepository;
import cl.investigaciones.turnos.repository.FuncionarioDiasNoDisponibleRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AsignacionFuncionarioService {

    private final AsignacionFuncionarioRepository asignacionFuncionarioRepository;

    public AsignacionFuncionarioService(AsignacionFuncionarioRepository repo) {
        this.asignacionFuncionarioRepository = repo;
    }

    // Guardar o actualizar (por idCalendario/unidad/funcionario)
    @Transactional
    public AsignacionFuncionario saveOrUpdate(AsignacionFuncionario nueva, Long turnoAsignacionId, String unidad) {
        Optional<AsignacionFuncionario> existente = asignacionFuncionarioRepository
                .findByTurnoAsignacion_IdAndUnidadAndIdFuncionario(turnoAsignacionId, unidad, nueva.getIdFuncionario());

        // Setea relación padre (turnoAsignacion) y en hijos
        nueva.setTurnoAsignacion(new TurnoAsignacion());
        nueva.getTurnoAsignacion().setId(turnoAsignacionId);
        nueva.setUnidad(unidad);

        if (nueva.getDiasNoDisponibles() != null) {
            nueva.getDiasNoDisponibles().forEach(d -> d.setAsignacionFuncionario(nueva));
        }

        if (existente.isPresent()) {
            AsignacionFuncionario actual = existente.get();
            actual.setNombreCompleto(nueva.getNombreCompleto());
            actual.setSiglasCargo(nueva.getSiglasCargo());
            actual.setAntiguedad(nueva.getAntiguedad());
            actual.setUnidad(unidad);
            // Borra y reemplaza días no disponibles
            actual.getDiasNoDisponibles().clear();
            if (nueva.getDiasNoDisponibles() != null) {
                nueva.getDiasNoDisponibles().forEach(d -> {
                    d.setAsignacionFuncionario(actual);
                    actual.getDiasNoDisponibles().add(d);
                });
            }
            return asignacionFuncionarioRepository.save(actual);
        } else {
            return asignacionFuncionarioRepository.save(nueva);
        }
    }

    // Obtener todos los asignados de una unidad para un calendario
    public List<AsignacionFuncionario> getAsignacionesPorCalendarioYUnidad(Long turnoAsignacionId, String unidad) {
        return asignacionFuncionarioRepository.findByTurnoAsignacion_IdAndUnidad(turnoAsignacionId, unidad);
    }
}
