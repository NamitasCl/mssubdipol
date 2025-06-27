package cl.investigaciones.turnos.calendar.mapper;

import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteRequestDTO;
import cl.investigaciones.turnos.calendar.dto.FuncionarioAporteResponseDTO;

import java.util.List;

public class FuncionarioAporteMapper {

    public static FuncionarioAporte toEntity(FuncionarioAporteRequestDTO dto, Integer agregadoPor) {
        FuncionarioAporte entity = new FuncionarioAporte();
        entity.setIdCalendario(dto.getIdCalendario());
        entity.setIdUnidad(dto.getIdUnidad());
        entity.setIdFuncionario(dto.getIdFuncionario());
        entity.setNombreCompleto(dto.getNombreCompleto());
        entity.setGrado(dto.getGrado());
        entity.setAntiguedad(dto.getAntiguedad());
        entity.setDisponible(true);

        // Auditoría
        entity.setCreadoPor(agregadoPor);
        entity.setFechaCreacion(java.time.LocalDateTime.now());

        // Mapear días no disponibles, si existen en el DTO
        if (dto.getDiasNoDisponibles() != null) {
            for (DiaNoDisponibleDTO diaDto : dto.getDiasNoDisponibles()) {
                FuncionarioAportadoDiasNoDisponible dia = new FuncionarioAportadoDiasNoDisponible();
                dia.setFecha(diaDto.getFecha());
                dia.setMotivo(diaDto.getMotivo());
                dia.setDetalle(diaDto.getDetalle());
                dia.setFuncionarioAporte(entity); // Relación bidireccional
                entity.getDiasNoDisponibles().add(dia);
            }
        }

        return entity;
    }

    public static FuncionarioAporteResponseDTO toDto(FuncionarioAporte entity) {
        FuncionarioAporteResponseDTO dto = new FuncionarioAporteResponseDTO();
        dto.setId(entity.getId());
        dto.setIdCalendario(entity.getIdCalendario());
        dto.setIdUnidad(entity.getIdUnidad());
        dto.setIdFuncionario(entity.getIdFuncionario());
        dto.setNombreCompleto(entity.getNombreCompleto());
        dto.setGrado(entity.getGrado());
        dto.setAntiguedad(entity.getAntiguedad());
        dto.setAgregadoPor(entity.getCreadoPor());
        dto.setFechaCreacion(entity.getFechaCreacion());
        dto.setDisponible(entity.isDisponible());
        // No agregues los días no disponibles al response (según tu decisión anterior)
        return dto;
    }

    public static FuncionarioAporteResponseDTO toDto(FuncionarioAporte entity, List<FuncionarioAportadoDiasNoDisponible> dias) {
        return toDto(entity); // simplemente llama el método existente
    }

}
