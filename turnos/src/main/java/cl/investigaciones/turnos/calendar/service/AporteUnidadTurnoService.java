package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadTurno;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoRequestDTO;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadTurnoResponseDTO;
import cl.investigaciones.turnos.calendar.mapper.AporteUnidadTurnoMapper;
import cl.investigaciones.turnos.calendar.repository.AporteUnidadTurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AporteUnidadTurnoService {

    private final AporteUnidadTurnoRepository repo;

    public AporteUnidadTurnoResponseDTO guardar(AporteUnidadTurnoRequestDTO dto) {
        // Si ya existe, lo actualiza
        AporteUnidadTurno entity = repo.findByIdCalendarioAndIdUnidad(dto.getIdCalendario(), dto.getIdUnidad())
                .map(existing -> {
                    existing.setCantidadFuncionarios(dto.getCantidadFuncionarios());
                    existing.setFechaRegistro(java.time.LocalDateTime.now());
                    existing.setRegistradoPor(dto.getRegistradoPor());
                    return existing;
                })
                .orElse(AporteUnidadTurnoMapper.toEntity(dto));

        return AporteUnidadTurnoMapper.toDto(repo.save(entity));
    }

    public List<AporteUnidadTurnoResponseDTO> listarPorCalendario(Long idCalendario) {
        return repo.findByIdCalendario(idCalendario).stream()
                .map(AporteUnidadTurnoMapper::toDto)
                .collect(Collectors.toList());
    }
}