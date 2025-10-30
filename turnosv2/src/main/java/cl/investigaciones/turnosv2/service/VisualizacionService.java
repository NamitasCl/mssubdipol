package cl.investigaciones.turnosv2.service;

import cl.investigaciones.turnosv2.domain.Asignacion;
import cl.investigaciones.turnosv2.dto.AsignacionDTO;
import cl.investigaciones.turnosv2.repository.AsignacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true) // Este servicio es solo de lectura
public class VisualizacionService {

    @Autowired
    private AsignacionRepository asignacionRepository;

    /**
     * Busca las asignaciones resueltas para un calendario y las
     * convierte en DTOs "planos" para el frontend.
     */
    public List<AsignacionDTO> findAsignacionesByCalendario(Long calendarioId) {

        // 1. Usamos el método de repositorio que busca a través de las relaciones:
        // Asignacion -> Slot -> Calendario -> Id
        List<Asignacion> asignaciones = asignacionRepository.findBySlot_Calendario_Id(calendarioId);

        // 2. Convertimos cada entidad Asignacion en un AsignacionDTO
        return asignaciones.stream()
                .map(AsignacionDTO::new) // Usa el constructor que creamos en el DTO
                .collect(Collectors.toList());
    }
}