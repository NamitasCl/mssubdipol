package cl.investigaciones.nodos.domain.entidadesconsulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaCalidadPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaDelito;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaNacionalidad;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "ficha_persona", schema = "public")
@Data
@EqualsAndHashCode(exclude = {"delitos", "estados", "memo"})
@Immutable
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @Column(name = "\"sexo\"")
    private String sexo;

    @Column(name = "\"edad\"")
    private Integer edad;

    @ManyToOne
    @JoinColumn(name = "memos_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private java.util.Set<ListaDelito> delitos = new java.util.HashSet<>();

    // >>> relación muchos-a-muchos con estado
    @ManyToMany(fetch = FetchType.LAZY)
    @org.hibernate.annotations.Immutable     // colección de solo lectura
    @JoinTable(
            name = "\"ficha_persona_estadoP\"", // ¡ojo con la P mayúscula!
            schema = "public",
            joinColumns = @JoinColumn(name = "\"persona_id\"", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "calidadpersona_id", referencedColumnName = "id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Set<ListaCalidadPersona> estados = new java.util.HashSet<>();

}
