package cl.sge.service;

import cl.sge.entity.Despliegue;
import cl.sge.repository.DespliegueRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelService {

    private final DespliegueRepository despliegueRepository;
    private final cl.sge.repository.AsignacionRecursoRepository asignacionRepository;
    private final cl.sge.repository.FamiliaAfectadaRepository familiaAfectadaRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public ExcelService(DespliegueRepository despliegueRepository, 
                        cl.sge.repository.AsignacionRecursoRepository asignacionRepository,
                        cl.sge.repository.FamiliaAfectadaRepository familiaAfectadaRepository,
                        com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.despliegueRepository = despliegueRepository;
        this.asignacionRepository = asignacionRepository;
        this.familiaAfectadaRepository = familiaAfectadaRepository;
        this.objectMapper = objectMapper;
    }

    public ByteArrayInputStream generateDeploymentsReport() throws IOException {
        String[] columns = {"ID", "Evento", "Zona/Misión", "Fecha Solicitud", "Req. Vehículos", "Req. Funcionarios"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // ================= DETAIL SHEET =================
            Sheet sheet = workbook.createSheet("Solicitudes");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Header Row
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            List<Despliegue> despliegues = despliegueRepository.findAll();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            int rowIdx = 1;
            for (Despliegue d : despliegues) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(d.getId());
                row.createCell(1).setCellValue(d.getEvento() != null ? d.getEvento().getDescripcion() : "Sin Evento");
                row.createCell(2).setCellValue(d.getDescripcion());
                row.createCell(3).setCellValue(d.getFechaSolicitud() != null ? d.getFechaSolicitud().format(formatter) : "");
                row.createCell(4).setCellValue(d.getCantidadVehiculosRequeridos() != null ? d.getCantidadVehiculosRequeridos() : 0);
                row.createCell(5).setCellValue(d.getCantidadFuncionariosRequeridos() != null ? d.getCantidadFuncionariosRequeridos() : 0);
            }

            // Autosize columns
            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }
            
            // ================= SUMMARY SHEET =================
            Sheet summarySheet = workbook.createSheet("Resumen");
            Row summaryHeader = summarySheet.createRow(0);
            Cell summaryCell = summaryHeader.createCell(0);
            summaryCell.setCellValue("Total Despliegues Activos");
            // Reuse header style but fix font color if needed, or simple bold
            CellStyle summaryStyle = workbook.createCellStyle();
            Font summaryFont = workbook.createFont();
            summaryFont.setBold(true);
            summaryStyle.setFont(summaryFont);
            summaryCell.setCellStyle(summaryStyle);
            
            Row summaryValue = summarySheet.createRow(1);
            summaryValue.createCell(0).setCellValue(despliegues.size());
            summarySheet.autoSizeColumn(0);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateDotacionReport(Long solicitudId) throws IOException {
        String[] columns = {
            "N°", 
            "SUBDIRECCIÓN", 
            "REGIÓN GEOGRAFICA", 
            "REGIÓN POLICIAL O JEFATURA NACIONAL", 
            "UNIDAD DEL FUNCIONARIO", 
            "GRADO DEL FUNCIONARIO", 
            "NOMBRE DEL FUNCIONARIO", 
            "TELÉFONO DEL FUNCIONARIO", 
            "REGIÓN A DONDE SE DIRIGE", 
            "SIGLA DEL CARRO", 
            "FUNCIÓN EN EL CARRO", 
            "DETALLE EQUIPO DE APOYO", 
            "ESPECIALIDAD DEL FUNCIONARIO"
        };
        
        List<cl.sge.entity.AsignacionRecurso> asignaciones = asignacionRepository.findBySolicitudId(solicitudId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Dotación");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
            headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerCellStyle.setWrapText(true);

            // Create Header
            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            int correlativo = 1;

            for (cl.sge.entity.AsignacionRecurso asignacion : asignaciones) {
                // Parse roles from 'equipos' JSON
                // Structure: { "conductor": "RUT", "encargado": "RUT", "tripulantes": ["RUT", "RUT"] }
                java.util.Map<String, Object> rolesMap = new java.util.HashMap<>();
                try {
                    if (asignacion.getEquipos() != null && !asignacion.getEquipos().isEmpty()) {
                        rolesMap = objectMapper.readValue(asignacion.getEquipos(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>(){});
                    }
                } catch (Exception e) {
                    System.err.println("Error parsing roles JSON: " + e.getMessage());
                }

                // Identify vehicle (assuming 1 vehicle per assignment for this context, or take first)
                String siglaCarro = "SIN VEHICULO";
                if (asignacion.getVehiculos() != null && !asignacion.getVehiculos().isEmpty()) {
                    siglaCarro = asignacion.getVehiculos().get(0).getSigla();
                }
                
                String regionDestino = "SIN DEFINIR"; // Could extract from Solicitud -> Despliegue -> Region
                // If entity Despliegue doesn't have region, maybe it's in Evento or description?
                // For now, check if Solicitud has destination
                if (asignacion.getSolicitud() != null && asignacion.getSolicitud().getRegionDestino() != null) {
                    regionDestino = asignacion.getSolicitud().getRegionDestino();
                }

                if (asignacion.getFuncionarios() != null) {
                    for (cl.sge.entity.Funcionario f : asignacion.getFuncionarios()) {
                        Row row = sheet.createRow(rowIdx++);
                        
                        // Determine Role
                        String funcionEnCarro = "TRIPULANTE";
                        String rut = f.getRut();
                        
                        if (rut.equals(rolesMap.get("conductor"))) {
                            funcionEnCarro = "CONDUCTOR";
                        } else if (rut.equals(rolesMap.get("encargado"))) {
                            funcionEnCarro = "ENCARGADO"; // Or Jefe de Máquina
                        }

                        // Populate Cells
                        row.createCell(0).setCellValue(correlativo++);
                        row.createCell(1).setCellValue(f.getSubdireccion() != null ? f.getSubdireccion() : "SUBDIPOL"); 
                        row.createCell(2).setCellValue(f.getRegion() != null ? f.getRegion() : "RM"); 
                        row.createCell(3).setCellValue(f.getRegionPolicial() != null ? f.getRegionPolicial() : "JEFATURA NACIONAL"); 
                        row.createCell(4).setCellValue(f.getUnidad() != null ? f.getUnidad() : asignacion.getUnidadOrigen());
                        row.createCell(5).setCellValue(f.getGrado());
                        row.createCell(6).setCellValue(f.getNombre()); // Fixed: getName() -> getNombre()
                        row.createCell(7).setCellValue(f.getTelefono() != null ? f.getTelefono() : "");
                        row.createCell(8).setCellValue(regionDestino);
                        row.createCell(9).setCellValue(siglaCarro);
                        row.createCell(10).setCellValue(funcionEnCarro);
                        row.createCell(11).setCellValue(""); // Detalle Equipo Apoyo (Manual fill or other field)
                        row.createCell(12).setCellValue(""); // Especialidad (if available in Funcionario entity)
                    }
                }
            }
            
            // Autosize
            for (int col = 0; col < columns.length; col++) {
               sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateAfectadosReport(Long eventoId) throws IOException {
        String[] columns = {
            "ID", "Evento", "Funcionario RUT", "Funcionario Nombre", 
            "RUT Afectado", "Nombre Afectado", "Parentesco", "Bien Afectado", 
            "Teléfono", "Dirección", "Detalle Daño", "Fecha Registro"
        };
        
        List<cl.sge.entity.FamiliaAfectada> afectados;
        if (eventoId != null) {
            afectados = familiaAfectadaRepository.findByEventoId(eventoId);
        } else {
            afectados = familiaAfectadaRepository.findAll();
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Afectados");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (cl.sge.entity.FamiliaAfectada fa : afectados) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(fa.getId());
                row.createCell(1).setCellValue(fa.getEvento() != null ? fa.getEvento().getDescripcion() : "Sin Evento");
                row.createCell(2).setCellValue(fa.getFuncionarioRut());
                row.createCell(3).setCellValue(fa.getFuncionarioNombre());
                
                row.createCell(4).setCellValue(fa.getRut());
                row.createCell(5).setCellValue(fa.getNombreCompleto());
                row.createCell(6).setCellValue(fa.getParentesco());
                row.createCell(7).setCellValue(fa.getTipoBienAfectado());
                
                row.createCell(8).setCellValue(fa.getTelefono());
                row.createCell(9).setCellValue(fa.getDireccion());
                row.createCell(10).setCellValue(fa.getDetalle());
                
                row.createCell(11).setCellValue(fa.getFechaRegistro() != null ? fa.getFechaRegistro().toString() : "");
            }

            for (int col = 0; col < columns.length; col++) {
                sheet.autoSizeColumn(col);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
