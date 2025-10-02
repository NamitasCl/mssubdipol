package cl.investigaciones.nodos.service.relatojenadep;

import cl.investigaciones.nodos.domain.relatosjenadep.RelatoJenadep;
import cl.investigaciones.nodos.dto.relatojenadep.RelatoJenadepRequest;
import cl.investigaciones.nodos.repository.relatojenadep.RelatoJenadepRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class RelatoJenadepService {

    private final RelatoJenadepRepository relatoJenadepRepository;

    public RelatoJenadepService(RelatoJenadepRepository relatoJenadepRepository) {
        this.relatoJenadepRepository = relatoJenadepRepository;
    }

    @Transactional
    public int save(RelatoJenadepRequest req) {
        RelatoJenadep relatoJenadep = new RelatoJenadep();
        relatoJenadep.setUnidad(req.getUnidad());
        relatoJenadep.setLugar(req.getLugar());
        relatoJenadep.setFecha(req.getFecha());
        relatoJenadep.setHecho(req.getHecho());
        relatoJenadep.setRelato(req.getRelato());
        relatoJenadep.setMemo(req.getMemo());
        relatoJenadepRepository.save(relatoJenadep);
        return relatoJenadep.getId().intValue();
    }
}
