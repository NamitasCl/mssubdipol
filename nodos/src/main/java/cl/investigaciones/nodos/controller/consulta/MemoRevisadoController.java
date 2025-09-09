package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import cl.investigaciones.nodos.domain.auditoriamemos.RolRevisor;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoRevisadoRequestDTO;
import cl.investigaciones.nodos.repository.auditoriamemos.MemoRevisadoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/api/nodos/memo-revisado")
@CrossOrigin("*")
public class MemoRevisadoController {

    private final MemoRevisadoRepository memoRevisadoRepository;
    private final EntityManager entityManager;

    public MemoRevisadoController(MemoRevisadoRepository memoRevisadoRepository, EntityManager entityManager) {
        this.memoRevisadoRepository = memoRevisadoRepository;
        this.entityManager = entityManager;
    }

    @PostMapping
    public ResponseEntity<MemoRevisado> saveMemoRevisado(@RequestBody MemoRevisadoRequestDTO req) {
        try {
            // Crear nuevo evento de revisión (no upsert)
            MemoRevisado memoRevisado = new MemoRevisado();

            // Asociar memo por referencia (sin cargarlo completo)
            FichaMemo memoRef = entityManager.getReference(FichaMemo.class, req.getMemoId());
            memoRevisado.setMemo(memoRef);

            // Campos de revisión
            memoRevisado.setEstado(req.getEstado());
            memoRevisado.setObservaciones(req.getObservaciones());
            memoRevisado.setNombreRevisor(req.getNombreRevisor());
            memoRevisado.setUnidadRevisor(req.getUnidadRevisor());
            memoRevisado.setUsuarioRevisor(req.getUsuarioRevisor());

            // Rol del revisor: si no viene, usar un default razonable (PLANA)
            memoRevisado.setRolRevisor(req.getRolRevisor() != null ? req.getRolRevisor() : RolRevisor.PLANA);

            // Fecha/hora del evento: si no viene, usar now UTC
            memoRevisado.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : OffsetDateTime.now(ZoneOffset.UTC));

            // Trazabilidad (opcional)
            memoRevisado.setOrigen(req.getOrigen());
            memoRevisado.setRequestId(req.getRequestId());

            MemoRevisado guardado = memoRevisadoRepository.save(memoRevisado);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
