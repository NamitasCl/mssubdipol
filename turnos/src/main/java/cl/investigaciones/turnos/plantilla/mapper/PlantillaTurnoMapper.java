package cl.investigaciones.turnos.plantilla.mapper;

import cl.investigaciones.turnos.plantilla.domain.CupoServicioPlantilla;
import cl.investigaciones.turnos.plantilla.domain.PlantillaTurno;
import cl.investigaciones.turnos.plantilla.domain.ServicioPlantilla;
import cl.investigaciones.turnos.plantilla.domain.RecintoServicioPlantilla;
import cl.investigaciones.turnos.plantilla.dto.CupoServicioPlantillaDTO;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoResponseDTO;
import cl.investigaciones.turnos.plantilla.dto.ServicioPlantillaDTO;
import cl.investigaciones.turnos.plantilla.dto.RecintoServicioPlantillaDTO;

import java.util.List;
import java.util.stream.Collectors;

public class PlantillaTurnoMapper {

    public static PlantillaTurno toEntity(PlantillaTurnoRequestDTO dto) {
        PlantillaTurno entity = new PlantillaTurno();
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        List<ServicioPlantilla> servicios = dto.getServicios().stream()
                .map(PlantillaTurnoMapper::toServicioEntity)
                .collect(Collectors.toList());
        entity.setServicios(servicios);
        return entity;
    }

    public static ServicioPlantilla toServicioEntity(ServicioPlantillaDTO dto) {
        ServicioPlantilla entity = new ServicioPlantilla();
        entity.setNombreServicio(dto.getNombreServicio());
        entity.setTurno(dto.getTurno());
        entity.setHoraInicio(dto.getHoraInicio());
        entity.setHoraFin(dto.getHoraFin());

        // --- cupos ---
        List<CupoServicioPlantilla> cupos = dto.getCupos().stream()
                .map(PlantillaTurnoMapper::toCupoEntity)
                .toList();
        entity.setCupos(cupos);

        // --- recintos ---
        if (dto.getRecintos() != null) {
            List<RecintoServicioPlantilla> recintos = dto.getRecintos().stream()
                    .map(rdto -> {
                        RecintoServicioPlantilla r = toRecintoEntity(rdto);
                        r.setServicioPlantilla(entity);        // ★ vincular al padre
                        return r;
                    })
                    .toList();
            entity.setRecintos(recintos);
        }

        return entity;
    }


    public static RecintoServicioPlantilla toRecintoEntity(RecintoServicioPlantillaDTO dto) {
        RecintoServicioPlantilla entity = new RecintoServicioPlantilla();
        entity.setNombre(dto.getNombre());
        entity.setOrden(dto.getOrden());
        return entity;
    }

    public static CupoServicioPlantilla toCupoEntity(CupoServicioPlantillaDTO dto) {
        CupoServicioPlantilla entity = new CupoServicioPlantilla();
        entity.setRol(dto.getRol());
        entity.setCantidad(dto.getCantidad());
        return entity;
    }

    public static PlantillaTurnoResponseDTO toDto(PlantillaTurno entity) {
        PlantillaTurnoResponseDTO dto = new PlantillaTurnoResponseDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setActivo(entity.isActivo());
        dto.setServicios(entity.getServicios().stream()
                .map(PlantillaTurnoMapper::toServicioDto)
                .collect(Collectors.toList()));
        return dto;
    }

    public static ServicioPlantillaDTO toServicioDto(ServicioPlantilla entity) {
        ServicioPlantillaDTO dto = new ServicioPlantillaDTO();
        dto.setNombreServicio(entity.getNombreServicio());
        dto.setTurno(entity.getTurno());
        dto.setHoraInicio(entity.getHoraInicio());
        dto.setHoraFin(entity.getHoraFin());

        // Mapear recintos
        if (entity.getRecintos() != null) {
            List<RecintoServicioPlantillaDTO> recintos = entity.getRecintos().stream()
                    .map(PlantillaTurnoMapper::toRecintoDto)
                    .collect(Collectors.toList());
            dto.setRecintos(recintos);
        }

        dto.setCupos(entity.getCupos().stream()
                .map(PlantillaTurnoMapper::toCupoDto)
                .collect(Collectors.toList()));
        return dto;
    }

    public static RecintoServicioPlantillaDTO toRecintoDto(RecintoServicioPlantilla entity) {
        RecintoServicioPlantillaDTO dto = new RecintoServicioPlantillaDTO();
        dto.setNombre(entity.getNombre());
        dto.setOrden(entity.getOrden());
        return dto;
    }

    public static void updateEntity(PlantillaTurno entity, PlantillaTurnoRequestDTO dto) {
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        // Si quieres permitir actualizar los servicios:
        entity.setServicios(dto.getServicios().stream()
                .map(PlantillaTurnoMapper::toServicioEntity)
                .collect(Collectors.toList()));
    }

    public static CupoServicioPlantillaDTO toCupoDto(CupoServicioPlantilla entity) {
        CupoServicioPlantillaDTO dto = new CupoServicioPlantillaDTO();
        dto.setRol(entity.getRol());
        dto.setCantidad(entity.getCantidad());
        return dto;
    }
}