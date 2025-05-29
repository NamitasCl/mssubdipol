package cl.investigaciones.commonservices.service;

import cl.investigaciones.commonservices.dto.ConsultaUnidadDto;
import cl.investigaciones.commonservices.dto.ConsultaUnidadWrapperDTO;
import cl.investigaciones.commonservices.model.Unidad;
import cl.investigaciones.commonservices.repository.UnidadesRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
public class UnidadesService {

    private final UnidadesRepository unidadesRepository;
    private final RestTemplate restTemplate;

    public UnidadesService(UnidadesRepository unidadesRepository, RestTemplate restTemplate) {
        this.unidadesRepository = unidadesRepository;
        this.restTemplate = restTemplate;
    }

    // Aquí puedes agregar métodos para interactuar con el repositorio de Unidades
    public void saveUnidad(Unidad unidad) {
        unidadesRepository.save(unidad);
    }

    public Unidad getUnidadById(Long id) {
        return unidadesRepository.findById(id).orElse(null);
    }

    public void deleteUnidad(Long id) {
        unidadesRepository.deleteById(id);
    }

    public List<Unidad> getAllUnidades() {
        return unidadesRepository.findAll();
    }

    public boolean cronSaveUnidad() {
        try {

            System.out.println("Ejecutando cronSaveUnidad");
            String token = obtenerToken();

            System.out.println("Token obtenido: " + token);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<ConsultaUnidadWrapperDTO> response = restTemplate.exchange(
                    "https://apialma.investigaciones.cl/api/Unidad/ListarUnidadesActivasIncluyeComunaProvinciaRegion",
                    HttpMethod.GET,
                    requestEntity,
                    ConsultaUnidadWrapperDTO.class
            );
            System.out.println("Response: " + response.getStatusCode());

            if (response.getBody() == null || response.getBody().getResult() == null) {
                return false;
            }

            List<ConsultaUnidadDto> unidades = response.getBody().getResult();

            unidades.forEach(unidad -> {

                Optional<Unidad> unidadEncontrada = unidadesRepository.findByIdUnidad(unidad.getIdUnidad());

                if (unidadEncontrada.isPresent()) {
                    // Si la unidad ya existe, puedes actualizarla o ignorarla

                    Unidad unidadDto = unidadEncontrada.get();
                    unidadDto.setNombreUnidad(unidad.getNombreUnidad());
                    unidadDto.setSiglasUnidad(unidad.getSiglasUnidad());
                    unidadDto.setNombreComuna(unidad.getNombreComuna());
                    unidadDto.setRegionPolicial(unidad.getNombreUnidadPertenece());
                    unidadesRepository.save(unidadDto);

                } else {

                    Unidad unidadDto = new Unidad();
                    unidadDto.setNombreUnidad(unidad.getNombreUnidad());
                    unidadDto.setSiglasUnidad(unidad.getSiglasUnidad());
                    unidadDto.setNombreComuna(unidad.getNombreComuna());
                    unidadDto.setIdUnidad(unidad.getIdUnidad());
                    unidadDto.setRegionPolicial(unidad.getNombreUnidadPertenece());
                    unidadesRepository.save(unidadDto);

                }
            });

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    private String obtenerToken() {
        ResponseEntity<String> tokenResponse =
                restTemplate.getForEntity("http://auth:8009/api/auth/token", String.class);
        return tokenResponse.getBody();
    }


    public List<ConsultaUnidadDto> buscarUnidadesPorNombre(String nombre) {

        List<Unidad> unidades = unidadesRepository.findByNombreUnidadContainingIgnoreCase(nombre);
        return unidades.stream()
                .map(unidad -> {
                    ConsultaUnidadDto consultaUnidadDto = new ConsultaUnidadDto();
                    consultaUnidadDto.setIdUnidad(unidad.getIdUnidad());
                    consultaUnidadDto.setNombreUnidad(unidad.getNombreUnidad());
                    consultaUnidadDto.setSiglasUnidad(unidad.getSiglasUnidad());
                    consultaUnidadDto.setNombreComuna(unidad.getNombreComuna());
                    return consultaUnidadDto;
                })
                .toList();

    }

    public List<String> getRegionesPolicialesUnicas() {
        return unidadesRepository.findDistinctRegionPolicial();
    }

    public ConsultaUnidadDto getUnidadByIdUnidad(Integer idUnidad) {
        Unidad unidadEncontrada = unidadesRepository.findByIdUnidad(idUnidad)
                .orElseThrow(() -> new RuntimeException("No existe unidad con id: " + idUnidad));

        ConsultaUnidadDto dto = new ConsultaUnidadDto();
        dto.setIdUnidad(unidadEncontrada.getIdUnidad());
        dto.setNombreUnidad(unidadEncontrada.getNombreUnidad());
        dto.setSiglasUnidad(unidadEncontrada.getSiglasUnidad());
        dto.setNombreComuna(unidadEncontrada.getNombreComuna());
        dto.setNombreUnidadPertenece(unidadEncontrada.getRegionPolicial());

        return dto;
    }

    public ConsultaUnidadDto getUnidadBySiglasUnidad(String siglasUnidad) {
        Unidad unidadEncontrada = unidadesRepository.findBySiglasUnidad(siglasUnidad)
                .orElseThrow(() -> new RuntimeException("No existe unidad: " + siglasUnidad));

        ConsultaUnidadDto dto = new ConsultaUnidadDto();
        dto.setIdUnidad(unidadEncontrada.getIdUnidad());
        return dto;
    }
}
