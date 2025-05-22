package cl.investigaciones.turnos.repository;

import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FuncionarioDiasNoDisponibleRepository extends JpaRepository<FuncionarioDiasNoDisponible, Integer> {

    @Query("""
    SELECT f FROM func_dias_no_disponible f
    WHERE f.identificadorFuncionario.idFuncionario = :idFuncionario
    AND (
        (f.fecha IS NOT NULL AND MONTH(f.fecha) = :mes AND YEAR(f.fecha) = :anio)
        OR
        (f.fechaInicio IS NOT NULL AND f.fechaFin IS NOT NULL AND (
            (MONTH(f.fechaInicio) = :mes AND YEAR(f.fechaInicio) = :anio)
            OR (MONTH(f.fechaFin) = :mes AND YEAR(f.fechaFin) = :anio)
            OR (f.fechaInicio <= :finMes AND f.fechaFin >= :inicioMes)
        ))
    )
""")
    List<FuncionarioDiasNoDisponible> findDiasNoDisponiblesPorFuncionarioYMesAnio(
            @Param("idFuncionario") int idFuncionario,
            @Param("mes") int mes,
            @Param("anio") int anio,
            @Param("inicioMes") LocalDate inicioMes,
            @Param("finMes") LocalDate finMes
    );

    /*
    * Esta consulta devuelve true si el funcionario no esta disponible
    * es decir, si registra una fecha exacta o un rango de fechas
    * */
    @Query("""
    SELECT COUNT(f) > 0
    FROM func_dias_no_disponible f
    WHERE f.identificadorFuncionario = :funcionario
    AND (
        (f.fecha IS NOT NULL AND f.fecha = :fecha)
        OR
        (f.fechaInicio IS NOT NULL AND f.fechaFin IS NOT NULL AND :fecha BETWEEN f.fechaInicio AND f.fechaFin)
    )
""")
    boolean existePorFechaContenidaOIgual(
            @Param("funcionario") AsignacionFuncionario funcionario,
            @Param("fecha") LocalDate fecha
    );

    @Query("""
    SELECT f FROM func_dias_no_disponible f
    WHERE (MONTH(f.fecha) = :mes AND YEAR(f.fecha) = :anio)
       OR (f.fechaInicio IS NOT NULL AND f.fechaFin IS NOT NULL AND
           (MONTH(f.fechaInicio) <= :mes AND MONTH(f.fechaFin) >= :mes)
           AND (YEAR(f.fechaInicio) <= :anio AND YEAR(f.fechaFin) >= :anio))
""")
    List<FuncionarioDiasNoDisponible> obtenerPorMesYAnio(@Param("mes") int mes, @Param("anio") int anio);





}
