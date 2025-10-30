package cl.investigaciones.turnosv2.domain.enums;

public enum Grado {
    PFT("Prefecto"),
    SPF("Subprefecto"),
    SPF_OPP("Subprefecto OPP"),
    COM("Comisario"),
    COM_OPP("Comisario OPP"),
    SBC("Subcomisario"),
    SBC_OPP("Subcomisario OPP"),
    ISP("Inspector"),
    SBI("Subinspector"),
    DTV("Detective"),
    APS("Agente Policial Superior"),
    AP("Agente Policial"),
    AP_AC("Agente Policial A/C");

    private final String descripcion;

    Grado(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }

}