package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.*;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioCampo;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioVisibilidad;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioCampoRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioRegistroRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioVisibilidadRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FormularioDefinicionService {

    @Autowired
    private FormularioDefinicionRepository definicionRepo;
    @Autowired
    private FormularioCampoRepository campoRepo;
    @Autowired
    private FormularioVisibilidadRepository visibilidadRepo;
    @Autowired
    private FormularioRegistroRepository registroRepo;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    public FormularioDefinicionResponseDTO crearFormulario(FormularioDefinicionRequestDTO dto, Integer idCreador) {
        FormularioDefinicion entidad = new FormularioDefinicion();
        entidad.setNombre(dto.getNombre());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setActivo(true);
        entidad.setFechaCreacion(LocalDateTime.now());
        entidad.setIdCreador(idCreador);

        // Guardar primero para obtener el ID
        definicionRepo.save(entidad);

        // Guardar campos
        List<FormularioCampo> campos = new ArrayList<>();
        for (FormularioCampoDTO campoDTO : dto.getCampos()) {
            FormularioCampo campo = new FormularioCampo();
            campo.setFormulario(entidad);
            campo.setNombre(campoDTO.getNombre());
            campo.setEtiqueta(campoDTO.getEtiqueta());
            campo.setTipo(campoDTO.getTipo());
            campo.setRequerido(campoDTO.getRequerido());
            campo.setOpciones(campoDTO.getOpciones());
            campo.setOrden(campoDTO.getOrden());
            campoRepo.save(campo);
            campos.add(campo);
        }
        entidad.setCampos(campos);

        // VISIBILIDAD
        List<FormularioVisibilidadDTO> reglas = dto.getVisibilidad();
        boolean esPublica = reglas.stream()
                .anyMatch(v -> "publica".equalsIgnoreCase(v.getTipoDestino()));
        List<FormularioVisibilidad> visibilidades = new ArrayList<>();

        if (esPublica) {
            FormularioVisibilidad vis = new FormularioVisibilidad();
            vis.setFormulario(entidad);
            vis.setTipoDestino("publica");
            vis.setValorDestino(null);
            vis.setValorDestinoNombre("Pública");
            vis.setValorDestinoSiglas(null);
            visibilidadRepo.save(vis);
            visibilidades.add(vis);
        } else {
            for (FormularioVisibilidadDTO visDTO : reglas) {
                FormularioVisibilidad vis = new FormularioVisibilidad();
                vis.setFormulario(entidad);
                vis.setTipoDestino(visDTO.getTipoDestino());
                vis.setValorDestino(visDTO.getValorDestino());
                vis.setValorDestinoNombre(obtenerNombreVisibilidad(visDTO.getTipoDestino(), visDTO.getValorDestino()).get("nombre"));
                vis.setValorDestinoSiglas(obtenerNombreVisibilidad(visDTO.getTipoDestino(), visDTO.getValorDestino()).get("siglas"));
                visibilidadRepo.save(vis);
                visibilidades.add(vis);
            }
        }
        entidad.setVisibilidad(visibilidades);
        System.out.println("Formulario creado: " + entidad);
        definicionRepo.save(entidad);

        return toResponseDTO(entidad);
    }


    // Para listar todos los formularios activos
    public List<FormularioDefinicionResponseDTO> listarFormulariosActivos() {
        List<FormularioDefinicion> lista = definicionRepo.findAll()
                .stream().collect(Collectors.toList());
        return lista.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<FormularioDefinicionResponseDTO> listarFormulariosActivosByCreador(Integer idCreador) {
        System.out.println("Entrando al metodo listarFormulariosActivosByCreador");
        List<FormularioDefinicion> lista = definicionRepo.findAllByIdCreador(idCreador)
                .stream().collect(Collectors.toList());

        for (FormularioDefinicion formulario : lista) {
            System.out.println("formulario: " + formulario.getNombre());
        }

        return lista.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // Método para mapear entidad a ResponseDTO
    private FormularioDefinicionResponseDTO toResponseDTO(FormularioDefinicion entidad) {
        FormularioDefinicionResponseDTO dto = new FormularioDefinicionResponseDTO();
        dto.setId(entidad.getId());
        dto.setNombre(entidad.getNombre());
        dto.setDescripcion(entidad.getDescripcion());
        dto.setActivo(entidad.isActivo());
        dto.setFechaCreacion(entidad.getFechaCreacion());
        dto.setCampos(
                entidad.getCampos().stream().map(c -> {
                    FormularioCampoDTO cDTO = new FormularioCampoDTO();
                    cDTO.setNombre(c.getNombre());
                    cDTO.setEtiqueta(c.getEtiqueta());
                    cDTO.setTipo(c.getTipo());
                    cDTO.setRequerido(c.getRequerido());
                    cDTO.setOpciones(c.getOpciones());
                    cDTO.setOrden(c.getOrden());
                    return cDTO;
                }).collect(Collectors.toList())
        );
        dto.setIdCreador(entidad.getIdCreador());
        dto.setVisibilidad(
                entidad.getVisibilidad().stream().map(v -> {
                    FormularioVisibilidadDTO vDTO = new FormularioVisibilidadDTO();
                    vDTO.setTipoDestino(v.getTipoDestino());
                    vDTO.setValorDestino(v.getValorDestino());
                    vDTO.setValorDestinoNombre(v.getValorDestinoNombre());
                    vDTO.setValorDestinoSiglas(v.getValorDestinoSiglas());
                    return vDTO;
                }).collect(Collectors.toList())
        );
        return dto;
    }

    private Map<String, String> obtenerNombreVisibilidad(String tipo, String valorDestino) {
        if ("usuario".equals(tipo)) {
            try {
                String url = "http://commonservices:8011/api/common/funcionarios/" + Integer.parseInt(valorDestino);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<?> request = new HttpEntity<>(headers);
                ResponseEntity<CSConsultaFuncionarioResponse> response = restTemplate
                        .exchange(url, HttpMethod.GET, request, CSConsultaFuncionarioResponse.class);

                if (response.getBody() != null) {
                    CSConsultaFuncionarioResponse f = response.getBody();
                    System.out.println("[obtenerNombreVisibilidad] Username obtenido: " + f.getNombreFun());

                    Map<String, String> funcionarioData = new HashMap<>();
                    funcionarioData.put("siglas", f.getUsername());
                    funcionarioData.put("nombre", f.getNombreFun() + " " + f.getApellidoPaternoFun() + " " + f.getApellidoMaternoFun());

                    return funcionarioData;
                }
            } catch (Exception ignored) {}
            Map<String, String> funcionarioData = new HashMap<>();
            funcionarioData.put("siglas", valorDestino);
            funcionarioData.put("nombre", valorDestino);
            return funcionarioData; // Fallback
        } else if ("unidad".equals(tipo)) {
            try {
                String url = "http://commonservices:8011/api/common/unidades/" + Integer.parseInt(valorDestino);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<?> request = new HttpEntity<>(headers);
                ResponseEntity<CSConsultaUnidadResponse> response = restTemplate
                        .exchange(url, HttpMethod.GET, request, CSConsultaUnidadResponse.class);

                if (response.getBody() != null) {
                    Map<String, String> unidadData = new HashMap<>();
                    unidadData.put("nombre", response.getBody().getNombreUnidad());
                    unidadData.put("siglas", response.getBody().getSiglasUnidad());
                    return unidadData;
                }
            } catch (Exception ignored) {}
            Map<String, String> unidadData = new HashMap<>();
            unidadData.put("nombre", valorDestino);
            unidadData.put("siglas", valorDestino);
            return unidadData; // Fallback
        } else if ("grupo".equals(tipo)) {
            Map<String, String> grupoData = new HashMap<>();
            grupoData.put("nombre", valorDestino);
            return grupoData;
        } else if ("publica".equals(tipo)) {
            Map<String, String> publicaData = new HashMap<>();
            publicaData.put("visibilidad", "Pública");
            return publicaData;
        }
        return new HashMap<>();
    }

    public FormularioDefinicionResponseDTO obtenerDefinicionPorId(Long id) {
        // Lógica para buscar por ID y mapear a DTO.
        FormularioDefinicion definicion = definicionRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado"));
        return toResponseDTO(definicion); // Ajusta según tu mapeo
    }

    @Transactional
    public void eliminarFormulario(Long id) {
        // Borrado lógico (recomendado)
        FormularioDefinicion formulario = definicionRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe formulario"));
        registroRepo.deleteByFormularioId(id);
        definicionRepo.deleteById(id);

        // Si quieres borrado físico, haz repo.deleteById(id);
    }

    public FormularioDefinicionResponseDTO cambiarEstadoFormulario(Long id, boolean activo) {
        FormularioDefinicion formulario = definicionRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No existe formulario"));
        formulario.setActivo(activo);
        definicionRepo.save(formulario);
        return toResponseDTO(formulario);
    }

    @Transactional
    public FormularioDefinicionResponseDTO actualizarFormulario(Long id, FormularioDefinicionRequestDTO dto, Integer idUsuario) {
        FormularioDefinicion entidad = definicionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulario no encontrado"));
        entidad.setNombre(dto.getNombre());
        entidad.setDescripcion(dto.getDescripcion());

        // Actualizar CAMPOS
        entidad.getCampos().clear();
        for (FormularioCampoDTO campoDTO : dto.getCampos()) {
            FormularioCampo campo = new FormularioCampo();
            campo.setFormulario(entidad);
            campo.setNombre(campoDTO.getNombre());
            campo.setEtiqueta(campoDTO.getEtiqueta());
            campo.setTipo(campoDTO.getTipo());
            campo.setRequerido(campoDTO.getRequerido());
            campo.setOpciones(campoDTO.getOpciones());
            campo.setOrden(campoDTO.getOrden());
            entidad.getCampos().add(campo);
        }

        // VISIBILIDAD
        entidad.getVisibilidad().clear();
        List<FormularioVisibilidadDTO> reglas = dto.getVisibilidad();
        boolean esPublica = reglas.stream().anyMatch(v -> "publica".equalsIgnoreCase(v.getTipoDestino()));
        if (esPublica) {
            FormularioVisibilidad vis = new FormularioVisibilidad();
            vis.setFormulario(entidad);
            vis.setTipoDestino("publica");
            vis.setValorDestino(null);
            vis.setValorDestinoNombre("Pública");
            entidad.getVisibilidad().add(vis);
            visibilidadRepo.save(vis);
        } else {
            for (FormularioVisibilidadDTO visDTO : reglas) {
                FormularioVisibilidad vis = new FormularioVisibilidad();
                vis.setFormulario(entidad);
                vis.setTipoDestino(visDTO.getTipoDestino());
                vis.setValorDestino(visDTO.getValorDestino());
                vis.setValorDestinoNombre(obtenerNombreVisibilidad(visDTO.getTipoDestino(), visDTO.getValorDestino()).get("nombre"));
                vis.setValorDestinoSiglas(obtenerNombreVisibilidad(visDTO.getTipoDestino(), visDTO.getValorDestino()).get("siglas"));
                entidad.getVisibilidad().add(vis);
                visibilidadRepo.save(vis);
            }
        }
        System.out.println("Formulario editado: " + entidad);
        definicionRepo.save(entidad);
        return toResponseDTO(entidad);
    }
}

