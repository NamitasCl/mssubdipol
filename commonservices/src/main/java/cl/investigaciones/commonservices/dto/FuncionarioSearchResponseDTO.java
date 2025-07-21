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

}
