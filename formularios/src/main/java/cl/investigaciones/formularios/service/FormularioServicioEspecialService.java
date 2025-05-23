package cl.investigaciones.formularios.service;

import cl.investigaciones.formularios.dto.FormularioServicioEspecialRequest;
import cl.investigaciones.formularios.dto.FormularioServicioEspecialResponse;
import cl.investigaciones.formularios.model.FormularioServicioEspecial;
import cl.investigaciones.formularios.repository.FormularioServicioEspecialRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class FormularioServicioEspecialService {

    private final FormularioServicioEspecialRepository repository;

    public FormularioServicioEspecialService(FormularioServicioEspecialRepository repository) {
        this.repository = repository;
    }

    public FormularioServicioEspecialResponse crearFormulario(FormularioServicioEspecialRequest request) {
        FormularioServicioEspecial entity = new FormularioServicioEspecial();
        BeanUtils.copyProperties(request, entity);
        entity.setFechaRegistro(LocalDateTime.now());

        FormularioServicioEspecial guardado = repository.save(entity);

        FormularioServicioEspecialResponse response = new FormularioServicioEspecialResponse();
        BeanUtils.copyProperties(guardado, response);
        return response;
    }
}

