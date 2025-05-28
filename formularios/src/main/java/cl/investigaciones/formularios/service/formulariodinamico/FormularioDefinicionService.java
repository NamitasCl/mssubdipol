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
        entidad.setIdCreador(idCreador); // <--- guardar el creador si tienes este campo

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

        // --- VISIBILIDAD ---
        List<FormularioVisibilidadDTO> reglas = dto.getVisibilidad();
        // Si hay alguna "pública", quédate solo con esa (y rechaza combinaciones)
        boolean esPublica = reglas.stream()
                .anyMatch(v -> "publica".equalsIgnoreCase(v.getTipoDestino()));
        List<FormularioVisibilidad> visibilidades = new ArrayList<>();

        if (esPublica) {
            // Solo guarda la regla pública
            FormularioVisibilidad vis = new FormularioVisibilidad();
            vis.setFormulario(entidad);
            vis.setTipoDestino("publica");
            vis.setValorDestino(null);
            visibilidadRepo.save(vis);
            visibilidades.add(vis);
        } else {
            // Guarda todas las reglas normales (usuario, unidad, grupo)
            for (FormularioVisibilidadDTO visDTO : reglas) {
                // Si tienes lógica para evitar duplicados, agrégala aquí
                FormularioVisibilidad vis = new FormularioVisibilidad();
                vis.setFormulario(entidad);
                vis.setTipoDestino(visDTO.getTipoDestino());
                vis.setValorDestino(visDTO.getValorDestino());

                //Obtengo nombre de unidad/funcionario para la visibilidad
                String url = "http://commonservices:8011/api/common/unidades/" + Integer.parseInt(vis.getValorDestino());
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, String>> request = new HttpEntity<>(headers);
                ResponseEntity<CSConsultaUnidadResponse> response = restTemplate
                        .exchange(url, HttpMethod.GET, request, CSConsultaUnidadResponse.class);

                if(response.getBody() == null) {
                    throw new EntityNotFoundException("No se encontro la unidad.");
                }

                String nombreUnidad = response.getBody().getSiglasUnidad();
                vis.setValorDestinoNombre(nombreUnidad);

                visibilidadRepo.save(vis);
                visibilidades.add(vis);
            }
        }
        entidad.setVisibilidad(visibilidades);

        definicionRepo.save(entidad);

        // Devolver el DTO de respuesta
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
                    return vDTO;
                }).collect(Collectors.toList())
        );
        return dto;
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

        // Validación de autoría omitida por claridad

        // Actualizar los campos simples
        entidad.setNombre(dto.getNombre());
        entidad.setDescripcion(dto.getDescripcion());

        // Actualizar CAMPOS del formulario
        // 1. Borra todos los campos actuales desde la entidad
        entidad.getCampos().clear();
        // 2. Agrega los nuevos campos a la entidad
        for (FormularioCampoDTO campoDTO : dto.getCampos()) {
            FormularioCampo campo = new FormularioCampo();
            campo.setFormulario(entidad); // MUY IMPORTANTE para la relación
            campo.setNombre(campoDTO.getNombre());
            campo.setEtiqueta(campoDTO.getEtiqueta());
            campo.setTipo(campoDTO.getTipo());
            campo.setRequerido(campoDTO.getRequerido());
            campo.setOpciones(campoDTO.getOpciones());
            campo.setOrden(campoDTO.getOrden());
            entidad.getCampos().add(campo);
        }

        // Igual con visibilidad (si aplica)
        entidad.getVisibilidad().clear();
        for (FormularioVisibilidadDTO visDTO : dto.getVisibilidad()) {
            FormularioVisibilidad vis = new FormularioVisibilidad();
            vis.setFormulario(entidad);
            vis.setTipoDestino(visDTO.getTipoDestino());
            vis.setValorDestino(visDTO.getValorDestino());

            //Obtengo nombre de unidad/funcionario para la visibilidad
            String url = "http://commonservices:8011/api/common/unidades/" + Integer.parseInt(vis.getValorDestino());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(headers);
            ResponseEntity<CSConsultaUnidadResponse> response = restTemplate
                    .exchange(url, HttpMethod.GET, request, CSConsultaUnidadResponse.class);

            if(response.getBody() == null) {
                throw new EntityNotFoundException("No se encontro la unidad.");
            }

            String nombreUnidad = response.getBody().getSiglasUnidad();
            vis.setValorDestinoNombre(nombreUnidad);

            entidad.getVisibilidad().add(vis);
        }

        definicionRepo.save(entidad);

        return toResponseDTO(entidad);
    }
}

