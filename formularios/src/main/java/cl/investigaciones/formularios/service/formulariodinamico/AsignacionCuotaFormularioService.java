package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.AsignacionCuotaFormularioDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.CSConsultaUnidadResponse;
import cl.investigaciones.formularios.model.formulariodinamico.AsignacionCuotaFormulario;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.repository.formulariodinamico.AsignacionCuotaFormularioRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AsignacionCuotaFormularioService {

    @Autowired
    private AsignacionCuotaFormularioRepository repository;

    @Autowired
    private FormularioDefinicionRepository formularioRepo;

    @Autowired
    private RestTemplate restTemplate;

    // Asignar una cuota nueva (padre o normal)
    @Transactional
    public AsignacionCuotaFormularioDTO crearAsignacion(AsignacionCuotaFormularioDTO dto) {
        FormularioDefinicion formulario = formularioRepo.findById(dto.getFormularioId())
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado"));
        AsignacionCuotaFormulario entidad = new AsignacionCuotaFormulario();
        entidad.setFormulario(formulario);
        entidad.setIdUnidad(dto.getIdUnidad());
        entidad.setIdFuncionario(dto.getIdFuncionario()); // <-- NUEVO
        entidad.setCuotaAsignada(dto.getCuotaAsignada());
        entidad.setCuotaPadreId(dto.getCuotaPadreId());
        repository.save(entidad);
        return toDTO(entidad);
    }

    // Delegar una cuota (asignación hija con referencia a cuotaPadreId)
    @Transactional
    public AsignacionCuotaFormularioDTO delegarAsignacion(AsignacionCuotaFormularioDTO dto) {
        AsignacionCuotaFormulario padre = repository.findById(dto.getCuotaPadreId())
                .orElseThrow(() -> new EntityNotFoundException("Cuota padre no encontrada"));

        int sumaHijas = repository.findByCuotaPadreId(padre.getId())
                .stream().mapToInt(a -> a.getCuotaAsignada() == null ? 0 : a.getCuotaAsignada()).sum();

        if (dto.getCuotaAsignada() != null && padre.getCuotaAsignada() != null &&
                (sumaHijas + dto.getCuotaAsignada()) > padre.getCuotaAsignada()) {
            throw new IllegalArgumentException("La suma de las cuotas hijas excede la cuota asignada al padre.");
        }

        AsignacionCuotaFormulario entidad = new AsignacionCuotaFormulario();
        entidad.setFormulario(padre.getFormulario());
        entidad.setIdUnidad(dto.getIdUnidad());
        entidad.setIdFuncionario(dto.getIdFuncionario()); // <-- NUEVO
        entidad.setCuotaAsignada(dto.getCuotaAsignada());
        entidad.setCuotaPadreId(dto.getCuotaPadreId());
        repository.save(entidad);
        return toDTO(entidad);
    }

    // Listar cuotas por unidad
    public List<AsignacionCuotaFormularioDTO> listarPorUnidad(Integer idUnidad) {
        return repository.findByIdUnidad(idUnidad).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Listar cuotas por formulario (todas: unidad y funcionario)
    public List<AsignacionCuotaFormularioDTO> listarPorFormulario(Long formularioId) {
        return repository.findByFormularioId(formularioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Listar hijas de una cuota padre
    public List<AsignacionCuotaFormularioDTO> listarPorPadre(Long cuotaPadreId) {
        return repository.findByCuotaPadreId(cuotaPadreId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // (Opcional) Listar todas las cuotas que tiene asignada un usuario/unidad
    public List<AsignacionCuotaFormularioDTO> listarPorUsuarioYUnidad(int idFuncionario, String siglasUnidad) {
        Integer idUnidad = null;
        try {
            idUnidad = buscarIdUnidadPorSigla(siglasUnidad);
        } catch (Exception ignored) {}
        // Busca por idFuncionario O por idUnidad
        Integer finalIdUnidad = idUnidad;
        return repository.findAll().stream()
                .filter(a ->
                        (a.getIdFuncionario() != null && a.getIdFuncionario().equals(idFuncionario))
                                || (finalIdUnidad != null && a.getIdUnidad() != null && a.getIdUnidad().equals(finalIdUnidad))
                )
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Método para contar registros completados por unidad y formulario (avance)
    public int contarRegistrosCompletados(Long formularioId, Integer idUnidad) {
        // TODO: Implementa con tu registroRepo si corresponde
        return 0;
    }

    // --------- Utilidades ---------
    private AsignacionCuotaFormularioDTO toDTO(AsignacionCuotaFormulario entidad) {
        AsignacionCuotaFormularioDTO dto = new AsignacionCuotaFormularioDTO();
        dto.setId(entidad.getId());
        dto.setFormularioId(entidad.getFormulario().getId());
        dto.setIdUnidad(entidad.getIdUnidad());
        dto.setCuotaAsignada(entidad.getCuotaAsignada());
        dto.setCuotaPadreId(entidad.getCuotaPadreId());
        dto.setIdFuncionario(entidad.getIdFuncionario()); // <-- NUEVO
        return dto;
    }

    public Integer buscarIdUnidadPorSigla(String siglasUnidad) {
        String url = "http://commonservices:8011/api/common/unidades/sigla/" + siglasUnidad;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<CSConsultaUnidadResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, CSConsultaUnidadResponse.class
            );
            if (response.getBody() != null && response.getBody().getIdUnidad() != null) {
                return response.getBody().getIdUnidad();
            }
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo obtener el idUnidad para la sigla: " + siglasUnidad);
        }
        return null;
    }
}