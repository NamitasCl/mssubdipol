package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaResponse;
import cl.investigaciones.nodos.repository.consulta.FichaPersonaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/nodos/consulta")
@CrossOrigin("*")
public class FichaPersonaController {

    private final FichaPersonaRepository fichaPersonaRepository;

    public FichaPersonaController(FichaPersonaRepository fichaPersonaRepository) {
        this.fichaPersonaRepository = fichaPersonaRepository;
    }

    @PostMapping
    public ResponseEntity<?> findByRut(@RequestBody String rut) {
        List<FichaPersona> personas = fichaPersonaRepository.findByRut(rut);
        if(personas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FichaPersona base = personas.get(0);
        FichaPersonaResponse response = new FichaPersonaResponse();
        response.setId(base.getId());
        response.setRut(base.getRut());
        response.setNombre(base.getNombre());
        response.setApellidoPat(base.getApellidoPat());
        response.setApellidoMat(base.getApellidoMat());
        response.setDireccion(base.getDireccion());
        response.setDireccionNumero(base.getDireccionNumero());
        response.setDepartamento(base.getDepartamento());
        response.setBlock(base.getBlock());
        response.setCondicionMigratoria(base.getCondicionMigratoria());
        response.setApodo(base.getApodo());
        response.setCiudadNacimiento(base.getCiudadNacimiento());
        response.setObservaciones(base.getObservaciones());
        response.setFono(base.getFono());
        response.setCorreoElectronico(base.getCorreoElectronico());

        // Extraer todos los memos asociados
        response.setMemos(personas.stream()
                .map(FichaPersona::getMemo)
                .distinct()
                .toList());

        return ResponseEntity.ok(response);
    }

}
