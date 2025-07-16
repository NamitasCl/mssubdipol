package cl.investigaciones.nodos.domain.entidadesconsulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaMarca;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaModelo;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_vehiculos", schema = "public")
@Data
@Immutable
public class FichaVehiculo {

    @Id
    private Long id;

    @Column(name = "\"patente\"")
    private String patente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marcaV_id")
    private ListaMarca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modeloV_id")
    private ListaModelo modelo;

    @Column(name = "\"calidad\"")
    private String calidad;

    @Column(name = "\"obs\"")
    private String obs;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;

}
