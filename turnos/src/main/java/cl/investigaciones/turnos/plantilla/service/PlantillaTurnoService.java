package cl.investigaciones.turnos.plantilla.service;

import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoRequestDTO;
import cl.investigaciones.turnos.plantilla.dto.PlantillaTurnoResponseDTO;

import java.util.List;
import java.util.Optional;

public interface PlantillaTurnoService {
    PlantillaTurnoResponseDTO crear(PlantillaTurnoRequestDTO req);
    List<PlantillaTurnoResponseDTO> listar();
    Optional<PlantillaTurnoResponseDTO> buscarPorId(Long id);
    Optional<PlantillaTurnoResponseDTO> actualizar(Long id, PlantillaTurnoRequestDTO req);
    boolean eliminar(Long id);
    boolean desactivar(Long id);
}

