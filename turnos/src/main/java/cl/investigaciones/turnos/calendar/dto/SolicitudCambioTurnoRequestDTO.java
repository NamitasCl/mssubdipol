package cl.investigaciones.turnos.calendar.dto;

public record SolicitudCambioTurnoRequestDTO(
    Long idSlotOrigen,
    Long idSlotDestino
) {}
