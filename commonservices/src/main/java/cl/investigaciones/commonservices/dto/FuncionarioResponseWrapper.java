package cl.investigaciones.commonservices.dto;

import java.util.List;

public class FuncionarioResponseWrapper {
    private int code;
    private boolean success;
    private String description;
    private List<FuncionarioResponseDTO> result;

    public FuncionarioResponseWrapper() {
    }

    public FuncionarioResponseWrapper(int code, boolean success, String description, List<FuncionarioResponseDTO> result) {
        this.code = code;
        this.success = success;
        this.description = description;
        this.result = result;
    }

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

    public List<FuncionarioResponseDTO> getResult() {
        return result;
    }

    public void setResult(List<FuncionarioResponseDTO> result) {
        this.result = result;
    }
}
