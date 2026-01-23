package cl.investigaciones.commonservices.dto;


import lombok.Data;

@Data
public class FuncionarioSearchResponseDTO {

    private Long id;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private int idFun;
    private String siglasUnidad;
    // Enhanced fields for Auto-fill
    private String nombreUnidad;
    private String subdireccion;
    private String region;
    private String jefatura; // Maps to RegionPolicial
    private String prefectura; // Maps to UnidadReporta
    private String grado;

}
