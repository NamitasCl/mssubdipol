package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioRegistroResponseDTO;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioRegistro;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioRegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public FormularioRegistroResponseDTO guardarRegistro(Integer usuarioId, FormularioRegistroRequestDTO dto) {
        FormularioDefinicion def = definicionRepo.findById(dto.getFormularioId())
                .orElseThrow(() -> new IllegalArgumentException("Formulario no existe"));

        FormularioRegistro reg = new FormularioRegistro();
        reg.setFormulario(def);
        reg.setIdFuncionario(usuarioId);
        reg.setFechaRespuesta(LocalDateTime.now());
        reg.setDatos(dto.getDatos()); // ← Guardar directamente el Map

        registroRepo.save(reg);

        // Armar DTO de respuesta
        FormularioRegistroResponseDTO res = new FormularioRegistroResponseDTO();
        res.setId(reg.getId());
        res.setFormularioId(def.getId());
        res.setIdFuncionario(usuarioId);
        res.setFechaRespuesta(reg.getFechaRespuesta());
        res.setDatos(dto.getDatos());
        return res;
    }

    public List<FormularioRegistroResponseDTO> listarPorFormulario(Long formularioId) {
        List<FormularioRegistro> registros = registroRepo.findByFormularioId(formularioId);
        return registros.stream().map(r -> {
            FormularioRegistroResponseDTO dto = new FormularioRegistroResponseDTO();
            dto.setId(r.getId());
            dto.setFormularioId(formularioId);
            dto.setIdFuncionario(r.getIdFuncionario());
            dto.setFechaRespuesta(r.getFechaRespuesta());
            // Aquí ya es Map, no necesitas deserializar nada
            dto.setDatos(r.getDatos() != null ? r.getDatos() : Collections.emptyMap());
            return dto;
        }).collect(Collectors.toList());
    }
}