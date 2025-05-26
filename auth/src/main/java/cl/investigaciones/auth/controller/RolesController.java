package cl.investigaciones.auth.controller;

import cl.investigaciones.auth.dto.FuncionarioConRolesDTO;
import cl.investigaciones.auth.dto.ModificarRolRequestDTO;
import cl.investigaciones.auth.dto.UsuarioSubjefeDTO;
import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.model.Usuario;
import cl.investigaciones.auth.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin("*")
public class RolesController {

    private final UsuarioService usuarioService;

    public RolesController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/asignados")
    public ResponseEntity<List<FuncionarioConRolesDTO>> obtenerFuncionariosConRoles() {
        try {
            List<FuncionarioConRolesDTO> lista = usuarioService.obtenerFuncionariosConRoles();
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/subjefe/{unidad}")
    public ResponseEntity<?> obtenerSubjefePorUnidad(@PathVariable String unidad) {
        try {
            Usuario subjefe = usuarioService.obtenerSubjefePorUnidad(unidad);
            UsuarioSubjefeDTO dto = new UsuarioSubjefeDTO(
                    subjefe.getUsername(),
                    subjefe.getNombre(),
                    subjefe.getApellidoPaterno(),
                    subjefe.getApellidoMaterno(),
                    subjefe.getNombreCargo(),
                    subjefe.getSiglasUnidad(),
                    subjefe.getIdFun()
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/modificar")
    public ResponseEntity<?> modificarRolesUsuario(@RequestBody ModificarRolRequestDTO request) {
        try {
            System.out.println("ROLES: " + request.getRoles());
            usuarioService.modificarRolesUsuario(request.getIdFun(), request.getRoles());
            return ResponseEntity.ok("Roles modificados correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al modificar los roles: " + e.getMessage());
        }
    }
}