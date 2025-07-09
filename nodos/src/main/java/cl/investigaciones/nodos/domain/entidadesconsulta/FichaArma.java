package cl.investigaciones.nodos.domain.entidadesconsulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaCalibre;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaModelo;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaTipoArma;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_armas", schema = "public")
@Data
@Immutable
public class FichaArma {

    @Id
    private Long id;

    @Column(name = "marcaArma")
    private String marcaArma;

    @Column(name = "serieArma")
    private String serieArma;

    @Column(name = "calidad")
    private String calidad; //Aqui puede ser INCAUTADO, SUSTRAIDO, ETC

    @Column(name = "condicion")
    private String condicion; //ARMA TRADICIONAL o ARMA MODIFICADA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calibreArma_id")
    private ListaCalibre calibreArma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arma_id")
    private ListaTipoArma tipoArma;

    @Column(name = "obs")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;

}
