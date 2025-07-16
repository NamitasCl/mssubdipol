package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.*;
import cl.investigaciones.turnos.calendar.dto.*;
import cl.investigaciones.turnos.calendar.mapper.AporteUnidadTurnoMapper;
import cl.investigaciones.turnos.calendar.mapper.CalendarioMapper;
import cl.investigaciones.turnos.calendar.mapper.ConfiguracionRestriccionCalendarioMapper;
import cl.investigaciones.turnos.calendar.repository.AporteUnidadTurnoRepository;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.ConfiguracionRestriccionCalendarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class CalendarioServiceImpl implements CalendarioService {

    private final CalendarioRepository repo;
    private final AporteUnidadTurnoRepository aporteUnidadTurnoRepository;
    private final SlotGeneratorService slotService;
    private final ConfiguracionRestriccionCalendarioMapper calendarioConfigMapper;
    private final ConfiguracionRestriccionCalendarioRepository configCalendarioRepo;

    public CalendarioServiceImpl(
            CalendarioRepository repo,
            SlotGeneratorService slotService,
            AporteUnidadTurnoRepository aporteUnidadTurnoRepository,
            ConfiguracionRestriccionCalendarioMapper calendarioConfigMapper,
            ConfiguracionRestriccionCalendarioRepository configCalendarioRepo
    ) {

        this.repo = repo;
        this.slotService = slotService;
        this.aporteUnidadTurnoRepository = aporteUnidadTurnoRepository;
        this.calendarioConfigMapper = calendarioConfigMapper;
        this.configCalendarioRepo = configCalendarioRepo;
    }

    @Override
    public CalendarioResponseDTO crearCalendario(CalendarioRequestDTO req, int idFuncionario) throws JsonProcessingException {
        System.out.println("Calendario que llega: " + req);
        Calendario entity = CalendarioMapper.toEntity(req);
        entity.setCreadoPor(idFuncionario);
        entity.setFechaCreacion(LocalDateTime.now());
        entity.setEstado(CalendarState.ABIERTO);
        entity.setModificadoPor(null);
        System.out.println("Creando calendario: " + entity);

        ConfiguracionRestriccionesCalendario calendarioConfig = new ConfiguracionRestriccionesCalendario();
        calendarioConfig.setCalendario(entity);

        calendarioConfig.setParametrosJson(req.getConfiguracionCalendario().getParametrosJson());

        configCalendarioRepo.save(calendarioConfig);

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

    // En tu servicio, reemplaza por este flujo:
    public List<CalendarioResponseDTO> listarCalendarios() {
        return repo.findByEliminadoFalse().stream().map(c -> {
            CalendarioResponseDTO dto = CalendarioMapper.toDto(c);
            if (c.getTipo() == CalendarType.COMPLEJO) {
                List<AporteUnidadTurno> aportes = aporteUnidadTurnoRepository.findByIdCalendario(c.getId());
                List<AporteUnidadTurnoResponseDTO> aporteDtos = aportes.stream()
                        .map(AporteUnidadTurnoMapper::toDto)
                        .collect(Collectors.toList());
                dto.setAporteUnidadTurnos(aporteDtos);
            } else {
                dto.setAporteUnidadTurnos(Collections.emptyList());
            }
            return dto;
        }).collect(Collectors.toList());
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

    public Optional<CalendarioResponseDTO> actualizar(Long id, CalendarioRequestDTO req, int usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            CalendarioMapper.updateEntity(c, req);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            return CalendarioMapper.toDto(repo.save(c));
        });
    }

    public boolean eliminar(Long id, int usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            c.setEliminado(true);
            c.setEstado(CalendarState.ELIMINADO);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            repo.save(c);
            return true;
        }).orElse(false);
    }

    public Optional<CalendarioResponseDTO> cambiarEstado(Long id, CalendarState nuevoEstado, int usuario) {
        return repo.findById(id).filter(c -> !c.isEliminado()).map(c -> {
            c.setEstado(nuevoEstado);
            c.setModificadoPor(usuario);
            c.setFechaModificacion(LocalDateTime.now());
            return CalendarioMapper.toDto(repo.save(c));
        });
    }
}