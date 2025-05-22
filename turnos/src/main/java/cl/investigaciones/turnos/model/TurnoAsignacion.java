package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class TurnoAsignacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int mes;
    private int anio;

    // Flag para indicar si el mes está abierto o cerrado
    private boolean activo;

    private int cantidadTurnosDiarios;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaAsignacion> asignaciones;

    @OneToMany(mappedBy = "turnoAsignacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnidadColaboradora> unidadesColaboradoras;

    public int getCantidadTurnosDiarios() {
        return cantidadTurnosDiarios;
    }

    public void setCantidadTurnosDiarios(int cantidadTurnosDiarios) {
        this.cantidadTurnosDiarios = cantidadTurnosDiarios;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public List<DiaAsignacion> getAsignaciones() {
        return asignaciones;
    }

    public void setAsignaciones(List<DiaAsignacion> asignaciones) {
        this.asignaciones = asignaciones;
    }

    public List<UnidadColaboradora> getUnidadesColaboradoras() {
        return unidadesColaboradoras;
    }

    public void setUnidadesColaboradoras(List<UnidadColaboradora> unidadesColaboradoras) {
        this.unidadesColaboradoras = unidadesColaboradoras;
    }
}