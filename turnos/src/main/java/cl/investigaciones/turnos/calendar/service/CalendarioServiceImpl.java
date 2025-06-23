package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.*;
import cl.investigaciones.turnos.calendar.mapper.CalendarioMapper;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class CalendarioServiceImpl implements CalendarioService {

    private final CalendarioRepository repo;
    private final SlotGeneratorService slotService;

    public CalendarioServiceImpl(CalendarioRepository repo,  SlotGeneratorService slotService) {

        this.repo = repo;
        this.slotService = slotService;
    }

    @Override
    public CalendarioResponseDTO crearCalendario(CalendarioRequestDTO req, int idFuncionario) {
        Calendario entity = CalendarioMapper.toEntity(req);
        entity.setCreadoPor(idFuncionario);
        entity.setFechaCreacion(LocalDateTime.now());
        entity.setEstado(CalendarState.ABIERTO);
        System.out.println("Creando calendario: " + entity);

        Calendario savedEntity = repo.save(entity);
        try {
            slotService.generarSlotsParaCalendario(savedEntity.getId());
        } catch (Exception e) {
            // Opcional: revertir creación si falla slots, o dejar el calendario "incompleto"
            log.error("Error generando slots para calendario " + savedEntity.getId(), e);
            throw new RuntimeException("No se pudieron generar los slots del calendario.");
        }


        return CalendarioMapper.toDto(savedEntity);
    }

    public List<CalendarioResponseDTO> listarCalendarios() {
        return repo.findByEliminadoFalse().stream().map(CalendarioMapper::toDto).collect(Collectors.toList());
    }

    public Optional<CalendarioResponseDTO> buscarPorId(Long id) {
        return repo.findById(id)
                .filter(c -> !c.isEliminado())
                .map(CalendarioMapper::toDto);
    }

    public List<CalendarioResponseDTO> listarPorUnidad(Long unidadId) {
        return repo.findByIdUnidadAndEliminadoFalse(unidadId).stream()
                .map(CalendarioMapper::toDto).collect(Collectors.toList());
    }

    public List<CalendarioResponseDTO> listarPorEstado(CalendarState estado) {
        return repo.findByEstadoAndEliminadoFalse(estado).stream()
                .map(CalendarioMapper::toDto).collect(Collectors.toList());
    }

    public Optional<CalendarioResponseDTO> actualizar(Long id, CalendarioRequestDTO req, String usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            CalendarioMapper.updateEntity(c, req);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            return CalendarioMapper.toDto(repo.save(c));
        });
    }

    public boolean eliminar(Long id, String usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            c.setEliminado(true);
            c.setEstado(CalendarState.ELIMINADO);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            repo.save(c);
            return true;
        }).orElse(false);
    }

    public Optional<CalendarioResponseDTO> cambiarEstado(Long id, CalendarState nuevoEstado, String usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            c.setEstado(nuevoEstado);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            return CalendarioMapper.toDto(repo.save(c));
        });
    }
}