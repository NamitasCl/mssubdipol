package cl.investigaciones.turnos.controller;

import cl.investigaciones.turnos.listas.restricciones.RestriccionDescriptor;
import cl.investigaciones.turnos.listas.restricciones.RestriccionRegistro;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;

@RestController
@RequestMapping("/api/turnos/restricciones")
public class RestriccionesController {

    @GetMapping("/listar")
    public Collection<RestriccionDescriptor> listarRestricciones() {
        return RestriccionRegistro.getDescriptores();
    }

}
