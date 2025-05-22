import {Card, Form} from "react-bootstrap";

/**
 * Selector de mes y año.
 */
export function MonthSelector({ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }) {
    const monthNames = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const handleMonthChange = (e) => setSelectedMonth(Number(e.target.value));
    const handleYearChange = (e) => setSelectedYear(Number(e.target.value));

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-secondary text-white">
                <strong>Seleccionar Mes y Año</strong>
            </Card.Header>
            <Card.Body>
                <Form className="d-flex flex-wrap gap-3 align-items-end">
                    <Form.Group controlId="selectMonth">
                        <Form.Label>Mes</Form.Label>
                        <Form.Control as="select" value={selectedMonth} onChange={handleMonthChange}>
                            {monthNames.map((month, index) => (
                                <option key={index} value={index}>
                                    {month}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="inputYear">
                        <Form.Label>Año</Form.Label>
                        <Form.Control
                            type="number"
                            value={selectedYear}
                            onChange={handleYearChange}
                            min="2000"
                            max="2100"
                        />
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>
    );
}