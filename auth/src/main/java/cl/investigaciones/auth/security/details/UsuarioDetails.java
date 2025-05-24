package cl.investigaciones.auth.security.details;

import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

//Clase envoltorio de Usuario para implementar UserDetails
public class UsuarioDetails implements UserDetails {

    private Usuario usuario;

    public UsuarioDetails(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return usuario.getRoles().stream()
                .map(rol -> new SimpleGrantedAuthority(rol.getNombre()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    public int getId() {
        return usuario.getIdFun();
    }

    public List<String> getRoles() {
        return usuario.getRoles().stream()
                .map(rol -> rol.getNombre())
                .collect(Collectors.toList());

    }

    public String getNombreCompleto() {
        return usuario.getNombre() + " " + usuario.getApellidoPaterno()
                 + " " + usuario.getApellidoMaterno();
    }

    public String getNombreCargo() {
        return usuario.getNombreCargo();
    }

    public String getSiglasUnidad() {
        return usuario.getSiglasUnidad();
    }



    @Override
    public boolean isAccountNonExpired() {
        return !usuario.isExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return !usuario.isLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return !usuario.isCredentialsExpired();
    }

    @Override
    public boolean isEnabled() {
        return usuario.isEnabled();
    }

    public boolean isAdmin() {
        return usuario.isAdmin();
    }
}
