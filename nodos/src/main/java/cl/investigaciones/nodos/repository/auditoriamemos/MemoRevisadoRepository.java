package cl.investigaciones.nodos.repository.auditoriamemos;

import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MemoRevisadoRepository extends JpaRepository<MemoRevisado, Long> {

    // Último evento para un memo específico
    Optional<MemoRevisado> findTopByMemo_IdOrderByCreatedAtDesc(Long memoId);

    // Último evento por cada memoId (PostgreSQL)
    @Query(value = """
        SELECT DISTINCT ON (mr.memo_id) *
        FROM nodos.memo_revisados mr
        WHERE mr.memo_id IN (:memoIds)
        ORDER BY mr.memo_id, mr.created_at DESC
        """, nativeQuery = true)
    List<MemoRevisado> findUltimoPorMemoIdIn(@Param("memoIds") Collection<Long> memoIds);
}
