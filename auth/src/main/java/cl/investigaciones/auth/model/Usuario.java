package cl.investigaciones.auth.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity(name = "usuarios")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Usuario {

    @Id
    @GeneratedValue
    @EqualsAndHashCode.Include // Se utiliza el id para equals/hashCode
    private UUID id;

    @Column(unique = true)
    private String username;
    private String rut;
    private String dv;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private int idFun;
    private String nombrePerfil;
    private String siglasUnidad;
    private int idUnidad;
    private String nombreCargo;
    private String siglasCargo;
    private String email;
    private String antiguedad;
    private boolean admin;
    private boolean expired;
    private boolean locked;
    private boolean enabled;
    private boolean credentialsExpired;

    @Column(name = "nombre_unidad")
    private String nombreUnidad;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "usuario_roles",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @EqualsAndHashCode.Exclude // Excluir la colección para evitar problemas en equals/hashCode
    private Set<Rol> roles = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "usuario_permisos",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "permiso_id")
    )
    private Set<Permiso> permisos = new HashSet<>();

}