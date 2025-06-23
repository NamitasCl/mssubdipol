package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteRequestDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionarioAporteService {

    private final FuncionarioAporteRepository repo;

    /**
     * Registra un nuevo funcionario aportado por una unidad para un calendario.
     * @param dto DTO con datos del funcionario
     * @param agregadoPor ID del usuario que realiza el registro
     * @return DTO de respuesta
     */
    public FuncionarioAporteResponseDTO guardar(FuncionarioAporteRequestDTO dto, Integer agregadoPor) {
        // Validar que no se duplique
        if (repo.existsByIdCalendarioAndIdUnidadAndIdFuncionario(
                dto.getIdCalendario(), dto.getIdUnidad(), dto.getIdFuncionario())) {
            throw new IllegalArgumentException("Este funcionario ya ha sido registrado para este calendario y unidad.");
        }

        FuncionarioAporte entity = FuncionarioAporteMapper.toEntity(dto, agregadoPor);
        return FuncionarioAporteMapper.toDto(repo.save(entity));
    }

    /**
     * Lista todos los funcionarios aportados por una unidad para un calendario.
     */
    public List<FuncionarioAporteResponseDTO> listarPorCalendarioYUnidad(Long idCalendario, Long idUnidad) {
        return repo.findByIdCalendarioAndIdUnidadAndDisponibleTrue(idCalendario, idUnidad)
                .stream()
                .map(FuncionarioAporteMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Marca como no disponible (borrado lógico)
     */
    public void eliminar(Long id, Integer modificadoPor) {
        FuncionarioAporte entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe funcionario aporte con ese ID."));
        entity.setDisponible(false);
        entity.setModificadoPor(modificadoPor);
        entity.setFechaModificacion(java.time.LocalDateTime.now());
        repo.save(entity);
    }
}
