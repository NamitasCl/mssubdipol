package cl.investigaciones.nodos.domain.entidadesconsulta;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "ficha_funcionariosmemo", schema = "public")
@Data
@Immutable
public class FichaFuncionario {

    @Id
    private Long id;

    @Column(name = "\"funcionario\"")
    private String funcionario;

    @Column(name = "\"tipoF\"")
    private String responsabilidadMemo;

    @ManyToOne
    @JoinColumn(name = "id_memo_id")
    private FichaMemo memo;
}
