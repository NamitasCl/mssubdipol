package cl.sge.repository;

import cl.sge.entity.FamiliaAfectada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FamiliaAfectadaRepository extends JpaRepository<FamiliaAfectada, Long> {
    List<FamiliaAfectada> findByEventoId(Long eventoId);
    List<FamiliaAfectada> findByFuncionarioId(String funcionarioId);
}
