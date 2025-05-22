import {computeStats} from "../utils/index.js";
import {Badge, Button, Card, Table} from "react-bootstrap";

/**
 * Calendario que muestra cada día con sus 9 unidades (o error),
 * además de mostrar la estadística global de turnos.
 */
export function CalendarView({ schedule, usedDepts, onEditDay }) {
    const { dayStats, globalStats } = computeStats(schedule);

    return (
        <>
            {schedule.map((dayObj, idx) => {
                const statsForDay = dayStats.find((ds) => ds.dia === dayObj.dia);

                return (
                    <Card key={idx} className="mb-2 shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>
                                    Día {dayObj.dia} ({dayObj.diaSemana})
                                </strong>
                            </div>
                            {/* solo permite editar si no hay error y se definió onEditDay */}
                            {!dayObj.error && onEditDay && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onEditDay(dayObj, idx)}
                                >
                                    Editar
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {dayObj.error ? (
                                <div style={{color: "red"}}>{dayObj.error}</div>
                            ) : (
                                <>
                                    <div className="d-flex flex-wrap mb-2" style={{gap: "6px"}}>
                                        {dayObj.unidades.map((unidad, i) => (
                                            <Badge
                                                key={i}
                                                style={{fontWeight: "500", padding: "10px"}}
                                            >
                                                {unidad}
                                            </Badge>
                                        ))}
                                    </div>
                                    {/* Estadísticas por día (cuántas veces repite cada unidad) */}
                                    {statsForDay && Object.keys(statsForDay.counts).length > 0 && (
                                        <div style={{fontSize: "0.85rem"}}>
                                            <strong>Estadísticas del día:</strong>{" "}
                                            {Object.entries(statsForDay.counts).map(([unidad, count], i) => (
                                                <div className="d-flex flex-column my-1" key={i}>
                                                    <span>{unidad}: {count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                );
            })}

            {/* Estadística global de todo el calendario */}
            <Card className="mt-4 shadow-sm">
                <Card.Header className="bg-secondary text-white">
                    <strong>Estadística Global de Turnos</strong>
                </Card.Header>
                <Card.Body>
                    {Object.keys(globalStats).length === 0 ? (
                        <p>No hay datos disponibles.</p>
                    ) : (
                        <Table bordered hover size="sm">
                            <thead>
                            <tr>
                                <th>Unidad</th>
                                <th>Turnos Totales</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.entries(globalStats).map(([unidad, count]) => (
                                <tr key={unidad}>
                                    <td>{unidad}</td>
                                    <td>{count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}