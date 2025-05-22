package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class UnidadColaboradora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreUnidad;
    private int cantFuncAporte;
    private int maxTurnos;
    private int trabajadoresPorDia;
    private boolean trabajaFindesemana;

    // Asociación: Cada solicitud se asocia a un registro mensual
    @ManyToOne
    @JoinColumn(name = "turno_asignacion_id")
    private TurnoAsignacion turnoAsignacion;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public int getCantFuncAporte() {
        return cantFuncAporte;
    }

    public void setCantFuncAporte(int cantFuncAporte) {
        this.cantFuncAporte = cantFuncAporte;
    }

    public int getMaxTurnos() {
        return maxTurnos;
    }

    public void setMaxTurnos(int maxTurnos) {
        this.maxTurnos = maxTurnos;
    }

    public int getTrabajadoresPorDia() {
        return trabajadoresPorDia;
    }

    public void setTrabajadoresPorDia(int trabajadoresPorDia) {
        this.trabajadoresPorDia = trabajadoresPorDia;
    }

    public boolean isTrabajaFindesemana() {
        return trabajaFindesemana;
    }

    public void setTrabajaFindesemana(boolean trabajaFindesemana) {
        this.trabajaFindesemana = trabajaFindesemana;
    }

    public TurnoAsignacion getTurnoAsignacion() {
        return turnoAsignacion;
    }

    public void setTurnoAsignacion(TurnoAsignacion turnoAsignacion) {
        this.turnoAsignacion = turnoAsignacion;
    }
}