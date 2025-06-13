package cl.investigaciones.turnos.scheduling.domain.cargo;

/**
 * Orden natural ⇒ ordinal más bajo = más antiguo.
 */
public enum Cargo {
    PFT(false), SPF(false), COM(false), SBC(false),
    ISP(false), SBI(false), DTV(false), APP(false), AP(false),
    SPF_OPP(true), COM_OPP(true), SBC_OPP(true);

    private final boolean opp;
    Cargo(boolean opp) { this.opp = opp; }
    public boolean isOpp() { return opp; }

    /**
     * Regla de antigüedad entre dos cargos.
     */
    public boolean esMasAntiguoQue(Cargo otro) {
        // Si ambos son el mismo cargo base, OPP siempre es menos antiguo.
        if (this.name().startsWith(otro.base()) && this.opp != otro.opp) {
            return !this.opp; // el que NO sea OPP es antiguo
        }
        return this.ordinal() < otro.ordinal();
    }

    private String base() {
        return name().replace("_OPP", "");
    }
}