package cl.investigaciones.formularios.service;

import cl.investigaciones.formularios.dto.FormularioServicioEspecialRequest;
import cl.investigaciones.formularios.dto.FormularioServicioEspecialResponse;
import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.model.FormularioPermisos;
import cl.investigaciones.formularios.model.FormularioServicioEspecial;
import cl.investigaciones.formularios.repository.FormularioPermisosRepository;
import cl.investigaciones.formularios.repository.FormularioServicioEspecialRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormularioServicioEspecialService {

    private final FormularioPermisosRepository permisosRepository;
    private final FormularioServicioEspecialRepository formularioRepository;

    public FormularioServicioEspecialService(FormularioPermisosRepository permisosRepository,
                                             FormularioServicioEspecialRepository formularioRepository) {
        this.permisosRepository = permisosRepository;
        this.formularioRepository = formularioRepository;
    }

    public FormularioServicioEspecialResponse crearFormulario(FormularioServicioEspecialRequest request) {
        FormularioServicioEspecial entity = new FormularioServicioEspecial();
        BeanUtils.copyProperties(request, entity);
        entity.setFechaRegistro(LocalDateTime.now());

        FormularioServicioEspecial guardado = formularioRepository.save(entity);

        FormularioServicioEspecialResponse response = new FormularioServicioEspecialResponse();
        BeanUtils.copyProperties(guardado, response);
        return response;
    }

    public List<FormularioServicioEspecial> listarFormulariosDisponibles(JwtUserPrincipal user) {
        // Traer todos los formularios y permisos asociados
        List<FormularioPermisos> permisosList = permisosRepository.findAll();

        // Filtrar los permisos que correspondan al usuario
        List<Long> formulariosVisibles = permisosList.stream()
                .filter(perm ->
                        // Por usuario exacto
                        (perm.getUsuarios() != null && perm.getUsuarios().contains(user.getNombreUsuario()))
                                // Por rol
                                || (perm.getRoles() != null && !Collections.disjoint(perm.getRoles(), user.getRoles()))
                                // Por unidad
                                || (perm.getUnidades() != null && perm.getUnidades().contains(user.getSiglasUnidad()))
                )
                .map(FormularioPermisos::getFormularioId)
                .collect(Collectors.toList());

        // Obtener los formularios
        return formularioRepository.findAllById(formulariosVisibles);
    }
}

