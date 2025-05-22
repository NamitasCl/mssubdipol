package cl.investigaciones.commonservices.dto;


public class FuncionarioSearchResponseDTO {

    private Long id;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private int idFun;

    public FuncionarioSearchResponseDTO() {
    }

    public FuncionarioSearchResponseDTO(Long id, String nombreCompleto, String siglasCargo, int antiguedad, int idFun) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.siglasCargo = siglasCargo;
        this.antiguedad = antiguedad;
        this.idFun = idFun;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getSiglasCargo() {
        return siglasCargo;
    }

    public void setSiglasCargo(String siglasCargo) {
        this.siglasCargo = siglasCargo;
    }

    public int getAntiguedad() {
        return antiguedad;
    }

    public void setAntiguedad(int antiguedad) {
        this.antiguedad = antiguedad;
    }

    public int getIdFun() {
        return idFun;
    }

    public void setIdFun(int idFun) {
        this.idFun = idFun;
    }
}
