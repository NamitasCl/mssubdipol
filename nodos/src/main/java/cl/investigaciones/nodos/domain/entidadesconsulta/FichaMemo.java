package cl.investigaciones.nodos.domain.entidadesconsulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaUnidad;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "ficha_memo", schema = "public")
@Data
@Immutable
public class FichaMemo {

    @Id
    private Long id;

    @Column(name = "\"formulario\"")
    private String formulario;

    @Column(name = "\"fecha\"")
    private OffsetDateTime fecha;

    @Column(name = "\"created_at\"")
    private OffsetDateTime createdAt;

    @Column(name = "\"tipo\"")
    private String tipo;

    @Column(name = "\"folioBrain\"")
    private String folioBrain;

    @Column(name = "\"ruc\"")
    private String ruc;

    @Column(name = "\"modusDescripcion\"")
    private String modusDescripcion;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaPersona> fichaPersonas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaArma> fichaArmas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaDinero> fichaDineros;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaDroga> fichaDrogas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaFuncionario> fichaFuncionarios;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaMunicion> fichaMuniciones;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaVehiculo> fichaVehiculos;

    @ManyToOne
    @JoinColumn(name = "\"unidad_id\"")
    private ListaUnidad unidad;
}
