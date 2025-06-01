package cl.investigaciones.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UsuarioActiveDirectoryDTO {
    private String usuarioAD;
    private String runFun;
    private String dvFun;
    private String nombreFun;
    private String apellidoPaternoFun;
    private int idFun;
    private String siglasCargo;

    public String getSiglasCargo() {
        return siglasCargo;
    }

    public void setSiglasCargo(String siglasCargo) {
        this.siglasCargo = siglasCargo;
    }

    public int getIdFun() {
        return idFun;
    }

    public void setIdFun(int idFun) {
        this.idFun = idFun;
    }

    public String getUsuarioAD() {
        return usuarioAD;
    }

    public void setUsuarioAD(String usuarioAD) {
        this.usuarioAD = usuarioAD;
    }

    public String getRunFun() {
        return runFun;
    }

    public void setRunFun(String runFun) {
        this.runFun = runFun;
    }

    public String getDvFun() {
        return dvFun;
    }

    public void setDvFun(String dvFun) {
        this.dvFun = dvFun;
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

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public String getNombrePerfil() {
        return nombrePerfil;
    }

    public void setNombrePerfil(String nombrePerfil) {
        this.nombrePerfil = nombrePerfil;
    }

    public String getSiglasUnidad() {
        return siglasUnidad;
    }

    public void setSiglasUnidad(String siglasUnidad) {
        this.siglasUnidad = siglasUnidad;
    }

    public String getNombreCargo() {
        return nombreCargo;
    }

    public void setNombreCargo(String nombreCargo) {
        this.nombreCargo = nombreCargo;
    }

    public String getEmailFun() {
        return emailFun;
    }

    public void setEmailFun(String emailFun) {
        this.emailFun = emailFun;
    }

    public String getAntiguedad() {
        return antiguedad;
    }

    public void setAntiguedad(String antiguedad) {
        this.antiguedad = antiguedad;
    }

    private String apellidoMaternoFun;
    private String nombreUnidad;
    private String nombrePerfil;
    private String siglasUnidad;
    private String nombreCargo;
    private String emailFun;
    private String antiguedad;


}
