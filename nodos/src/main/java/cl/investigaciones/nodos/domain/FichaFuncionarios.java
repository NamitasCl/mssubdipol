package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_funcionarios")
@Data
@Immutable
public class FichaFuncionarios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "funcionario")
    private String funcionario;

    @Column(name = "tipoF")
    private String responsabilidadMemo;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;
}
