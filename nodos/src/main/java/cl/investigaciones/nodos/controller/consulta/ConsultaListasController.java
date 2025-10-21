package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaDelito;
import cl.investigaciones.nodos.dto.consulta.ListaDelitoDTO;
import cl.investigaciones.nodos.repository.consulta.ListaDelitoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nodos/listas")
public class ConsultaListasController {

    private final ListaDelitoRepository listaDelitoRepository;

    public ConsultaListasController(ListaDelitoRepository listaDelitoRepository) {
        this.listaDelitoRepository = listaDelitoRepository;
    }

    @GetMapping("/delitos")
    public ResponseEntity<?> findDelitosByParam(@RequestParam String nombre) {

        try {
            List<ListaDelito> delitosEcontrados = listaDelitoRepository.findByDelitoContainingIgnoreCase(nombre);
            List<ListaDelitoDTO> respuesta = delitosEcontrados.stream()
                    .map(delito -> {
                        ListaDelitoDTO dto = new ListaDelitoDTO();
                        dto.setId(delito.getId());
                        dto.setDelito(delito.getDelito());
                        return dto;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ha ocurrido un error obteniendo el delito requerido.");
        }
    }

}
