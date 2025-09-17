package cl.investigaciones.auth.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
