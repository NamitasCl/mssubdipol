package cl.investigaciones.turnosv2.service;

import cl.investigaciones.turnosv2.domain.PlantillaRequerimiento;
import cl.investigaciones.turnosv2.repository.PlantillaRequerimientoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional // Hacemos que todos los métodos sean transaccionales
public class PlantillaService {

    @Autowired
    private PlantillaRequerimientoRepository plantillaRepository;

    // GET (Listar todos)
    @Transactional(readOnly = true) // readOnly = true para optimizar consultas
    public List<PlantillaRequerimiento> findAll() {
        return plantillaRepository.findAll();
    }

    // POST (Crear)
    public PlantillaRequerimiento save(PlantillaRequerimiento plantilla) {
        // Gracias a @ElementCollection, JPA guardará automáticamente
        // los 'requerimientos' (Rol/Cantidad) en la tabla 'plantilla_configuracion'
        return plantillaRepository.save(plantilla);
    }

    // PUT (Actualizar)
    public PlantillaRequerimiento update(Long id, PlantillaRequerimiento plantillaActualizada) {
        // 1. Verificar si existe
        PlantillaRequerimiento plantillaExistente = plantillaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plantilla no encontrada con id: " + id));

        // 2. Actualizar los campos
        plantillaExistente.setNombre(plantillaActualizada.getNombre());

        // 3. Manejar la colección 'embebida'
        // Borramos los requerimientos antiguos y añadimos los nuevos
        plantillaExistente.getRequerimientos().clear();
        plantillaExistente.getRequerimientos().addAll(plantillaActualizada.getRequerimientos());

        // 4. Guardar (JPA detecta los cambios y actualiza)
        return plantillaRepository.save(plantillaExistente);
    }

    // DELETE (Borrar)
    public void delete(Long id) {
        if (!plantillaRepository.existsById(id)) {
            throw new EntityNotFoundException("Plantilla no encontrada con id: " + id);
        }
        plantillaRepository.deleteById(id);
    }
}