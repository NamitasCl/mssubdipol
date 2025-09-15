package cl.investigaciones.nodos.domain.auditoriamemos;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "memo_revisados", schema = "nodos",
        indexes = {
                @Index(name = "ix_mr_memo_created_desc", columnList = "memo, created_at"),
                @Index(name = "ix_mr_memo_rol_created_desc", columnList = "memo, rol_revisor, created_at")
        }
)
@Data
public class MemoRevisado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_memo", referencedColumnName = "id", nullable = false)
    private FichaMemo memo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 32)
    private EstadoRevision estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_revisor", nullable = false, length = 32)
    private RolRevisor rolRevisor;

    @Column(name = "observaciones", columnDefinition = "text")
    private String observaciones;

    @Column(name = "nombre_revisor", length = 160)
    private String nombreRevisor;

    @Column(name = "unidad_revisor", length = 160)
    private String unidadRevisor;

    @Column(name = "usuario_revisor", length = 160)
    private String usuarioRevisor;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "origen", length = 64)
    private String origen;

    @Column(name = "request_id", length = 120)
    private String requestId;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now(java.time.ZoneOffset.UTC);
        } else {
            createdAt = createdAt.withOffsetSameInstant(java.time.ZoneOffset.UTC);
        }
    }
}
