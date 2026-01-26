package cl.investigaciones.commonservices.service;

import cl.investigaciones.commonservices.dto.ConsultaUnidadDto;
import cl.investigaciones.commonservices.dto.ConsultaUnidadWrapperDTO;
import cl.investigaciones.commonservices.dto.jerarquiaunidades.RegionesJefaturasDTO;
import cl.investigaciones.commonservices.dto.jerarquiaunidades.UnidadHijoDTO;
import cl.investigaciones.commonservices.dto.jerarquiaunidades.UnidadNietoDto;
import cl.investigaciones.commonservices.model.Unidad;
import cl.investigaciones.commonservices.repository.UnidadesRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

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
                    unidadDto.setNombreRegion(unidad.getNombreRegion());
                    unidadDto.setNombreUnidadReporta(unidad.getNombreUnidadReporta());
                    unidadDto.setRegionPolicial(unidad.getNombreUnidadPertenece());
                    unidadDto.setOperativa(unidad.getOperativa());
                    unidadesRepository.save(unidadDto);

                } else {

                    Unidad unidadDto = new Unidad();
                    unidadDto.setNombreUnidad(unidad.getNombreUnidad());
                    unidadDto.setSiglasUnidad(unidad.getSiglasUnidad());
                    unidadDto.setNombreComuna(unidad.getNombreComuna());
                    unidadDto.setNombreRegion(unidad.getNombreRegion());
                    unidadDto.setNombreUnidadReporta(unidad.getNombreUnidadReporta());
                    unidadDto.setIdUnidad(unidad.getIdUnidad());
                    unidadDto.setRegionPolicial(unidad.getNombreUnidadPertenece());
                    unidadDto.setOperativa(unidad.getOperativa());
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
        Unidad unidadEncontrada = unidadesRepository.findFirstBySiglasUnidad(siglasUnidad)
                .orElseThrow(() -> new RuntimeException("No existe unidad: " + siglasUnidad));

        ConsultaUnidadDto dto = new ConsultaUnidadDto();
        dto.setIdUnidad(unidadEncontrada.getIdUnidad());
        return dto;
    }

    public List<String> getRegionesUnicas() {
        return unidadesRepository.findDistinctNombreRegion();
    }

    public List<ConsultaUnidadDto> getUnidadesPorRegion(String region) {
        List<Unidad> unidades = unidadesRepository.uniadesPorRegionOperativas(region);
        return unidades.stream()
                .map(unidad -> {
                    ConsultaUnidadDto consultaUnidadDto = new ConsultaUnidadDto();
                    consultaUnidadDto.setIdUnidad(unidad.getIdUnidad());
                    consultaUnidadDto.setNombreUnidad(unidad.getNombreUnidad());
                    consultaUnidadDto.setSiglasUnidad(unidad.getSiglasUnidad());
                    consultaUnidadDto.setNombreComuna(unidad.getNombreComuna());
                    consultaUnidadDto.setNombreRegion(unidad.getNombreRegion());
                    consultaUnidadDto.setOperativa(unidad.getOperativa());
                    return consultaUnidadDto;
                }).toList();
    }


    public List<String> getJefaturasNacionalesPrefecturas() {
        List<String> jefaturasPrefecturas = unidadesRepository.findDistinctNombreUnidadReporta();
        return jefaturasPrefecturas;
    }

    public List<RegionesJefaturasDTO> getJefaturasRegionesUudd() {
        List<Unidad> unidades = unidadesRepository.findAll();

        // Agrupar por Región -> Jefatura
        Map<String, Map<String, List<Unidad>>> porRegionLuegoJefatura = unidades.stream()
                .collect(Collectors.groupingBy(
                        u -> nvl(u.getNombreUnidadReporta()),
                        Collectors.groupingBy(u -> nvl(u.getNombreUnidad()))
                ));

        // Construcción de DTOs
        return porRegionLuegoJefatura.entrySet().stream()
                .map(regionEntry -> {
                    String nombreRegion = regionEntry.getKey();

                    // Hijos (jefaturas)
                    List<UnidadHijoDTO> hijos = regionEntry.getValue().entrySet().stream()
                            .map(jefEntry -> {
                                String nombreHijo = jefEntry.getKey();

                                // Nietos (unidades) bajo esta jefatura
                                List<UnidadNietoDto> nietos = jefEntry.getValue().stream()
                                        .map(u -> new UnidadNietoDto(u.getIdUnidad(), u.getNombreUnidad()))
                                        .sorted(Comparator.comparing(UnidadNietoDto::getNombreUnidad, Comparator.nullsLast(String::compareToIgnoreCase)))
                                        .toList();

                                // IDs asociados (sin duplicados)
                                List<Integer> idsAsociados = nietos.stream()
                                        .map(UnidadNietoDto::getId)
                                        .filter(Objects::nonNull)
                                        .distinct()
                                        .sorted()
                                        .toList();

                                return new UnidadHijoDTO(nombreHijo, idsAsociados, nietos);
                            })
                            .sorted(Comparator.comparing(UnidadHijoDTO::getNombreHijo, Comparator.nullsLast(String::compareToIgnoreCase)))
                            .toList();

                    // IDs de todos los nietos de la región (sin duplicados)
                    List<Integer> idsNietos = hijos.stream()
                            .flatMap(h -> h.getIdsAsociados().stream())
                            .distinct()
                            .sorted()
                            .toList();

                    return new RegionesJefaturasDTO(nombreRegion, idsNietos, hijos);
                })
                .sorted(Comparator.comparing(RegionesJefaturasDTO::getNombreRegion, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();
    }

    public cl.investigaciones.commonservices.dto.UnitContextDTO getUnitContext(String nombreUnidad) {
        Unidad start = unidadesRepository.findFirstByNombreUnidad(nombreUnidad)
                .orElseThrow(() -> new RuntimeException("Unidad no encontrada: " + nombreUnidad));
        
        String region = start.getNombreRegion();
        String subdireccion = "No determinada";

        Unidad current = start;
        Set<String> visited = new HashSet<>();
        
        // Traverse up
        while (current != null) {
            String name = current.getNombreUnidad();
            if (visited.contains(name)) break; // Prevent infinite loops
            visited.add(name);

            if (name != null && name.toUpperCase().startsWith("SUBDIRECCI")) {
                subdireccion = name;
                break;
            }

            String parentName = current.getNombreUnidadReporta();
            if (parentName == null || parentName.isBlank()) break;
            
            current = unidadesRepository.findFirstByNombreUnidad(parentName).orElse(null);
        }

        return new cl.investigaciones.commonservices.dto.UnitContextDTO(region, subdireccion);
    }

    // Helper para evitar NPE en claves de agrupación
    private static String nvl(String s) {
        return (s == null || s.isBlank()) ? "(SIN INFORMAR)" : s;
    }
}
