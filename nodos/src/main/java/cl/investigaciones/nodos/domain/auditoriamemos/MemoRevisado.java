package cl.investigaciones.nodos.domain.auditoriamemos;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "memo_revisados", schema = "nodos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemoRevisado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EstadoRevision estado;

    private Long idMemo;

    private String observaciones;

    private Boolean revisadoJefe;
    private Boolean revisadoPlana;

    private OffsetDateTime fechaRevisionJefe;
    private OffsetDateTime fechaRevisionPlana;

    private String nombreRevisor;
    private String unidadRevisor;


}
