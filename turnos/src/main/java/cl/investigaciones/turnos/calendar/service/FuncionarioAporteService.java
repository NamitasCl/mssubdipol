package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteRequestDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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
        // Busca si ya existe (independiente de su estado)
        Optional<FuncionarioAporte> existente = repo.findByIdCalendarioAndIdUnidadAndIdFuncionario(
                dto.getIdCalendario(), dto.getIdUnidad(), dto.getIdFuncionario());

        FuncionarioAporte entity;

        if (existente.isPresent()) {
            entity = existente.get();
            if (!entity.isDisponible()) {
                // Si estaba eliminado, lo reactivamos y actualizamos los datos necesarios
                entity.setDisponible(true);
                entity.setModificadoPor(agregadoPor);
                entity.setFechaModificacion(java.time.LocalDateTime.now());
                // Actualiza otros datos si corresponde
                entity.setNombreCompleto(dto.getNombreCompleto());
                entity.setGrado(dto.getGrado());
                entity.setAntiguedad(dto.getAntiguedad());
            } else {
                throw new IllegalArgumentException("Este funcionario ya ha sido registrado para este calendario y unidad.");
            }
        } else {
            entity = FuncionarioAporteMapper.toEntity(dto, agregadoPor);
        }

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

    public List<FuncionarioAporteResponseDTO> listarPorCalendario(Long idCalendario) {
        return repo.findByIdCalendarioAndDisponibleTrue(idCalendario)
                .stream()
                .map(FuncionarioAporteMapper::toDto)
                .collect(Collectors.toList());
    }
}
