package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Insumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; // Agua, Comida, Combustible
    private String tipo;
    
    private Integer cantidad;
    private String unidad; // Litros, Kilos, U.
    
    private LocalDate fechaVencimiento;
}
