package cl.investigaciones.auth.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    private final long accessExpMillis;
    private final long refreshExpMillis;

    public JwtUtil(
            @Value("${jwt.token}") String secret,
            @Value("${jwt.access.expMillis:900000}") long accessExpMillis,       // 15 min default
            @Value("${jwt.refresh.expMillis:1209600000}") long refreshExpMillis   // 14 days default
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMillis = accessExpMillis;
        this.refreshExpMillis = refreshExpMillis;
    }

    public String generateAccessToken(
            String username,
            List<String> roles,
            String nombreCompletoUsuario,
            String nombreCargo,
            String siglasUnidad,
            int idUnidad,
            boolean isAdmin,
            int idFuncionario,
            List<String> permisos,
            String nombrePerfil,
            String nombreUnidad
    ) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpMillis);

        return Jwts.builder()
                .setHeaderParam("typ", "access")
                .setSubject(username)
                .claim("roles", roles)
                .claim("authorities", permisos)
                .claim("isAuthenticated", true)
                .claim("nombreUsuario", nombreCompletoUsuario)
                .claim("nombreCargo", nombreCargo)
                .claim("siglasUnidad", siglasUnidad)
                .claim("idUnidad", idUnidad)
                .claim("isAdmin", isAdmin)
                .claim("idFuncionario", idFuncionario)
                .claim("nombrePerfil", nombrePerfil)
                .claim("nombreUnidad", nombreUnidad)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpMillis);

        return Jwts.builder()
                .setHeaderParam("typ", "refresh")
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public Jws<Claims> parseToken(String jwt) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(jwt);
    }

    public String getUsername(String jwt) {
        return parseToken(jwt).getBody().getSubject();
    }

    public boolean isExpired(String jwt) {
        Date exp = parseToken(jwt).getBody().getExpiration();
        return exp.before(new Date());
    }

    public boolean isAccess(String jwt) {
        JwsHeader<?> header = parseToken(jwt).getHeader();
        String typ = header.getType();
        if (typ == null) {
            Object t = header.get("typ");
            typ = t != null ? t.toString() : null;
        }
        return "access".equalsIgnoreCase(typ);
    }

    public boolean isRefresh(String jwt) {
        JwsHeader<?> header = parseToken(jwt).getHeader();
        String typ = header.getType();
        if (typ == null) {
            Object t = header.get("typ");
            typ = t != null ? t.toString() : null;
        }
        return "refresh".equalsIgnoreCase(typ);
    }

    public long getExpEpochSeconds(String jwt) {
        Date exp = parseToken(jwt).getBody().getExpiration();
        return exp.toInstant().getEpochSecond();
    }

    // Backward compatibility for any existing validation usage.
    public boolean validateToken(String jwt, List<String> roles) {
        Jws<Claims> jws = parseToken(jwt);
        Date expirationDate = jws.getBody().getExpiration();
        List<String> tokenRoles = jws.getBody().get("roles", List.class);
        return !expirationDate.before(new Date()) && (tokenRoles == null || roles.containsAll(tokenRoles));
    }
}
