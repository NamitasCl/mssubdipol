package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoRevisadoRequestDTO;
import cl.investigaciones.nodos.repository.auditoriamemos.MemoRevisadoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nodos/memo-revisado")
@CrossOrigin("*")
public class MemoRevisadoController {

    private final MemoRevisadoRepository memoRevisadoRepository;

    public MemoRevisadoController(MemoRevisadoRepository memoRevisadoRepository) {
        this.memoRevisadoRepository = memoRevisadoRepository;
    }

    @PostMapping
    public void saveMemoRevisado(@RequestBody MemoRevisadoRequestDTO req) {

        System.out.println("Estado: " + req.getEstado());
        System.out.println("MemoId: " + req.getMemoId());
        System.out.println("Observaciones: " + req.getObservaciones());

        MemoRevisado memoRevisado = new MemoRevisado();
        memoRevisado.setEstado(req.getEstado());
        memoRevisado.setObservaciones(req.getObservaciones());
        memoRevisado.setIdMemo(req.getMemoId());
        memoRevisadoRepository.save(memoRevisado);
    }

}
