package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_otrasespecies", schema = "public")
@Data
@Immutable
public class FichaOtrasEspecies {

    @Id
    private Long id;

    @Column(name = "\"calidad\"")
    private String calidad;

    @Column(name = "\"especie\"")
    private String descripcion;

    @Column(name = "\"nue\"")
    private String nue;

    @Column(name = "\"cantidad\"")
    private String cantidad;

    @Column(name = "\"avaluo\"")
    private String avaluo;

    @Column(name = "\"utiArma\"")
    private String utilizadoComoArma; // ✅ CAMBIADO DE Boolean A String

    @Column(name = "\"sitio_suceso\"")
    private String sitioSuceso;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;

}