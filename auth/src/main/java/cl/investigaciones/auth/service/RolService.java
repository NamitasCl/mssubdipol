package cl.investigaciones.auth.service;

import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.repository.RolRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public List<String> findAll() {
        List<Rol> roles = rolRepository.findAll();
        List<String> listaRoles = new ArrayList<>();

        for (Rol role : roles) {
            listaRoles.add(role.getNombre());
        }
        return listaRoles;
    }

}