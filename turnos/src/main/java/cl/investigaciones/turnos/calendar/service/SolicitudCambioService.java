package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioRequestDTO;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioResponseDTO;
import cl.investigaciones.turnos.calendar.repository.SolicitudCambioRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudCambioService {

    private final SolicitudCambioRepository solicitudRepository;
    private final SlotRepository slotRepository;

    /**
     * Crea una nueva solicitud de cambio de turno.
     */
    @Transactional
    public SolicitudCambioResponseDTO crearSolicitud(SolicitudCambioRequestDTO dto, Integer idFuncionarioSolicitante, String nombreSolicitante) {
        log.info("Creando solicitud de cambio para funcionario {} - slot {}", idFuncionarioSolicitante, dto.getIdSlotOriginal());

        // Validar que no exista solicitud pendiente para el mismo slot
        if (solicitudRepository.existsBySlotOriginalIdAndEstado(dto.getIdSlotOriginal(), EstadoSolicitud.PENDIENTE)) {
            throw new RuntimeException("Ya existe una solicitud pendiente para este turno");
        }

        Slot slotOriginal = slotRepository.findById(dto.getIdSlotOriginal())
                .orElseThrow(() -> new RuntimeException("Slot original no encontrado"));

        // Validar que el solicitante sea el asignado al slot
        if (!slotOriginal.getIdFuncionario().equals(idFuncionarioSolicitante)) {
            throw new RuntimeException("Solo puedes solicitar cambio de tus propios turnos");
        }

        SolicitudCambioTurno solicitud = new SolicitudCambioTurno();
        solicitud.setSlotOriginal(slotOriginal);
        solicitud.setIdFuncionarioSolicitante(idFuncionarioSolicitante);
        solicitud.setNombreFuncionarioSolicitante(nombreSolicitante);
        solicitud.setTipoCambio(dto.getTipoCambio());
        solicitud.setMotivo(dto.getMotivo());
        solicitud.setIdCalendario(slotOriginal.getIdCalendario());
        solicitud.setFechaSolicitud(LocalDateTime.now());

        // Si hay funcionario de reemplazo
        if (dto.getIdFuncionarioReemplazo() != null) {
            solicitud.setIdFuncionarioReemplazo(dto.getIdFuncionarioReemplazo());
            solicitud.setNombreFuncionarioReemplazo(dto.getNombreFuncionarioReemplazo());
        }

        // Si es permuta, validar slot de reemplazo
        if (dto.getTipoCambio() == TipoCambio.PERMUTA && dto.getIdSlotReemplazo() != null) {
            Slot slotReemplazo = slotRepository.findById(dto.getIdSlotReemplazo())
                    .orElseThrow(() -> new RuntimeException("Slot de reemplazo no encontrado"));
            solicitud.setSlotReemplazo(slotReemplazo);
        }

        solicitud = solicitudRepository.save(solicitud);
        return toDTO(solicitud);
    }

    /**
     * Aprueba una solicitud de cambio.
     */
    @Transactional
    public SolicitudCambioResponseDTO aprobarSolicitud(Long idSolicitud, Integer idAprobador, String nombreAprobador, String observacion) {
        log.info("Aprobando solicitud {} por {}", idSolicitud, nombreAprobador);

        SolicitudCambioTurno solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }

        // Actualizar estado
        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setIdAprobador(idAprobador);
        solicitud.setNombreAprobador(nombreAprobador);
        solicitud.setObservacionAprobador(observacion);
        solicitud.setFechaResolucion(LocalDateTime.now());

        // Ejecutar el cambio en los slots
        ejecutarCambio(solicitud);

        solicitud = solicitudRepository.save(solicitud);
        return toDTO(solicitud);
    }

    /**
     * Rechaza una solicitud de cambio.
     */
    @Transactional
    public SolicitudCambioResponseDTO rechazarSolicitud(Long idSolicitud, Integer idAprobador, String nombreAprobador, String observacion) {
        log.info("Rechazando solicitud {} por {}", idSolicitud, nombreAprobador);

        SolicitudCambioTurno solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("La solicitud ya fue procesada");
        }

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setIdAprobador(idAprobador);
        solicitud.setNombreAprobador(nombreAprobador);
        solicitud.setObservacionAprobador(observacion);
        solicitud.setFechaResolucion(LocalDateTime.now());

        solicitud = solicitudRepository.save(solicitud);
        return toDTO(solicitud);
    }

    /**
     * Ejecuta el cambio físico en los slots.
     */
    private void ejecutarCambio(SolicitudCambioTurno solicitud) {
        Slot slotOriginal = solicitud.getSlotOriginal();

        switch (solicitud.getTipoCambio()) {
            case PERMUTA:
                // Intercambiar funcionarios entre slots
                Slot slotReemplazo = solicitud.getSlotReemplazo();
                if (slotReemplazo != null) {
                    // Guardar datos del original
                    Integer idFuncOrig = slotOriginal.getIdFuncionario();
                    String nombreOrig = slotOriginal.getNombreFuncionario();
                    String gradoOrig = slotOriginal.getGradoFuncionario();
                    String siglasOrig = slotOriginal.getSiglasUnidadFuncionario();
                    Integer antOrig = slotOriginal.getAntiguedadFuncionario();

                    // Mover reemplazo a original
                    slotOriginal.setIdFuncionario(slotReemplazo.getIdFuncionario());
                    slotOriginal.setNombreFuncionario(slotReemplazo.getNombreFuncionario());
                    slotOriginal.setGradoFuncionario(slotReemplazo.getGradoFuncionario());
                    slotOriginal.setSiglasUnidadFuncionario(slotReemplazo.getSiglasUnidadFuncionario());
                    slotOriginal.setAntiguedadFuncionario(slotReemplazo.getAntiguedadFuncionario());

                    // Mover original a reemplazo
                    slotReemplazo.setIdFuncionario(idFuncOrig);
                    slotReemplazo.setNombreFuncionario(nombreOrig);
                    slotReemplazo.setGradoFuncionario(gradoOrig);
                    slotReemplazo.setSiglasUnidadFuncionario(siglasOrig);
                    slotReemplazo.setAntiguedadFuncionario(antOrig);

                    slotRepository.save(slotReemplazo);
                }
                break;

            case DEVOLUCION:
            case CESION:
                // Simplemente asignar el funcionario reemplazo al slot
                if (solicitud.getIdFuncionarioReemplazo() != null) {
                    slotOriginal.setIdFuncionario(solicitud.getIdFuncionarioReemplazo());
                    slotOriginal.setNombreFuncionario(solicitud.getNombreFuncionarioReemplazo());
                    // Nota: podrías necesitar obtener más datos del funcionario reemplazo
                }
                break;
        }

        slotRepository.save(slotOriginal);
    }

    /**
     * Obtiene solicitudes pendientes para aprobación.
     */
    public List<SolicitudCambioResponseDTO> obtenerPendientes() {
        return solicitudRepository.findByEstadoOrderByFechaSolicitudAsc(EstadoSolicitud.PENDIENTE)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene historial de solicitudes de un funcionario.
     */
    public List<SolicitudCambioResponseDTO> obtenerHistorialFuncionario(Integer idFuncionario) {
        return solicitudRepository.findHistorialByFuncionario(idFuncionario)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte entidad a DTO.
     */
    private SolicitudCambioResponseDTO toDTO(SolicitudCambioTurno s) {
        SolicitudCambioResponseDTO.SolicitudCambioResponseDTOBuilder builder = SolicitudCambioResponseDTO.builder()
                .id(s.getId())
                .idFuncionarioSolicitante(s.getIdFuncionarioSolicitante())
                .nombreFuncionarioSolicitante(s.getNombreFuncionarioSolicitante())
                .idFuncionarioReemplazo(s.getIdFuncionarioReemplazo())
                .nombreFuncionarioReemplazo(s.getNombreFuncionarioReemplazo())
                .tipoCambio(s.getTipoCambio())
                .estado(s.getEstado())
                .motivo(s.getMotivo())
                .observacionAprobador(s.getObservacionAprobador())
                .fechaSolicitud(s.getFechaSolicitud())
                .fechaResolucion(s.getFechaResolucion())
                .nombreAprobador(s.getNombreAprobador());

        // Datos del slot original
        if (s.getSlotOriginal() != null) {
            Slot orig = s.getSlotOriginal();
            builder.idSlotOriginal(orig.getId())
                    .fechaSlotOriginal(orig.getFecha())
                    .horaInicioOriginal(orig.getHoraInicio())
                    .horaFinOriginal(orig.getHoraFin())
                    .nombreServicioOriginal(orig.getNombreServicio())
                    .recintoOriginal(orig.getRecinto());
        }

        // Datos del slot reemplazo
        if (s.getSlotReemplazo() != null) {
            Slot remp = s.getSlotReemplazo();
            builder.idSlotReemplazo(remp.getId())
                    .fechaSlotReemplazo(remp.getFecha())
                    .horaInicioReemplazo(remp.getHoraInicio())
                    .horaFinReemplazo(remp.getHoraFin());
        }

        return builder.build();
    }
}
