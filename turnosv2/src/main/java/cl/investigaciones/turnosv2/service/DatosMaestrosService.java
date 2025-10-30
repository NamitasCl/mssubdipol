package cl.investigaciones.turnosv2.service;

import cl.investigaciones.turnosv2.domain.UnidadParticipante;
import cl.investigaciones.turnosv2.repository.UnidadParticipanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DatosMaestrosService {

    @Autowired
    private UnidadParticipanteRepository unidadParticipanteRepository;

    // Usado por el 'DatosMaestrosController'
    public List<UnidadParticipante> findAllUnidades() {
        // Simplemente devuelve todas las unidades de la BD
        return unidadParticipanteRepository.findAll();
    }
}