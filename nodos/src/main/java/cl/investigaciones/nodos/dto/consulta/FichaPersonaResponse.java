package cl.investigaciones.nodos.dto.consulta;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FichaPersonaResponse {
    private Long id;
    private String rut;
    private String nombre;
    private String apellidoPat;
    private String apellidoMat;
    private String nacionalidad;
    private String direccion;
    private String direccionNumero;
    private String departamento;
    private String block;
    private String condicionMigratoria;
    private String apodo;
    private String ciudadNacimiento;
    private String observaciones;
    private String fono;
    private String correoElectronico;

    private List<FichaMemoDTO> memos;
}
