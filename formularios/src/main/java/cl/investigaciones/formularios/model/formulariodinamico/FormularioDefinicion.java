package cl.investigaciones.formularios.model.formulariodinamico;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "formulario_definicion")
@Getter
@Setter
@NoArgsConstructor

public class FormularioDefinicion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;

    private boolean activo = true;

    private Integer idCreador; //Id del creador -> es el idFuncionario de Commons.

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private LocalDateTime fechaLimite; // null = no deadline

    @OneToMany(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orden ASC")
    private List<FormularioCampo> campos = new ArrayList<>();

    @OneToMany(mappedBy = "formulario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FormularioVisibilidad> visibilidad = new ArrayList<>();

}

