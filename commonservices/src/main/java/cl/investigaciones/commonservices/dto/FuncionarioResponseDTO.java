package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FuncionarioResponseDTO {

    private Long id;
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String nombreCargo;
    private String nombreUnidad;
    private String siglasUnidad;
    private int antiguedad;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreFun() {
        return nombreFun;
    }

    public void setNombreFun(String nombreFun) {
        this.nombreFun = nombreFun;
    }

    public String getApellidoPaternoFun() {
        return apellidoPaternoFun;
    }

    public void setApellidoPaternoFun(String apellidoPaternoFun) {
        this.apellidoPaternoFun = apellidoPaternoFun;
    }

    public String getApellidoMaternoFun() {
        return apellidoMaternoFun;
    }

    public void setApellidoMaternoFun(String apellidoMaternoFun) {
        this.apellidoMaternoFun = apellidoMaternoFun;
    }

    public String getSiglasCargo() {
        return siglasCargo;
    }

    public void setSiglasCargo(String siglasCargo) {
        this.siglasCargo = siglasCargo;
    }

    public String getNombreCargo() {
        return nombreCargo;
    }

    public void setNombreCargo(String nombreCargo) {
        this.nombreCargo = nombreCargo;
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public String getSiglasUnidad() {
        return siglasUnidad;
    }

    public void setSiglasUnidad(String siglasUnidad) {
        this.siglasUnidad = siglasUnidad;
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
