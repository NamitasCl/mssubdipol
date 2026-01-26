package cl.sge.service;

import cl.sge.entity.Evento;
import cl.sge.entity.FamiliaAfectada;
import cl.sge.repository.EventoRepository;
import cl.sge.repository.FamiliaAfectadaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FamiliaAfectadaService {

    private final FamiliaAfectadaRepository repository;
    private final EventoRepository eventoRepository;

    public FamiliaAfectadaService(FamiliaAfectadaRepository repository, EventoRepository eventoRepository) {
        this.repository = repository;
        this.eventoRepository = eventoRepository;
    }

    public List<FamiliaAfectada> findAll() {
        return repository.findAll();
    }

    public List<FamiliaAfectada> findByEvento(Long eventoId) {
        return repository.findByEventoId(eventoId);
    }

    @Transactional
    public FamiliaAfectada create(Long eventoId, FamiliaAfectada data) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado: " + eventoId));
        
        data.setEvento(evento);
        return repository.save(data);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
