package cl.sge.repository;

import cl.sge.entity.ModuleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleConfigRepository extends JpaRepository<ModuleConfig, String> {
    List<ModuleConfig> findByEnabledTrue();
}
