// src/main/java/cl/investigaciones/formularios/controller/formulariodinamico/AsignacionCuotaFormularioController.java
package cl.investigaciones.formularios.controller.formulariodinamico;

import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import cl.investigaciones.formularios.dto.formulariodinamico.AsignacionCuotaFormularioDTO;
import cl.investigaciones.formularios.service.formulariodinamico.AsignacionCuotaFormularioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/formularios/dinamico/cuotas")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class AsignacionCuotaFormularioController {
    @Autowired
    private AsignacionCuotaFormularioService service;

    // Listar cuotas asignadas a una unidad
    @GetMapping("/unidad/{idUnidad}")
    public List<AsignacionCuotaFormularioDTO> listarPorUnidad(@PathVariable Integer idUnidad) {
        return service.listarPorUnidad(idUnidad);
    }

    // Listar cuotas de un formulario (todas: por unidad y por funcionario)
    @GetMapping("/formulario/{formularioId}")
    public List<AsignacionCuotaFormularioDTO> listarPorFormulario(@PathVariable Long formularioId) {
        return service.listarPorFormulario(formularioId);
    }

    // Crear cuota (unidad o funcionario)
    @PostMapping
    public AsignacionCuotaFormularioDTO crear(@RequestBody AsignacionCuotaFormularioDTO dto) {
        System.out.println("DTO recibido: " + dto);
        return service.crearAsignacion(dto);
    }

    // Avance de registros por unidad
    @GetMapping("/formulario/{formularioId}/unidad/{idUnidad}/avance")
    public int avanceUnidadEnFormulario(@PathVariable Long formularioId, @PathVariable Integer idUnidad) {
        // Ahora debe contar solo los registros de la unidad (puede delegar al service correctamente)
        return service.contarRegistrosCompletados(formularioId, idUnidad);
    }

    // Delegar cuota (crear asignación hija con referencia a padre)
    @PostMapping("/delegar")
    public AsignacionCuotaFormularioDTO delegarCuota(@RequestBody AsignacionCuotaFormularioDTO dto) {
        return service.delegarAsignacion(dto);
    }

    // Listar todas las delegaciones hijas de una cuota padre
    @GetMapping("/padre/{cuotaPadreId}")
    public List<AsignacionCuotaFormularioDTO> listarDelegacionesHijas(@PathVariable Long cuotaPadreId) {
        return service.listarPorPadre(cuotaPadreId);
    }

    // (Opcional) Listar las cuotas asignadas al usuario actual (funcionario o unidad)
    @GetMapping("/mis")
    public List<AsignacionCuotaFormularioDTO> listarMisCuotas(@AuthenticationPrincipal JwtUserPrincipal user) {
        // Buscar tanto por idFuncionario como por siglasUnidad
        // Tu service debe mapear siglasUnidad a idUnidad (como ya conversamos)
        return service.listarPorUsuarioYUnidad(user.getIdFuncionario(), user.getSiglasUnidad());
    }

}