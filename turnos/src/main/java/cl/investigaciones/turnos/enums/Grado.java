package cl.investigaciones.turnos.enums;

public enum Grado {
    PFT("PFT"),
    SPF("SPF"),
    SPF_OPP("SPF (OPP)"),
    COM("COM"),
    COM_OPP("COM (OPP)"),
    SBC("SBC"),
    SBC_OPP("SBC (OPP)"),
    ISP("ISP"),
    SBI("SBI"),
    DTV("DTV"),
    APS("APS"),
    AP("AP"),
    APP("APP"),
    APP_AC("APP (AC)");

    private final String display;

    Grado(String display) {
        this.display = display;
    }

    public String getDisplay() {
        return display;
    }

    // Para buscar por string y devolver el enum (útil para parseo desde BD o formularios)
    public static Grado parseGrado(String display) {
        for (Grado g : Grado.values()) {
            if (g.display.equalsIgnoreCase(display.trim()) ||
                    g.name().replace("_OPP", " (OPP)").replace("_AC", " (AC)").equalsIgnoreCase(display.trim())) {
                return g;
            }
        }
        throw new IllegalArgumentException("Grado no encontrado: " + display);
    }


}
