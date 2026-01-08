package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.CalendarState;
import cl.investigaciones.turnos.calendar.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;
import java.util.Optional;

public interface CalendarioService {
    CalendarioResponseDTO crearCalendario(CalendarioRequestDTO req, int idFuncionario ) throws JsonProcessingException;
    List<CalendarioResponseDTO> listarCalendarios();
    Optional<CalendarioResponseDTO> buscarPorId(Long id);
    List<CalendarioResponseDTO> listarPorUnidad(Long unidadId);
    List<CalendarioResponseDTO> listarPorEstado(CalendarState estado);
    Optional<CalendarioResponseDTO> actualizar(Long id, CalendarioRequestDTO req, int usuario);
    boolean eliminar(Long id, int usuario);
    Optional<CalendarioResponseDTO> cambiarEstado(Long id, CalendarState nuevoEstado, int usuario);
    Optional<CalendarioResponseDTO> aprobar(Long id, String username);
    Optional<CalendarioResponseDTO> observar(Long id, String username, String observacion);
    Optional<CalendarioResponseDTO> buscarPorMesAnio(Integer mes, Integer anio);
}