package cl.investigaciones.commonservices.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FuncionarioByIdFunRespDTO {
    private Long id;
    private int idFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String siglasUnidad;

    public FuncionarioByIdFunRespDTO() {}

    public FuncionarioByIdFunRespDTO(Long id, int idFun, String nombreFun, String apellidoPaternoFun, String apellidoMaternoFun, String siglasCargo, String siglasUnidad) {
        this.id = id;
        this.idFun = idFun;
        this.nombreFun = nombreFun;
        this.apellidoPaternoFun = apellidoPaternoFun;
        this.apellidoMaternoFun = apellidoMaternoFun;
        this.siglasCargo = siglasCargo;
        this.siglasUnidad = siglasUnidad;
    }

    public String getSiglasUnidad() {
        return siglasUnidad;
    }

    public void setSiglasUnidad(String siglasUnidad) {
        this.siglasUnidad = siglasUnidad;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getIdFun() {
        return idFun;
    }

    public void setIdFun(int idFun) {
        this.idFun = idFun;
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

    @Override
    public String toString() {
        return "FuncionarioByIdFunRespDTO{" +
                "id=" + id +
                ", idFun=" + idFun +
                ", nombreFun='" + nombreFun + '\'' +
                ", apellidoPaternoFun='" + apellidoPaternoFun + '\'' +
                ", apellidoMaternoFun='" + apellidoMaternoFun + '\'' +
                ", siglasCargo='" + siglasCargo + '\'' +
                ", siglasUnidad='" + siglasUnidad + '\'' +
                '}';
    }
}
