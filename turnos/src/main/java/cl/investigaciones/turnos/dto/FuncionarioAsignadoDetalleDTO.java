package cl.investigaciones.turnos.dto;

public class FuncionarioAsignadoDetalleDTO {

    private int id;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;

    public FuncionarioAsignadoDetalleDTO() {
    }

    public FuncionarioAsignadoDetalleDTO(int id, String nombreCompleto, String siglasCargo, int antiguedad) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.siglasCargo = siglasCargo;
        this.antiguedad = antiguedad;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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
}
