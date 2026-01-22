package cl.investigaciones.commonservices.controller;

import cl.investigaciones.commonservices.dto.*;
import cl.investigaciones.commonservices.model.Funcionario;
import cl.investigaciones.commonservices.model.Unidad;
import cl.investigaciones.commonservices.repository.FuncionarioRepository;
import cl.investigaciones.commonservices.repository.UnidadesRepository;
import cl.investigaciones.commonservices.service.FuncionariosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/common/funcionarios")
@CrossOrigin("*")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository funcionarioRepository;

    @Autowired
    private UnidadesRepository unidadesRepository;

    @Autowired
    private FuncionariosService funcionarioService;

    @GetMapping("/search")
    public ResponseEntity<List<FuncionarioSearchResponseDTO>> searchByTerm(@RequestParam("term") String term) {
        List<Funcionario> funcionarios = funcionarioRepository.searchByTerm(term);

        List<FuncionarioSearchResponseDTO> response = funcionarios.stream()
                .map(funcionario -> {
                    FuncionarioSearchResponseDTO funcSearchResponse = new FuncionarioSearchResponseDTO();
                    funcSearchResponse.setId(funcionario.getId());
                    funcSearchResponse.setNombreCompleto(funcionario.getNombreFun() + " " +
                            funcionario.getApellidoPaternoFun() + " " +
                            funcionario.getApellidoMaternoFun());
                    funcSearchResponse.setSiglasCargo(funcionario.getSiglasCargo());
                    funcSearchResponse.setAntiguedad(funcionario.getAntiguedad());
                    funcSearchResponse.setIdFun(funcionario.getIdFun());
                    funcSearchResponse.setSiglasUnidad(funcionario.getSiglasUnidad());
                    
                    // Enrich with Unit details
                    funcSearchResponse.setGrado(funcionario.getNombreCargo());
                    funcSearchResponse.setNombreUnidad(funcionario.getNombreUnidad()); // Default
        
                    if (funcionario.getSiglasUnidad() != null) {
                        unidadesRepository.findFirstBySiglasUnidad(funcionario.getSiglasUnidad())
                            .ifPresent(u -> {
                                funcSearchResponse.setRegion(u.getNombreRegion());
                                funcSearchResponse.setJefatura(u.getNombreUnidadReporta()); // Now maps to 'Prefectura' value
                                funcSearchResponse.setNombreUnidad(u.getNombreUnidad());
                            });
                    }
                    
                    return funcSearchResponse;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/porunidad")
    public ResponseEntity<List<FuncionarioPorUnidadDTO>> searchFuncionariosByUnidad(
            @RequestParam String unidad,
            @RequestParam(required = false) String term
    ) {
        try {
            System.out.println("Unidad: " + unidad + " | Term: " + term);
            return ResponseEntity.ok(funcionarioService.searchFuncionariosByUnidadYNombre(unidad, term));
        } catch (Exception e) {
            return new ResponseEntity<>(Collections.emptyList(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{idFun}")
    public ResponseEntity<?> obtenerFuncionarioPorIdFun(@PathVariable int idFun) {
        try {
            System.out.println("Buscando funcionario con idFun: " + idFun);
            Optional<Funcionario> response = funcionarioRepository.findByIdFun(idFun);
            if (response.isPresent()) {
                Funcionario funcionario = response.get();
                FuncionarioByIdFunRespDTO dto = new FuncionarioByIdFunRespDTO();
                dto.setId(funcionario.getId());
                dto.setNombreFun(funcionario.getNombreFun());
                dto.setApellidoPaternoFun(funcionario.getApellidoPaternoFun());
                dto.setApellidoMaternoFun(funcionario.getApellidoMaternoFun());
                dto.setSiglasCargo(funcionario.getSiglasCargo());
                dto.setIdFun(idFun);
                dto.setSiglasUnidad(funcionario.getSiglasUnidad());
                dto.setUsername(funcionario.getUsername());

                System.out.println("Funcionario encontrado: " + dto);

                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener el funcionario: " + e.getMessage());
        }
    }

    @GetMapping("/test-cron")
    public boolean testFuncionarios() {
        return funcionarioService.cronSaveFuncionarios();
    }
}