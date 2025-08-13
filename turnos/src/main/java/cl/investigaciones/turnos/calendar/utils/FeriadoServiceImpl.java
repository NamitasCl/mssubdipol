package cl.investigaciones.turnos.calendar.utils;

import cl.investigaciones.turnos.calendar.domain.Feriado;
import cl.investigaciones.turnos.calendar.repository.FeriadoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FeriadoServiceImpl implements FeriadoService{

    private final FeriadoRepository feriadoRepo;

    public FeriadoServiceImpl(FeriadoRepository feriadoRepo) {
        this.feriadoRepo = feriadoRepo;
    }

    @Override
    public boolean esFeriado(LocalDate fecha) {

        List<Feriado> feriados = feriadoRepo.findAll();

        if(feriados.isEmpty()) {
            return false;
        }

        for(Feriado feriado : feriados) {
            if (fecha.isEqual(feriado.getFecha())) {
                return true;
            }
        }


        return false;
    }
}
