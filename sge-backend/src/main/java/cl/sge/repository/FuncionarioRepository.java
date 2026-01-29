package cl.sge.repository;

import cl.sge.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, String> {
    long countByUnidad(String unidad);
    long countByRegionPolicial(String regionPolicial);
    java.util.List<Funcionario> findByNombreContainingIgnoreCaseOrRutContainingIgnoreCase(String nombre, String rut);
}
