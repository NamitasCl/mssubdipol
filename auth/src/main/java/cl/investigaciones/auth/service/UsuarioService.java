package cl.investigaciones.auth.service;

import cl.investigaciones.auth.dto.FuncionarioConRolesDTO;
import cl.investigaciones.auth.dto.TokenActiveDirectoryResultDTO;
import cl.investigaciones.auth.dto.UsuarioParcialDTO;
import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.model.Usuario;
import cl.investigaciones.auth.repository.RolRepository;
import cl.investigaciones.auth.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    //Metodo para modificar los roles de un usuario
    public void modificarRolesUsuario(int idFun, Set<String> nombresRoles) {

        System.out.println("[AUTH - modificarRolesUsuario] idFun: " + idFun);
        System.out.println("Paso 1");
        // 1) Convertir nombres de roles a entidades Rol
        Set<Rol> roles = nombresRoles.stream()
                .map(nombre -> rolRepository.findByNombre(nombre)
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + nombre)))
                .collect(Collectors.toSet());

        for (Rol role : roles) {
            System.out.println("Rol: " + role);
        }

        System.out.println("Paso 2");
        // 2) Buscar si existe el usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByIdFun(idFun);

        if (usuarioOpt.isPresent()) {
            System.out.println("Paso 3");
            // 3) Usuario existente => limpiar y re-asignar roles
            Usuario usuario = usuarioOpt.get();
            usuario.getRoles().clear();    // Limpieza explícita
            usuario.getRoles().addAll(roles);

            System.out.println("Paso 4");
            // 4) Forzar la actualización en la tabla intermedia
            entityManager.merge(usuario);

            System.out.println("Nuevos roles (usuario existente): " + usuario.getRoles());
        } else {

            System.out.println("Paso 5");
            // 5) Usuario NO existe => crear parcial
            UsuarioParcialDTO usuarioParcial = obtenerUsuarioParcialDTO(idFun);
            Usuario nuevoUsuario = new Usuario();

            // Asegúrate de que idFun sea la PK real
            nuevoUsuario.setIdFun(usuarioParcial.getIdFun());
            nuevoUsuario.setNombre(usuarioParcial.getNombreFun());
            nuevoUsuario.setApellidoPaterno(usuarioParcial.getApellidoPaternoFun());
            nuevoUsuario.setApellidoMaterno(usuarioParcial.getApellidoMaternoFun());
            nuevoUsuario.setSiglasCargo(usuarioParcial.getSiglasCargo());
            nuevoUsuario.setSiglasUnidad(usuarioParcial.getSiglasUnidad());

            System.out.println("Aun en paso 5");

            // Asignar roles
            nuevoUsuario.setRoles(new HashSet<>()); // inicializar
            nuevoUsuario.getRoles().addAll(roles);

            System.out.println("Paso 6");
            // 6) Persistir el nuevo usuario con roles
            entityManager.persist(nuevoUsuario);

            System.out.println("Usuario creado parcialmente con roles: " + nuevoUsuario.getRoles());
        }
    }



    public Usuario obtenerSubjefePorUnidad(String unidad) {
        return rolRepository.findSubjefeByUnidad(unidad)
                .orElseThrow(() -> new RuntimeException("No hay subjefe asignado para la unidad " + unidad));
    }

    private UsuarioParcialDTO obtenerUsuarioParcialDTO(int idFun) {

        System.out.println("[AUTH - obtenerUsuarioParcialDTO] idFun: " + idFun);

        String url = "http://commonservices:8011/api/common/funcionarios/" + idFun;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(headers);

        ResponseEntity<UsuarioParcialDTO> response = restTemplate
                .exchange(url, HttpMethod.POST, request, UsuarioParcialDTO.class);

        if (response.getBody() == null) {
            throw new RuntimeException("[AUTH - obtenerUsuarioParcialDTO] Error al obtener información del funcionario");
        }

        System.out.println("[AUTH - obtenerUsuarioParcialDTO] Funcionario obtenido: " + response.getBody());

        return response.getBody();
    }

    public List<FuncionarioConRolesDTO> obtenerFuncionariosConRoles() {
        List<Usuario> usuarios = usuarioRepository.findAll();

        return usuarios.stream().map(usuario -> {
            FuncionarioConRolesDTO dto = new FuncionarioConRolesDTO();
            dto.setNombreCompleto(usuario.getNombre() + " " + usuario.getApellidoPaterno() + " " + usuario.getApellidoMaterno());
            dto.setRoles(usuario.getRoles().stream().map(Rol::getNombre).toList());
            return dto;
        }).toList();
    }

}
