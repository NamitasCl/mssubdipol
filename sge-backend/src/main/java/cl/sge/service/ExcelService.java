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

    public ExcelService(DespliegueRepository despliegueRepository) {
        this.despliegueRepository = despliegueRepository;
    }

    public ByteArrayInputStream generateDeploymentsReport() throws IOException {
        String[] columns = {"ID", "Evento", "Zona/Misión", "Fecha Solicitud", "Req. Vehículos", "Req. Funcionarios"};

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // ================= DETAIL SHEET =================
            Sheet sheet = workbook.createSheet("Solicitudes");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLACK.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
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
            summaryCell.setCellStyle(headerCellStyle);
            
            Row summaryValue = summarySheet.createRow(1);
            summaryValue.createCell(0).setCellValue(despliegues.size());
            summarySheet.autoSizeColumn(0);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
