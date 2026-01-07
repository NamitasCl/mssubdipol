package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.EstadoSolicitud;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.domain.SolicitudCambioTurno;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioTurnoRequestDTO;
import cl.investigaciones.turnos.calendar.dto.SolicitudCambioTurnoResponseDTO;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.calendar.repository.SolicitudCambioTurnoRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SolicitudCambioTurnoService {

    @Autowired
    private SolicitudCambioTurnoRepository solicitudRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private SlotService slotService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${commonservices.url:http://commonservices:8011}")
    private String commonServicesUrl;

    @Transactional
    public SolicitudCambioTurnoResponseDTO crearSolicitud(
            SolicitudCambioTurnoRequestDTO dto, 
            Integer idFuncionario, 
            String siglasUnidad) {

        // Validar que los slots existen
        Slot slotOrigen = slotRepository.findById(dto.idSlotOrigen())
                .orElseThrow(() -> new RuntimeException("Slot origen no encontrado"));
        Slot slotDestino = slotRepository.findById(dto.idSlotDestino())
                .orElseThrow(() -> new RuntimeException("Slot destino no encontrado"));

        // Validar que el solicitante es el dueño del slot origen
        if (!slotOrigen.getIdFuncionario().equals(idFuncionario)) {
            throw new RuntimeException("No puedes solicitar un cambio de un turno que no es tuyo");
        }

        // Validar que ambos slots pertenecen a la misma unidad
        if (!slotOrigen.getSiglasUnidadFuncionario().equals(slotDestino.getSiglasUnidadFuncionario())) {
            throw new RuntimeException("Solo puedes intercambiar turnos dentro de tu propia unidad");
        }

        // Validar que no haya solicitudes pendientes para estos slots
        List<SolicitudCambioTurno> pendientes = solicitudRepository.findPendientesBySlot(dto.idSlotOrigen());
        pendientes.addAll(solicitudRepository.findPendientesBySlot(dto.idSlotDestino()));
        if (!pendientes.isEmpty()) {
            throw new RuntimeException("Ya existe una solicitud pendiente para uno de estos turnos");
        }

        // Crear la solicitud
        SolicitudCambioTurno solicitud = new SolicitudCambioTurno();
        solicitud.setIdSlotOrigen(dto.idSlotOrigen());
        solicitud.setIdSlotDestino(dto.idSlotDestino());
        solicitud.setIdFuncionarioSolicitante(idFuncionario);
        solicitud.setIdFuncionarioDestino(slotDestino.getIdFuncionario());
        solicitud.setSiglasUnidadOrigen(siglasUnidad);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setFechaSolicitud(OffsetDateTime.now(ZoneId.of("America/Santiago")));

        solicitud = solicitudRepository.save(solicitud);
        log.info("Solicitud de cambio creada: {}", solicitud.getId());

        return buildResponseDTO(solicitud, slotOrigen, slotDestino);
    }

    @Transactional
    public SolicitudCambioTurnoResponseDTO aprobarSolicitud(
            Long idSolicitud, 
            Integer idAprobador, 
            String siglasUnidadAprobador) {

        SolicitudCambioTurno solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden aprobar solicitudes pendientes");
        }

        // Validar que el aprobador pertenece a la unidad
        if (!solicitud.getSiglasUnidadOrigen().equals(siglasUnidadAprobador)) {
            throw new RuntimeException("Solo puedes aprobar solicitudes de tu unidad");
        }

        // Intercambiar los slots
        slotService.swapSlots(solicitud.getIdSlotOrigen(), solicitud.getIdSlotDestino());

        // Actualizar solicitud
        solicitud.setEstado(EstadoSolicitud.APROBADA);
        solicitud.setIdAprobador(idAprobador);
        solicitud.setFechaResolucion(OffsetDateTime.now(ZoneId.of("America/Santiago")));
        solicitud = solicitudRepository.save(solicitud);

        log.info("Solicitud aprobada e intercambio realizado: {}", solicitud.getId());

        Slot slotOrigen = slotRepository.findById(solicitud.getIdSlotOrigen()).orElseThrow();
        Slot slotDestino = slotRepository.findById(solicitud.getIdSlotDestino()).orElseThrow();
        return buildResponseDTO(solicitud, slotOrigen, slotDestino);
    }

    @Transactional
    public SolicitudCambioTurnoResponseDTO rechazarSolicitud(
            Long idSolicitud, 
            Integer idAprobador, 
            String siglasUnidad, 
            String motivo) {

        SolicitudCambioTurno solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes pendientes");
        }

        if (!solicitud.getSiglasUnidadOrigen().equals(siglasUnidad)) {
            throw new RuntimeException("Solo puedes rechazar solicitudes de tu unidad");
        }

        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setIdAprobador(idAprobador);
        solicitud.setMotivoRechazo(motivo);
        solicitud.setFechaResolucion(OffsetDateTime.now(ZoneId.of("America/Santiago")));
        solicitud = solicitudRepository.save(solicitud);

        log.info("Solicitud rechazada: {}", solicitud.getId());

        Slot slotOrigen = slotRepository.findById(solicitud.getIdSlotOrigen()).orElseThrow();
        Slot slotDestino = slotRepository.findById(solicitud.getIdSlotDestino()).orElseThrow();
        return buildResponseDTO(solicitud, slotOrigen, slotDestino);
    }

    public List<SolicitudCambioTurnoResponseDTO> listarSolicitudesPendientesPorUnidad(String siglasUnidad) {
        List<SolicitudCambioTurno> solicitudes = 
            solicitudRepository.findBySiglasUnidadOrigenAndEstado(siglasUnidad, EstadoSolicitud.PENDIENTE);
        
        return solicitudes.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<SolicitudCambioTurnoResponseDTO> listarMisSolicitudes(Integer idFuncionario) {
        List<SolicitudCambioTurno> solicitudes = 
            solicitudRepository.findByIdFuncionarioSolicitanteOrderByFechaSolicitudDesc(idFuncionario);
        
        return solicitudes.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelarSolicitud(Long idSolicitud, Integer idFuncionario) {
        SolicitudCambioTurno solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        if (!solicitud.getIdFuncionarioSolicitante().equals(idFuncionario)) {
            throw new RuntimeException("Solo puedes cancelar tus propias solicitudes");
        }

        if (solicitud.getEstado() != EstadoSolicitud.PENDIENTE) {
            throw new RuntimeException("Solo se pueden cancelar solicitudes pendientes");
        }

        solicitud.setEstado(EstadoSolicitud.CANCELADA);
        solicitud.setFechaResolucion(OffsetDateTime.now(ZoneId.of("America/Santiago")));
        solicitudRepository.save(solicitud);

        log.info("Solicitud cancelada: {}", solicitud.getId());
    }

    private SolicitudCambioTurnoResponseDTO toResponseDTO(SolicitudCambioTurno solicitud) {
        Slot slotOrigen = slotRepository.findById(solicitud.getIdSlotOrigen()).orElse(null);
        Slot slotDestino = slotRepository.findById(solicitud.getIdSlotDestino()).orElse(null);
        
        return buildResponseDTO(solicitud, slotOrigen, slotDestino);
    }

    private SolicitudCambioTurnoResponseDTO buildResponseDTO(
            SolicitudCambioTurno solicitud, 
            Slot slotOrigen, 
            Slot slotDestino) {

        return SolicitudCambioTurnoResponseDTO.builder()
                .id(solicitud.getId())
                .estado(solicitud.getEstado())
                .fechaSolicitud(solicitud.getFechaSolicitud())
                .fechaResolucion(solicitud.getFechaResolucion())
                .motivoRechazo(solicitud.getMotivoRechazo())
                .slotOrigen(slotOrigen != null ? buildSlotDetalle(slotOrigen) : null)
                .slotDestino(slotDestino != null ? buildSlotDetalle(slotDestino) : null)
                .nombreSolicitante(obtenerNombreFuncionario(solicitud.getIdFuncionarioSolicitante()))
                .nombreDestino(obtenerNombreFuncionario(solicitud.getIdFuncionarioDestino()))
                .nombreAprobador(solicitud.getIdAprobador() != null ? 
                    obtenerNombreFuncionario(solicitud.getIdAprobador()) : null)
                .build();
    }

    private SolicitudCambioTurnoResponseDTO.SlotDetalleDTO buildSlotDetalle(Slot slot) {
        return SolicitudCambioTurnoResponseDTO.SlotDetalleDTO.builder()
                .id(slot.getId())
                .fecha(slot.getFecha())
                .nombreServicio(slot.getNombreServicio())
                .rolRequerido(slot.getRolRequerido() != null ? slot.getRolRequerido().getLabel() : null)
                .idFuncionario(slot.getIdFuncionario())
                .nombreFuncionario(slot.getNombreFuncionario())
                .siglasUnidad(slot.getSiglasUnidadFuncionario())
                .build();
    }

    private String obtenerNombreFuncionario(Integer idFun) {
        if (idFun == null) return null;
        
        try {
            String url = commonServicesUrl + "/funcionarios/" + idFun;
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> response = restTemplate.getForObject(url, java.util.Map.class);
            
            if (response != null && response.containsKey("nombreCompleto")) {
                return response.get("nombreCompleto").toString();
            }
            return "Desconocido";
        } catch (Exception e) {
            log.warn("Error obteniendo nombre de funcionario {}: {}", idFun, e.getMessage());
            return "Desconocido";
        }
    }
}
