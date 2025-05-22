package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.RegistroCambios;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegistroCambiosRepository extends JpaRepository<RegistroCambios, Long> {
    // Métodos de consulta personalizados si los necesitas después
}