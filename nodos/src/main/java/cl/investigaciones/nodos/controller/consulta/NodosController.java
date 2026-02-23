package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaVehiculo;
import cl.investigaciones.nodos.dto.consulta.CaracteristicasVehiculoDTO;
import cl.investigaciones.nodos.dto.consulta.FichaMemoDTO;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaResponse;
import cl.investigaciones.nodos.dto.consulta.FichaVehiculoResponse;
import cl.investigaciones.nodos.mapper.consulta.FichaMemoMapper;
import cl.investigaciones.nodos.mapper.consulta.FichaPersonaResponseMapper;
import cl.investigaciones.nodos.mapper.consulta.FichaPersonaSimpleMapper;
import cl.investigaciones.nodos.mapper.consulta.FichaVehiculoResponseMapper;
import cl.investigaciones.nodos.repository.consulta.FichaPersonaRepository;
import cl.investigaciones.nodos.repository.consulta.FichaVehiculoRepository;
import cl.investigaciones.nodos.service.consulta.GrafoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodos/consulta")
@CrossOrigin("*")
@PreAuthorize("isAuthenticated()")
public class NodosController {

    private final FichaPersonaRepository fichaPersonaRepository;
    private final FichaPersonaResponseMapper fichaPersonaResponseMapper;
    private final FichaMemoMapper fichaMemoMapper;
    private final FichaPersonaSimpleMapper fichaPersonaSimpleMapper;
    private final GrafoService grafoService;

    private final FichaVehiculoRepository fichaVehiculoRepository;
    private final FichaVehiculoResponseMapper fichaVehiculoResponseMapper;

    public NodosController(
            FichaPersonaRepository fichaPersonaRepository,
            FichaPersonaResponseMapper fichaPersonaResponseMapper,
            FichaMemoMapper fichaMemoMapper,
            FichaPersonaSimpleMapper fichaPersonaSimpleMapper,
            GrafoService grafoService,
            FichaVehiculoRepository fichaVehiculoRepository,
            FichaVehiculoResponseMapper fichaVehiculoResponseMapper
    ) {
        this.fichaPersonaRepository = fichaPersonaRepository;
        this.fichaPersonaResponseMapper = fichaPersonaResponseMapper;
        this.fichaMemoMapper = fichaMemoMapper;
        this.fichaPersonaSimpleMapper = fichaPersonaSimpleMapper;
        this.grafoService = grafoService;
        this.fichaVehiculoRepository = fichaVehiculoRepository;
        this.fichaVehiculoResponseMapper = fichaVehiculoResponseMapper;
    }

    // ------------------------------------------------------------------
    // Búsqueda por RUT
    // ------------------------------------------------------------------
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

    // ------------------------------------------------------------------
    // Búsqueda por Patente (Directa a Grafo)
    // ------------------------------------------------------------------
    @GetMapping("/patente/{patente}")
    public ResponseEntity<?> findByPatente(@PathVariable String patente) {
        List<FichaVehiculo> vehiculos = fichaVehiculoRepository.findByPatenteWithRelations(patente);
        if (vehiculos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Tomamos el primero como base (misma patente puede aparecer en múltiples memos)
        FichaVehiculo base = vehiculos.get(0);
        FichaVehiculoResponse response = fichaVehiculoResponseMapper.toDto(base);

        // Recolectar todos los memos donde aparece esta patente
        List<FichaMemoDTO> memos = vehiculos.stream()
                .map(FichaVehiculo::getMemo)
                .filter(memo -> memo != null)
                .distinct()
                .map(fichaMemoMapper::toDto)
                .toList();

        response.setMemos(memos);

        return ResponseEntity.ok(grafoService.armarGrafoDesdeVehiculo(response));
    }

    // ------------------------------------------------------------------
    // Búsqueda por Características (Lista Intermedia)
    // ------------------------------------------------------------------
    @PostMapping("/vehiculo/caracteristicas")
    public ResponseEntity<?> findByCaracteristicas(@RequestBody CaracteristicasVehiculoDTO req) {
        List<FichaVehiculo> vehiculos = fichaVehiculoRepository.findByCaracteristicas(
                req.getMarca(),
                req.getModelo(),
                req.getColor()
        );

        if (vehiculos.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // Mapeamos a lista de respuestas (incluyendo el memo para el "relato")
        List<FichaVehiculoResponse> responseList = vehiculos.stream()
                .map(v -> {
                    FichaVehiculoResponse res = fichaVehiculoResponseMapper.toDto(v);
                    if (v.getMemo() != null) {
                        res.setMemos(List.of(fichaMemoMapper.toDto(v.getMemo())));
                    }
                    return res;
                })
                .toList();

        return ResponseEntity.ok(responseList);
    }
}
