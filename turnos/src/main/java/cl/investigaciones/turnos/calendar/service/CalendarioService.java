package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.CalendarState;
import cl.investigaciones.turnos.calendar.dto.*;
import java.util.List;
import java.util.Optional;

public interface CalendarioService {
    CalendarioResponseDTO crearCalendario(CalendarioRequestDTO req, int idFuncionario );
    List<CalendarioResponseDTO> listarCalendarios();
    Optional<CalendarioResponseDTO> buscarPorId(Long id);
    List<CalendarioResponseDTO> listarPorUnidad(Long unidadId);
    List<CalendarioResponseDTO> listarPorEstado(CalendarState estado);
    Optional<CalendarioResponseDTO> actualizar(Long id, CalendarioRequestDTO req, int usuario);
    boolean eliminar(Long id, int usuario);
    Optional<CalendarioResponseDTO> cambiarEstado(Long id, CalendarState nuevoEstado, int usuario);
}