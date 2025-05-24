package cl.investigaciones.formularios.service;

import cl.investigaciones.formularios.dto.FormularioPermisosDto;
import cl.investigaciones.formularios.model.FormularioPermisos;
import cl.investigaciones.formularios.repository.FormularioPermisosRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FormularioPermisosService {

    private final FormularioPermisosRepository permisosRepository;

    public FormularioPermisosService(FormularioPermisosRepository permisosRepository) {
        this.permisosRepository = permisosRepository;
    }

    public FormularioPermisosDto obtenerPermisosPorFormulario(Long formularioId) {
        FormularioPermisos permisos = permisosRepository.findByFormularioId(formularioId)
                .orElseThrow(() -> new RuntimeException("No se encontraron permisos para el formulario"));

        FormularioPermisosDto dto = new FormularioPermisosDto();
        dto.setUsuarios(permisos.getUsuarios());
        dto.setRoles(permisos.getRoles());
        dto.setUnidades(permisos.getUnidades());
        dto.setGrupos(permisos.getGrupos());
        return dto;
    }

    public void actualizarPermisos(Long formularioId, FormularioPermisosDto dto) {
        FormularioPermisos permisos = permisosRepository.findByFormularioId(formularioId)
                .orElseGet(() -> {
                    FormularioPermisos nuevo = new FormularioPermisos();
                    nuevo.setFormularioId(formularioId);
                    return nuevo;
                });

        permisos.setUsuarios(dto.getUsuarios());
        permisos.setRoles(dto.getRoles());
        permisos.setUnidades(dto.getUnidades());
        permisos.setGrupos(dto.getGrupos());

        permisosRepository.save(permisos);
    }
}

