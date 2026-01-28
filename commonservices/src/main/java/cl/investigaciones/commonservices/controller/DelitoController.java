package cl.investigaciones.commonservices.controller;

import cl.investigaciones.commonservices.model.Delito;
import cl.investigaciones.commonservices.service.DelitoService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize; // Add import

@RestController
@RequestMapping("/api/common/delitos")
@AllArgsConstructor
@PreAuthorize("isAuthenticated()")
public class DelitoController {

    private DelitoService delitoService;

    @GetMapping("/buscar")
    public ResponseEntity<?> buscarDelito(@RequestParam("delito") String filtro){
        try {
            return ResponseEntity.ok(delitoService.buscarDelito(filtro));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
