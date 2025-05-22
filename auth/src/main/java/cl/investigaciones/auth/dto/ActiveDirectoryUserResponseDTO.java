package cl.investigaciones.auth.dto;

public class ActiveDirectoryUserResponseDTO {
    private int code;
    private boolean success;
    private String description;
    private UsuarioActiveDirectoryDTO result;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UsuarioActiveDirectoryDTO getResult() {
        return result;
    }

    public void setUser(UsuarioActiveDirectoryDTO result) {
        this.result = result;
    }
}
