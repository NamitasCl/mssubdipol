package cl.sge.service;

import cl.sge.entity.Despliegue;
import cl.sge.entity.Evento;
import cl.sge.repository.DespliegueRepository;
import cl.sge.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DespliegueService {

    @Autowired
    private DespliegueRepository despliegueRepository;

    @Autowired
    private EventoRepository eventoRepository;

    public List<Despliegue> findAllByEventoId(Long eventoId) {
        return despliegueRepository.findByEventoId(eventoId);
    }

    public List<Despliegue> findAll() {
        return despliegueRepository.findAll();
    }

    public Despliegue findById(Long id) {
        return despliegueRepository.findById(id).orElse(null);
    }

    @Transactional
    public Despliegue createDespliegue(Long eventoId, Despliegue despliegue) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        despliegue.setEvento(evento);
        if (despliegue.getFechaSolicitud() == null) {
            despliegue.setFechaSolicitud(LocalDateTime.now());
        }
        if (despliegue.getNumeroProrrogas() == null) {
            despliegue.setNumeroProrrogas(0);
        }
        
        return despliegueRepository.save(despliegue);
    }

    @Transactional
    public Despliegue prorrogarDespliegue(Long id, LocalDateTime nuevaFechaTermino) {
        Despliegue despliegue = despliegueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despliegue no encontrado"));

        if (nuevaFechaTermino.isBefore(despliegue.getFechaTermino())) {
            throw new RuntimeException("La nueva fecha de termino debe ser posterior a la actual");
        }

        despliegue.setFechaTermino(nuevaFechaTermino);
        despliegue.setNumeroProrrogas(despliegue.getNumeroProrrogas() + 1);

        return despliegueRepository.save(despliegue);
    }

    @Transactional
    public Despliegue prorrogarDespliegueMismoPeriodo(Long id) {
        Despliegue despliegue = despliegueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Despliegue no encontrado"));

        if (despliegue.getFechaInicio() == null || despliegue.getFechaTermino() == null) {
             throw new RuntimeException("El despliegue no tiene fechas definidas para calcular el periodo");
        }

        Duration duracion = Duration.between(despliegue.getFechaInicio(), despliegue.getFechaTermino());
        LocalDateTime nuevaFechaTermino = despliegue.getFechaTermino().plus(duracion);

        despliegue.setFechaTermino(nuevaFechaTermino);
        despliegue.setNumeroProrrogas(despliegue.getNumeroProrrogas() + 1);

        return despliegueRepository.save(despliegue);
    }
}
