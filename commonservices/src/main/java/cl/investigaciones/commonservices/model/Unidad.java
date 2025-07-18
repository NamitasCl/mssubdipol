package cl.investigaciones.commonservices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Unidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int idUnidad;
    private String nombreUnidad;
    private String siglasUnidad;
    private String nombreComuna;
    private String nombreRegion;
    private String nombreUnidadReporta;
    private String regionPolicial;

    //@ManyToOne(fetch = FetchType.LAZY)
    //@JoinColumn(name = "id_unidad_padre", referencedColumnName = "id")
    //private Unidad padre;




}
