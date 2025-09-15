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

    // ✅ CORREGIDO: usar "id_memo" que es el nombre real de la columna
    @Query(value = """
            SELECT DISTINCT ON (id_memo) *
            FROM nodos.memo_revisados
            WHERE id_memo IN (:memoIds)
            ORDER BY id_memo, created_at DESC
            """, nativeQuery = true)
    List<MemoRevisado> findUltimoPorMemoIdIn(@Param("memoIds") Collection<Long> memoIds);

    // ✅ CORREGIDO: usar "id_memo" que es el nombre real de la columna
    @Query(value = """
            SELECT DISTINCT ON (id_memo, rol_revisor) *
            FROM nodos.memo_revisados
            WHERE id_memo IN (:memoIds)
            ORDER BY id_memo, rol_revisor, created_at DESC
            """, nativeQuery = true)
    List<MemoRevisado> findUltimosPorRolYMemoIds(@Param("memoIds") Collection<Long> memoIds);

    // Idempotencia por requestId - esta query JPQL está bien
    Optional<MemoRevisado> findByMemo_IdAndRequestId(Long memoId, String requestId);

    // Esta query JPQL está bien porque usa la propiedad del objeto
    @Query("select mr from MemoRevisado mr where mr.memo.id = :memoId order by mr.createdAt desc")
    List<MemoRevisado> findHistorial(@Param("memoId") Long memoId);
}