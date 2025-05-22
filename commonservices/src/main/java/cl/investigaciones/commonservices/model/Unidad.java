package cl.investigaciones.commonservices.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Unidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int idUnidad;
    private String nombreUnidad;
    private String siglasUnidad;
    private String nombreComuna;

    //@ManyToOne(fetch = FetchType.LAZY)
    //@JoinColumn(name = "id_unidad_padre", referencedColumnName = "id")
    //private Unidad padre;




}
