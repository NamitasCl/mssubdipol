package cl.investigaciones.turnosv2.repository;

import cl.investigaciones.turnosv2.domain.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    List<Funcionario> findByIdUnidadIn(List<Long> unidadIds);
}
