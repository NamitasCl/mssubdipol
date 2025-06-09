package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.dto.PlantillaTurnoResponseDTO;
import cl.investigaciones.turnos.dto.RolPlantillaDTO;
import cl.investigaciones.turnos.model.PlantillaTurno;
import cl.investigaciones.turnos.model.RolPlantilla;
import cl.investigaciones.turnos.repository.PlantillaTurnoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantillaTurnoService {
    private final PlantillaTurnoRepository repo;

    public PlantillaTurnoService(PlantillaTurnoRepository repo) {
        this.repo = repo;
    }

    public PlantillaTurnoResponseDTO crear(PlantillaTurnoRequestDTO dto) {
        PlantillaTurno entity = new PlantillaTurno();
        entity.setNombre(dto.nombre);
        entity.setDescripcion(dto.descripcion);
        entity.setTipoServicio(dto.tipoServicio);
        entity.setHoraInicio(dto.horaInicio);
        entity.setHoraFin(dto.horaFin);
        entity.setDias(dto.dias);
        entity.setRestricciones(dto.restricciones);
        entity.setRoles(dto.roles.stream().map(this::toEntityRol).collect(Collectors.toList()));

        entity = repo.save(entity);

        return toDTO(entity);
    }

    public List<PlantillaTurnoResponseDTO> listar() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PlantillaTurnoResponseDTO actualizar(Long id, PlantillaTurnoRequestDTO dto) {
        PlantillaTurno entity = repo.findById(id).orElseThrow();
        entity.setNombre(dto.nombre);
        entity.setDescripcion(dto.descripcion);
        entity.setTipoServicio(dto.tipoServicio);
        entity.setHoraInicio(dto.horaInicio);
        entity.setHoraFin(dto.horaFin);
        entity.setDias(dto.dias);
        entity.setRestricciones(dto.restricciones);
        entity.setRoles(dto.roles.stream().map(this::toEntityRol).collect(Collectors.toList()));

        return toDTO(repo.save(entity));
    }

    public void eliminar(Long id) {
        repo.deleteById(id);
    }

    private PlantillaTurnoResponseDTO toDTO(PlantillaTurno p) {
        PlantillaTurnoResponseDTO dto = new PlantillaTurnoResponseDTO();
        dto.id = p.getId();
        dto.nombre = p.getNombre();
        dto.descripcion = p.getDescripcion();
        dto.tipoServicio = p.getTipoServicio();
        dto.horaInicio = p.getHoraInicio();
        dto.horaFin = p.getHoraFin();
        dto.dias = p.getDias();
        dto.restricciones = p.getRestricciones();
        dto.roles = p.getRoles().stream().map(this::toDTORol).collect(Collectors.toList());
        return dto;
    }

    private RolPlantilla toEntityRol(RolPlantillaDTO r) {
        RolPlantilla rp = new RolPlantilla();
        rp.setNombreRol(r.nombreRol);
        rp.setCantidad(r.cantidad);
        rp.setGradosPermitidos(r.gradosPermitidos);
        return rp;
    }

    private RolPlantillaDTO toDTORol(RolPlantilla r) {
        RolPlantillaDTO dto = new RolPlantillaDTO();
        dto.nombreRol = r.getNombreRol();
        dto.cantidad = r.getCantidad();
        dto.gradosPermitidos = r.getGradosPermitidos();
        return dto;
    }
}