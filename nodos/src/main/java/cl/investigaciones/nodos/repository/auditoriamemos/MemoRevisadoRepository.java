package cl.investigaciones.nodos.repository.auditoriamemos;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemoRevisadoRepository extends JpaRepository<MemoRevisado, Long> {
    Optional<MemoRevisado> findByIdMemo(Long idMemo);
    List<MemoRevisado> findByIdMemoIn(List<Long> memoIds);
}
