package cl.investigaciones.turnos.plantilla.service;

import cl.investigaciones.turnos.plantilla.domain.PlantillaTurno;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoResponseDTO;
import cl.investigaciones.turnos.plantilla.mapper.PlantillaTurnoMapper;
import cl.investigaciones.turnos.plantilla.repository.PlantillaTurnoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PlantillaTurnoServiceImpl implements PlantillaTurnoService {
    private final PlantillaTurnoRepository repo;

    public PlantillaTurnoServiceImpl(PlantillaTurnoRepository repo) {
        this.repo = repo;
    }

    @Override
    public PlantillaTurnoResponseDTO crear(PlantillaTurnoRequestDTO req) {
        System.out.println("PlantillaTurnoServiceImpl crear");
        PlantillaTurno entity = PlantillaTurnoMapper.toEntity(req);
        return PlantillaTurnoMapper.toDto(repo.save(entity));
    }

    @Override
    public List<PlantillaTurnoResponseDTO> listar() {
        return repo.findByActivoTrue().stream()
                .map(PlantillaTurnoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PlantillaTurnoResponseDTO> buscarPorId(Long id) {
        return repo.findById(id).filter(PlantillaTurno::isActivo)
                .map(PlantillaTurnoMapper::toDto);
    }

    @Override
    public Optional<PlantillaTurnoResponseDTO> actualizar(Long id, PlantillaTurnoRequestDTO req) {
        return repo.findById(id).filter(PlantillaTurno::isActivo).map(entity -> {
            PlantillaTurnoMapper.updateEntity(entity, req);
            return PlantillaTurnoMapper.toDto(repo.save(entity));
        });
    }

    @Override
    public boolean eliminar(Long id) {
        return repo.findById(id).filter(PlantillaTurno::isActivo).map(entity -> {
            repo.delete(entity);
            return true;
        }).orElse(false);
    }

    @Override
    public boolean desactivar(Long id) {
        return repo.findById(id).filter(PlantillaTurno::isActivo).map(entity -> {
            entity.setActivo(false);
            repo.save(entity);
            return true;
        }).orElse(false);
    }
}
