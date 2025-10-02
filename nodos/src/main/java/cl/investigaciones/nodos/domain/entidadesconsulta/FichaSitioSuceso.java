package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ficha_sitios", schema = "public")
@Data
@Immutable
public class FichaSitioSuceso {

    @Id
    private Long id;

    @Column(name = "\"fechaSS\"")
    private OffsetDateTime fechaConcurrenciaSs;

    @Column(name = "\"nombreVia\"")
    private String calle;

    @Column(name = "\"num\"")
    private String numero;

    @Column(name = "\"depto\"")
    private String depto;

    @Column(name = "\"block\"")
    private String block;

    @Column(name = "\"comunaS\"")
    private String comuna;

    @Column(name = "\"region\"")
    private String region;

    @Column(name = "\"tiposs\"")
    private String tipoSitioSuceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "\"id_memo_id\"")
    private FichaMemo memo;
}
