package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.FormularioAvanceDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroResponseDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.registroservicedto.RegistroServiceFuncResponse;
import cl.investigaciones.formularios.dto.formulariodinamico.registroservicedto.RegistroServiceUnidadResponse;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioRegistro;
import cl.investigaciones.formularios.repository.formulariodinamico.AsignacionCuotaFormularioRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioRegistroRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FormularioRegistroService {

    @Autowired
    private FormularioRegistroRepository registroRepo;

    @Autowired
    private FormularioDefinicionRepository definicionRepo;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AsignacionCuotaFormularioRepository asignacionCuotaRepo;

    public FormularioRegistroResponseDTO guardarRegistro(Integer usuarioId, FormularioRegistroRequestDTO dto) {
        FormularioDefinicion def = definicionRepo.findById(dto.getFormularioId())
                .orElseThrow(() -> new IllegalArgumentException("Formulario no existe"));

        FormularioRegistro reg = new FormularioRegistro();
        reg.setFormulario(def);
        reg.setIdFuncionario(usuarioId);
        reg.setFechaRespuesta(LocalDateTime.now());
        reg.setDatos(dto.getDatos()); // ← Guardar directamente el Map
        reg.setIdUnidad(obtenerUnidadPorFuncionario(usuarioId));

        registroRepo.save(reg);

        // Armar DTO de respuesta
        FormularioRegistroResponseDTO res = new FormularioRegistroResponseDTO();
        res.setId(reg.getId());
        res.setFormularioId(def.getId());
        res.setIdFuncionario(usuarioId);
        res.setFechaRespuesta(reg.getFechaRespuesta());
        res.setDatos(dto.getDatos());
        res.setIdUnidad(reg.getIdUnidad());
        return res;
    }

    public List<FormularioRegistroResponseDTO> listarPorFormulario(Long formularioId) {
        List<FormularioRegistro> registros = registroRepo.findByFormularioId(formularioId);
        return registros.stream().map(r -> {
            FormularioRegistroResponseDTO dto = new FormularioRegistroResponseDTO();
            dto.setId(r.getId());
            dto.setFormularioId(formularioId);
            dto.setIdFuncionario(r.getIdFuncionario());
            dto.setIdUnidad(r.getIdUnidad());
            dto.setFechaRespuesta(r.getFechaRespuesta());
            // Aquí ya es Map, no necesitas deserializar nada
            dto.setDatos(r.getDatos() != null ? r.getDatos() : Collections.emptyMap());

            return dto;
        }).collect(Collectors.toList());
    }

    private Integer obtenerUnidadPorFuncionario(Integer idFuncionario) {
        String urlFuncionario = "http://commonservices:8011/api/common/funcionarios/" + idFuncionario;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<RegistroServiceFuncResponse> response = restTemplate.exchange(
                urlFuncionario, HttpMethod.GET, entity, RegistroServiceFuncResponse.class
        );

        if(response.getBody() == null || response.getBody().getSiglasUnidad() == null) {
            // Lanza excepción personalizada
            throw new EntityNotFoundException("No se encontró la información del funcionario " + idFuncionario);
        }
        String siglasUnidad = response.getBody().getSiglasUnidad();

        String urlUnidad = "http://commonservices:8011/api/common/unidades/sigla/" + siglasUnidad;
        ResponseEntity<RegistroServiceUnidadResponse> unidadResponse = restTemplate.exchange(
                urlUnidad, HttpMethod.GET, entity, RegistroServiceUnidadResponse.class
        );

        if(unidadResponse.getBody() == null) {
            throw new EntityNotFoundException("No se encontró la unidad con sigla " + siglasUnidad);
        }
        return unidadResponse.getBody().getIdUnidad();
    }

    // Puedes implementar este método usando el mismo llamado que ya haces para obtener idUnidad
    public Integer obtenerUnidadPorSigla(String siglasUnidad) {
        // Si ya tienes uno, usa ese. Si no, este es un ejemplo:
        String urlUnidad = "http://commonservices:8011/api/common/unidades/sigla/" + siglasUnidad;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<RegistroServiceUnidadResponse> unidadResponse = restTemplate.exchange(
                urlUnidad, HttpMethod.GET, entity, RegistroServiceUnidadResponse.class
        );
        if (unidadResponse.getBody() != null) {
            return unidadResponse.getBody().getIdUnidad();
        }
        return null;
    }

    public List<FormularioRegistroResponseDTO> listarPorFormularioYUsuario(Long formularioId, Integer usuarioId) {
        List<FormularioRegistro> registros = registroRepo.findByFormularioIdAndIdFuncionario(formularioId, usuarioId);
        return registros.stream().map(r -> {
            FormularioRegistroResponseDTO dto = new FormularioRegistroResponseDTO();
            dto.setId(r.getId());
            dto.setFormularioId(formularioId);
            dto.setIdFuncionario(r.getIdFuncionario());
            dto.setIdUnidad(r.getIdUnidad());
            dto.setFechaRespuesta(r.getFechaRespuesta());
            dto.setDatos(r.getDatos() != null ? r.getDatos() : Collections.emptyMap());
            return dto;
        }).collect(Collectors.toList());
    }

    public FormularioRegistroResponseDTO editarRegistroPropio(Long registroId, Integer usuarioId, FormularioRegistroRequestDTO dto) {
        FormularioRegistro reg = registroRepo.findById(registroId)
                .orElseThrow(() -> new EntityNotFoundException("Registro no encontrado"));

        /*if (!reg.getIdFuncionario().equals(usuarioId)) {
            throw new SecurityException("No puede editar registros de otro usuario.");
        }*/

        // Actualiza solo los campos editables (ejemplo: datos)
        reg.setDatos(dto.getDatos());
        reg.setFechaRespuesta(LocalDateTime.now()); // Opcional: marcar nueva fecha de edición

        registroRepo.save(reg);

        // Retorna el DTO actualizado
        FormularioRegistroResponseDTO res = new FormularioRegistroResponseDTO();
        res.setId(reg.getId());
        res.setFormularioId(reg.getFormulario().getId());
        res.setIdFuncionario(usuarioId);
        res.setFechaRespuesta(reg.getFechaRespuesta());
        res.setDatos(reg.getDatos());
        res.setIdUnidad(reg.getIdUnidad());
        return res;
    }

    public FormularioAvanceDTO obtenerAvance(Long formularioId, Integer idUsuario, String siglasUnidad) {
        FormularioAvanceDTO dto = new FormularioAvanceDTO();

        // Total registros de este formulario
        dto.total = registroRepo.findByFormularioId(formularioId).size();

        // Registros míos
        dto.mios = registroRepo.findByFormularioIdAndIdFuncionario(formularioId, idUsuario).size();

        // Registros de mi unidad
        // Obtén el idUnidad desde siglasUnidad (usa el método que ya tienes)
        Integer idUnidad = null;
        try {
            idUnidad = obtenerUnidadPorSigla(siglasUnidad); // Implementa si no existe
        } catch (Exception ignored) {}
        Integer finalIdUnidad = idUnidad;
        dto.unidad = (idUnidad != null)
                ? (int) registroRepo.findByFormularioId(formularioId)
                .stream().filter(r -> finalIdUnidad.equals(r.getIdUnidad())).count()
                : 0;

        // Cuota asignada a la unidad
        if (idUnidad != null) {
            var asignacion = asignacionCuotaRepo.findByFormularioIdAndIdUnidad(formularioId, idUnidad);
            dto.cuotaUnidad = (!asignacion.isEmpty()) ? asignacion.get(0).getCuotaAsignada() : null;
        }

        return dto;
    }


    public void eliminarRegistroPropio(Long registroId, Integer usuarioId) {
        FormularioRegistro registro = registroRepo.findById(registroId)
                .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
        /*if (!registro.getIdFuncionario().equals(usuarioId)) {
            throw new RuntimeException("No autorizado para eliminar este registro");
        }*/
        registroRepo.delete(registro);
    }

    public FormularioRegistroResponseDTO obtenerRegistroPropio(Long registroId,
                                                               Integer usuarioId) {
        FormularioRegistro registro = registroRepo.findByIdAndIdFuncionario(registroId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Registro no encontrado"));

        FormularioRegistroResponseDTO res = new FormularioRegistroResponseDTO();
        res.setId(registro.getId());
        res.setFormularioId(registro.getFormulario().getId());
        res.setIdFuncionario(registro.getIdFuncionario());
        res.setFechaRespuesta(LocalDateTime.now());
        res.setDatos(registro.getDatos());
        res.setIdUnidad(registro.getIdUnidad());


        return res;
    }
}