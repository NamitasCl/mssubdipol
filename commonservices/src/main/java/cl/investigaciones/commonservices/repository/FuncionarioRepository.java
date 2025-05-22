package cl.investigaciones.commonservices.repository;

import cl.investigaciones.commonservices.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT f FROM Funcionario f " +
            "WHERE LOWER(CONCAT(COALESCE(f.nombreFun, ''), ' ', COALESCE(f.apellidoPaternoFun, ''), ' ', COALESCE(f.apellidoMaternoFun, ''))) " +
            "LIKE LOWER(CONCAT('%', REPLACE(:term, ' ', '%'), '%'))")
    List<Funcionario> searchByTerm(@Param("term") String term);

    Optional<Funcionario> findByIdFun(int idFun);


    List<Funcionario> findByNombreFunContainingIgnoreCase(String term);

    List<Funcionario> findBySiglasUnidadIgnoreCase(String siglasUnidad);

    @Query("SELECT f FROM Funcionario f WHERE LOWER(f.siglasUnidad) = LOWER(:unidad) AND " +
            "LOWER(CONCAT(COALESCE(f.nombreFun, ''), ' ', COALESCE(f.apellidoPaternoFun, ''), ' ', COALESCE(f.apellidoMaternoFun, ''))) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Funcionario> searchByUnidadAndNombre(@Param("unidad") String unidad, @Param("term") String term);


}
