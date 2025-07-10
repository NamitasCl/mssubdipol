package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.dto.consulta.FichaMemoDTO;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaResponse;
import cl.investigaciones.nodos.mapper.consulta.FichaMemoMapper;
import cl.investigaciones.nodos.mapper.consulta.FichaPersonaResponseMapper;
import cl.investigaciones.nodos.mapper.consulta.FichaPersonaSimpleMapper;
import cl.investigaciones.nodos.repository.consulta.FichaPersonaRepository;
import cl.investigaciones.nodos.service.consulta.GrafoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/nodos/consulta")
@CrossOrigin("*")
public class FichaPersonaController {

    private final FichaPersonaRepository fichaPersonaRepository;
    private final FichaPersonaResponseMapper fichaPersonaResponseMapper;
    private final FichaMemoMapper fichaMemoMapper;
    private final FichaPersonaSimpleMapper fichaPersonaSimpleMapper;
    private final GrafoService grafoService;

    public FichaPersonaController(
            FichaPersonaRepository fichaPersonaRepository,
            FichaPersonaResponseMapper fichaPersonaResponseMapper,
            FichaMemoMapper fichaMemoMapper, FichaPersonaSimpleMapper fichaPersonaSimpleMapper,
            GrafoService grafoService
    ) {
        this.fichaPersonaRepository = fichaPersonaRepository;
        this.fichaPersonaResponseMapper = fichaPersonaResponseMapper;
        this.fichaMemoMapper = fichaMemoMapper;
        this.fichaPersonaSimpleMapper = fichaPersonaSimpleMapper;
        this.grafoService = grafoService;
    }

    @GetMapping("/persona/{rut}")
    public ResponseEntity<?> findByRut(@PathVariable String rut) {
        List<FichaPersona> personas = fichaPersonaRepository.findByRut(rut);
        if (personas.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FichaPersona base = personas.get(0);
        FichaPersonaResponse response = fichaPersonaResponseMapper.toDto(base);

        // Extraer todos los memos asociados y mapear a DTO
        response.setMemos(
                personas.stream()
                        .map(FichaPersona::getMemo)
                        .filter(memo -> memo != null)
                        .distinct()
                        .map(memo -> {
                            FichaMemoDTO dto = fichaMemoMapper.toDto(memo);
                            dto.setFichaPersonas(
                                    memo.getFichaPersonas().stream()
                                        .filter(p -> !p.getRut().equals(base.getRut()))
                                        .map(fichaPersonaSimpleMapper::toDto)
                                        .toList()
                            );
                            return dto;
                        })
                        .toList()
        );

        return ResponseEntity.ok(grafoService.armarGrafo(response));
    }
}

