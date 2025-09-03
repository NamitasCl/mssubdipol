package cl.investigaciones.nodos.domain.entidadesconsulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaDelito;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaNacionalidad;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ficha_persona", schema = "public")
@Data
@Immutable
public class FichaPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "\"rut\"")
    private String rut;

    @Column(name = "\"created_at\"")
    private OffsetDateTime createdAt;

    @Column(name = "\"nombre\"")
    private String nombre;

    @Column(name = "\"apellidoPat\"")
    private String apellidoPat;

    @Column(name = "\"apellidoMat\"")
    private String apellidoMat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"nacionalidadP_id\"")
    private ListaNacionalidad nacionalidad;

    @Column(name = "\"nombreViaP\"")
    private String direccion;

    @Column(name = "\"numP\"")
    private String direccionNumero;

    @Column(name = "\"deptoP\"")
    private String departamento;

    @Column(name = "\"blockP\"")
    private String block;

    @Column(name = "\"condicionMigra\"")
    private String condicionMigratoria;

    @Column(name = "\"apodo\"")
    private String apodo;

    @Column(name = "\"ciudadNacP\"")
    private String ciudadNacimiento;

    @Column(name = "\"obs\"")
    private String observaciones;

    @Column(name = "\"fono\"")
    private String fono;

    @Column(name = "\"correo\"")
    private String correoElectronico;


    @ManyToOne
    @JoinColumn(name = "memos_id")
    private FichaMemo memo;

    // >>> relación muchos-a-muchos con delitos
    @ManyToMany(fetch = FetchType.LAZY)
    @org.hibernate.annotations.Immutable     // colección de solo lectura
    @JoinTable(
            name = "\"ficha_persona_delitosP\"", // ¡ojo con la P mayúscula!
            schema = "public",
            joinColumns = @JoinColumn(name = "\"persona_id\"", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "delitos_id", referencedColumnName = "id")
    )
    private java.util.Set<ListaDelito> delitos = new java.util.HashSet<>();

}
