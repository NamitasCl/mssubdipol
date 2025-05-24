package cl.investigaciones.commonservices.service;

import cl.investigaciones.commonservices.dto.*;
import cl.investigaciones.commonservices.model.Funcionario;
import cl.investigaciones.commonservices.model.Unidad;
import cl.investigaciones.commonservices.repository.FuncionarioRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FuncionariosService {

    private final FuncionarioRepository funcionarioRepository;
    private final RestTemplate restTemplate;

    public FuncionariosService(FuncionarioRepository funcionarioRepository, RestTemplate restTemplate) {
        this.funcionarioRepository = funcionarioRepository;
        this.restTemplate = restTemplate;
    }

    public List<FuncionarioPorUnidadDTO> searchFuncionariosBySiglasUnidad(String siglasUnidad) {
        List<Funcionario> funcionarios = funcionarioRepository.findBySiglasUnidadIgnoreCase(siglasUnidad);

        System.out.println("[SERVICIO] Funcionarios obtenidos: " + funcionarios);

        return funcionarios.stream()
                .map(funcionario -> {
                    FuncionarioPorUnidadDTO dto = new FuncionarioPorUnidadDTO();
                   dto.setId(funcionario.getId());
                   dto.setIdFun(funcionario.getIdFun());
                   dto.setNombreFun(funcionario.getNombreFun());
                   dto.setApellidoPaternoFun(funcionario.getApellidoPaternoFun());
                   dto.setApellidoMaternoFun(funcionario.getApellidoMaternoFun());
                   dto.setSiglasCargo(funcionario.getSiglasCargo());

                   return dto;
                })
                .collect(Collectors.toList());
    }

    public List<FuncionarioPorUnidadDTO> searchFuncionariosByUnidadYNombre(String unidad, String term) {
        List<Funcionario> funcionarios;

        if (term == null || term.isBlank()) {
            funcionarios = funcionarioRepository.findBySiglasUnidadIgnoreCase(unidad);
        } else {
            funcionarios = funcionarioRepository.searchByUnidadAndNombre(unidad, term);
        }

        return funcionarios.stream()
                .map(funcionario -> {
                    FuncionarioPorUnidadDTO dto = new FuncionarioPorUnidadDTO();
                    System.out.println("Funcionario: " + funcionario.getId() + ", antiguedad: " + funcionario.getAntiguedad());
                    dto.setId(funcionario.getId());
                    dto.setIdFun(funcionario.getIdFun());
                    dto.setNombreFun(funcionario.getNombreFun());
                    dto.setApellidoPaternoFun(funcionario.getApellidoPaternoFun());
                    dto.setApellidoMaternoFun(funcionario.getApellidoMaternoFun());
                    dto.setSiglasCargo(funcionario.getSiglasCargo());
                    dto.setSiglasUnidad(funcionario.getSiglasUnidad());
                    dto.setAntiguedad(funcionario.getAntiguedad());

                    return dto;
                })
                .collect(Collectors.toList());
    }


    private String obtenerToken() {
        System.out.println("Obteniendo token");
        ResponseEntity<String> tokenResponse =
                restTemplate.getForEntity("http://auth:8009/api/auth/token", String.class);
        System.out.println("Token obtenido: " + tokenResponse.getBody());
        return tokenResponse.getBody();
    }

    public boolean cronSaveFuncionarios() {
        try {
            String token = obtenerToken();
            int pagina = 1;
            boolean continuar = true;

            System.out.println("Token: " + token);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            do {

                System.out.println("Iteración: " + pagina);

                ResponseEntity<FuncionarioResponseWrapper> response = restTemplate.exchange(
                        "https://apialma.investigaciones.cl/api/Funcionario/ListarFuncionariosActivos?page=" + pagina,
                        HttpMethod.GET,
                        requestEntity,
                        FuncionarioResponseWrapper.class
                );

                System.out.println("Response: " + response.getBody());

                if (response.getBody().getDescription().contains("No existe información asociada.")) {
                    break;
                }

                if (response.getBody() == null || response.getBody().getResult() == null) {
                    return false;
                }

                List<FuncionarioResponseDTO> funcionarios = response.getBody().getResult();

                funcionarios.forEach(funcionario -> {

                    Optional<Funcionario> funcionarioEncontrado = funcionarioRepository.findByIdFun(funcionario.getIdFun());

                    if(funcionarioEncontrado.isPresent()) {
                        Funcionario funcionarioExistente = funcionarioEncontrado.get();
                        funcionarioExistente.setNombreFun(funcionario.getNombreFun());
                        funcionarioExistente.setApellidoPaternoFun(funcionario.getApellidoPaternoFun());
                        funcionarioExistente.setApellidoMaternoFun(funcionario.getApellidoMaternoFun());
                        funcionarioExistente.setSiglasCargo(funcionario.getSiglasCargo());
                        funcionarioExistente.setNombreCargo(funcionario.getNombreCargo());
                        funcionarioExistente.setNombreUnidad(funcionario.getNombreUnidad());
                        funcionarioExistente.setSiglasUnidad(funcionario.getSiglasUnidad());
                        funcionarioExistente.setAntiguedad(funcionario.getAntiguedad());
                        funcionarioRepository.save(funcionarioExistente);
                        return;
                    } else {
                        Funcionario funcionarioDto = new Funcionario();
                        funcionarioDto.setNombreFun(funcionario.getNombreFun());
                        funcionarioDto.setApellidoPaternoFun(funcionario.getApellidoPaternoFun());
                        funcionarioDto.setApellidoMaternoFun(funcionario.getApellidoMaternoFun());
                        funcionarioDto.setSiglasCargo(funcionario.getSiglasCargo());
                        funcionarioDto.setNombreCargo(funcionario.getNombreCargo());
                        funcionarioDto.setNombreUnidad(funcionario.getNombreUnidad());
                        funcionarioDto.setSiglasUnidad(funcionario.getSiglasUnidad());
                        funcionarioDto.setAntiguedad(funcionario.getAntiguedad());
                        funcionarioDto.setIdFun(funcionario.getIdFun());
                        funcionarioRepository.save(funcionarioDto);
                    }
                });
                pagina++;

            } while (continuar);

            System.out.println("Funcionarios guardados correctamente");
            return true;

        } catch (Exception e) {
            // log.error("Error en cronSaveUnidad", e);
            return false;
        }
    }

}
