package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_persona")
@Data
@Immutable
public class FichaPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rut")
    private String rut;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellidoPat")
    private String apellidoPat;

    @Column(name = "apellidoMat")
    private String apellidoMat;

    @Column(name = "nombreViaP")
    private String direccion;

    @Column(name = "numP")
    private String direccionNumero;

    @Column(name = "deptoP")
    private String departamento;

    @Column(name = "blockP")
    private String block;

    @Column(name = "condicionMigra")
    private String condicionMigratoria;

    @Column(name = "apodo")
    private String apodo;

    @Column(name = "ciudadNacP")
    private String ciudadNacimiento;

    @Column(name = "obs")
    private String observaciones;

    @Column(name = "fono")
    private String fono;

    @Column(name = "correo")
    private String correoElectronico;


    @ManyToOne
    @JoinColumn(name = "memos_id")
    private FichaMemo memo;

}
