package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroResponseDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.registroservicedto.RegistroServiceFuncResponse;
import cl.investigaciones.formularios.dto.formulariodinamico.registroservicedto.RegistroServiceUnidadResponse;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioRegistro;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioRegistroRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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



}