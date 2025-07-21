package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteRequestDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionariosAportadosPaginados;
import cl.investigaciones.turnos.calendar.mapper.FuncionarioAporteMapper;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAportadoDiasNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuncionarioAporteService {

    private final FuncionarioAporteRepository repo;
    private final FuncionarioAportadoDiasNoDisponibleRepository diasRepo;

    @Transactional
    public FuncionarioAporteResponseDTO guardar(FuncionarioAporteRequestDTO dto, Integer agregadoPor) {
        // Busca si ya existe
        Optional<FuncionarioAporte> existente = repo.findByIdCalendarioAndIdUnidadAndIdFuncionario(
                dto.getIdCalendario(), dto.getIdUnidad(), dto.getIdFuncionario());

        FuncionarioAporte entity;

        if (existente.isPresent()) {
            entity = existente.get();
            if (!entity.isDisponible()) {
                entity.setDisponible(true);
                entity.setModificadoPor(agregadoPor);
                entity.setFechaModificacion(java.time.LocalDateTime.now());
                entity.setNombreCompleto(dto.getNombreCompleto());
                entity.setGrado(dto.getGrado());
                entity.setAntiguedad(dto.getAntiguedad());
                entity.setSiglasUnidad(dto.getSiglasUnidad());

                // Elimina los días no disponibles previos para este registro
                diasRepo.deleteByFuncionarioAporte(entity);

                // Registra los nuevos días no disponibles
                if (dto.getDiasNoDisponibles() != null) {
                    for (DiaNoDisponibleDTO diaDto : dto.getDiasNoDisponibles()) {
                        FuncionarioAportadoDiasNoDisponible dia = new FuncionarioAportadoDiasNoDisponible();
                        dia.setFuncionarioAporte(entity);
                        dia.setFecha(diaDto.getFecha());
                        dia.setMotivo(diaDto.getMotivo());
                        dia.setDetalle(diaDto.getDetalle());
                        diasRepo.save(dia);
                    }
                }

            } else {
                throw new IllegalArgumentException("Este funcionario ya ha sido registrado para este calendario y unidad.");
            }
        } else {
            entity = FuncionarioAporteMapper.toEntity(dto, agregadoPor);
            entity = repo.save(entity);

            // Guarda los días no disponibles asociados a este nuevo registro
            if (dto.getDiasNoDisponibles() != null) {
                for (DiaNoDisponibleDTO diaDto : dto.getDiasNoDisponibles()) {
                    FuncionarioAportadoDiasNoDisponible dia = new FuncionarioAportadoDiasNoDisponible();
                    dia.setFuncionarioAporte(entity);
                    dia.setFecha(diaDto.getFecha());
                    dia.setMotivo(diaDto.getMotivo());
                    dia.setDetalle(diaDto.getDetalle());
                    diasRepo.save(dia);
                }
            }
        }

        // Recarga los días no disponibles (por si el mapper los requiere)
        List<FuncionarioAportadoDiasNoDisponible> dias = diasRepo.findByFuncionarioAporte(entity);

        return FuncionarioAporteMapper.toDto(entity, dias);
    }

    public List<FuncionarioAporteResponseDTO> listarPorCalendarioYUnidad(Long idCalendario, Long idUnidad) {
        List<FuncionarioAporte> aportes = repo.findByIdCalendarioAndIdUnidadAndDisponibleTrue(idCalendario, idUnidad);
        return aportes.stream()
                .map(aporte -> {
                    List<FuncionarioAportadoDiasNoDisponible> dias = diasRepo.findByFuncionarioAporte(aporte);
                    return FuncionarioAporteMapper.toDto(aporte, dias);
                })
                .collect(Collectors.toList());
    }

    public Page<FuncionariosAportadosPaginados> listarPorCalendarioYUnidadPaginado(Long idCalendario, Long idUnidad, Pageable pageable) {
        Page<FuncionarioAporte> aportes = repo.findByIdCalendarioAndIdUnidad(idCalendario, idUnidad, pageable);

        List<FuncionariosAportadosPaginados> contenido = aportes.getContent().stream()
                .map(aporte -> {
                    FuncionariosAportadosPaginados dto = new FuncionariosAportadosPaginados();
                    dto.setId(aporte.getId());
                    dto.setNombreCompleto(aporte.getNombreCompleto());
                    return dto;
                })
                .toList();

        return new PageImpl<>(contenido, pageable, aportes.getTotalElements());
    }

    @Transactional
    public void eliminar(Long id, Integer modificadoPor) {
        FuncionarioAporte entity = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe funcionario aporte con ese ID."));
        entity.setDisponible(false);
        entity.setModificadoPor(modificadoPor);
        entity.setFechaModificacion(java.time.LocalDateTime.now());

        // (Opcional) Elimina los días no disponibles relacionados, o déjalos para trazabilidad
        diasRepo.deleteByFuncionarioAporte(entity);

        repo.save(entity);
    }

    public List<FuncionarioAporteResponseDTO> listarPorCalendario(Long idCalendario) {
        List<FuncionarioAporte> aportes = repo.findByIdCalendarioAndDisponibleTrue(idCalendario);
        return aportes.stream()
                .map(aporte -> {
                    List<FuncionarioAportadoDiasNoDisponible> dias = diasRepo.findByFuncionarioAporte(aporte);
                    return FuncionarioAporteMapper.toDto(aporte, dias);
                })
                .collect(Collectors.toList());
    }
}