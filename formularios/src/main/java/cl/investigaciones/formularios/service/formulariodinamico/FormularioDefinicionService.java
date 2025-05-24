package cl.investigaciones.formularios.service.formulariodinamico;

import cl.investigaciones.formularios.dto.formulariodinamico.FormularioCampoDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionRequestDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioDefinicionResponseDTO;
import cl.investigaciones.formularios.dto.formulariodinamico.FormularioVisibilidadDTO;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioCampo;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioDefinicion;
import cl.investigaciones.formularios.model.formulariodinamico.FormularioVisibilidad;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioCampoRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioDefinicionRepository;
import cl.investigaciones.formularios.repository.formulariodinamico.FormularioVisibilidadRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormularioDefinicionService {

    @Autowired
    private FormularioDefinicionRepository definicionRepo;
    @Autowired
    private FormularioCampoRepository campoRepo;
    @Autowired
    private FormularioVisibilidadRepository visibilidadRepo;

    @Transactional
    public FormularioDefinicionResponseDTO crearFormulario(FormularioDefinicionRequestDTO dto) {
        FormularioDefinicion entidad = new FormularioDefinicion();
        entidad.setNombre(dto.getNombre());
        entidad.setDescripcion(dto.getDescripcion());
        entidad.setActivo(true);
        entidad.setFechaCreacion(LocalDateTime.now());

        // Guardar para obtener el ID
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

        // Guardar visibilidad
        List<FormularioVisibilidad> visibilidades = new ArrayList<>();
        for (FormularioVisibilidadDTO visDTO : dto.getVisibilidad()) {
            FormularioVisibilidad vis = new FormularioVisibilidad();
            vis.setFormulario(entidad);
            vis.setTipoDestino(visDTO.getTipoDestino());
            vis.setValorDestino(visDTO.getValorDestino());
            visibilidadRepo.save(vis);
            visibilidades.add(vis);
        }
        entidad.setVisibilidad(visibilidades);

        definicionRepo.save(entidad);

        // Devolver el DTO de respuesta
        return toResponseDTO(entidad);
    }

    // Para listar todos los formularios activos
    public List<FormularioDefinicionResponseDTO> listarFormulariosActivos() {
        List<FormularioDefinicion> lista = definicionRepo.findAll()
                .stream().filter(FormularioDefinicion::isActivo).collect(Collectors.toList());
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
        dto.setVisibilidad(
                entidad.getVisibilidad().stream().map(v -> {
                    FormularioVisibilidadDTO vDTO = new FormularioVisibilidadDTO();
                    vDTO.setTipoDestino(v.getTipoDestino());
                    vDTO.setValorDestino(v.getValorDestino());
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

}

