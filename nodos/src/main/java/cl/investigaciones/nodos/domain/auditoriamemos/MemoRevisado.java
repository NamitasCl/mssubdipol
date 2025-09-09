package cl.investigaciones.nodos.domain.auditoriamemos;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Table(name = "memo_revisados", schema = "nodos",
        indexes = {
                @Index(name = "ix_memo_revision_event_memo_id", columnList = "memo_id"),
                @Index(name = "ix_memo_revision_event_created_at", columnList = "created_at")
        })
@Data
public class MemoRevisado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👉 Relación fuerte al memo consultado (FK)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "memo_id", referencedColumnName = "id")
    private FichaMemo memo; // FichaMemo es @Immutable: no impide referenciarla

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoRevision estado; // PENDIENTE, APROBADO, OBSERVADO, RECHAZADO...

    @Enumerated(EnumType.STRING)
    @Column(name = "rol_revisor", nullable = false)
    private RolRevisor rolRevisor; // JEFE, PLANA, CONTRALORIA, etc.

    @Column(columnDefinition = "text")
    private String observaciones;

    // “quién”
    private String nombreRevisor;
    private String unidadRevisor;
    private String usuarioRevisor; // opcional: username/id app

    // “cuándo”
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    // opcional para idempotencia / trazabilidad
    private String origen;     // ej: “web”, “api”
    private String requestId;  // para evitar duplicado


}
