package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoRevisadoRequestDTO;
import cl.investigaciones.nodos.repository.auditoriamemos.MemoRevisadoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/nodos/memo-revisado")
@CrossOrigin("*")
public class MemoRevisadoController {

    private final MemoRevisadoRepository memoRevisadoRepository;

    public MemoRevisadoController(MemoRevisadoRepository memoRevisadoRepository) {
        this.memoRevisadoRepository = memoRevisadoRepository;
    }

    @PostMapping
    public ResponseEntity<MemoRevisado> saveMemoRevisado(@RequestBody MemoRevisadoRequestDTO req) {
        try {
            // Upsert por idMemo
            MemoRevisado memoRevisado = memoRevisadoRepository.findByIdMemo(req.getMemoId())
                    .orElseGet(MemoRevisado::new);

            memoRevisado.setIdMemo(req.getMemoId());
            memoRevisado.setEstado(req.getEstado());
            memoRevisado.setObservaciones(req.getObservaciones());
            memoRevisado.setNombreRevisor(req.getNombreRevisor());
            memoRevisado.setUnidadRevisor(req.getUnidadRevisor());
            memoRevisado.setRevisadoPlana(req.getRevisadoPlana());
            memoRevisado.setFechaRevisionPlana(req.getFechaRevisionPlana());

            // Set automático de revisión jefe (asumimos marcado al guardar)
            memoRevisado.setRevisadoJefe(true);
            memoRevisado.setFechaRevisionJefe(OffsetDateTime.now());

            MemoRevisado guardado = memoRevisadoRepository.save(memoRevisado);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
