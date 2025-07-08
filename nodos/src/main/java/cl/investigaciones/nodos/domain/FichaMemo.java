package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ficha_memo", schema = "nodos")
@Data
@Immutable
public class FichaMemo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "formulario")
    private String formulario;

    @Column(name = "fecha")
    private OffsetDateTime fecha;

    @Column(name = "folioBrain")
    private String folioBrain;

    @Column(name = "ruc")
    private String ruc;

    @Column(name = "modusDescripcion")
    private String modusDescripcion;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaPersona> fichaPersonas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaArmas> fichaArmas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaDineros> fichaDineros;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaDrogas> fichaDrogas;

    @OneToMany(mappedBy = "memo", fetch = FetchType.LAZY)
    private List<FichaFuncionarios> fichaFuncionarios;
}
