package cl.investigaciones.commonservices.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "funcionarios"
)
@Getter
@Setter
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name= "idFun", unique = true, nullable = false, updatable = false)
    private int idFun;

    private String nombreFun;
    private String apellidoPaternoFun;
    private String apellidoMaternoFun;
    private String siglasCargo;
    private String nombreCargo;
    private String nombreUnidad;
    private String siglasUnidad;
    private String username;
    private Integer rut;
    private String dv;
    private String email;
    private int antiguedad;



}
