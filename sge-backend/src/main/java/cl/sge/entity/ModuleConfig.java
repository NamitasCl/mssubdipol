package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "module_config")
public class ModuleConfig {
    @Id
    private String moduleKey; // Unique identifier (e.g., "turnos", "sge")
    
    private String title;
    private String description;
    private String route;
    private String iconName;
    private String color;
    
    private boolean enabled = true;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "module_roles", joinColumns = @JoinColumn(name = "module_key"))
    @Column(name = "role_name")
    private Set<String> authorizedRoles = new HashSet<>();
}
