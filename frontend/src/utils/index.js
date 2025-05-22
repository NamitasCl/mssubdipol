/* =================== FUNCIONES AUXILIARES PARA GENERAR TURNOS =================== */

/**
 * Devuelve el nombre abreviado del día de la semana (e.g. 'lun', 'mar', etc.)
 */
export function getDayName(year, month, day) {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-ES", { weekday: "short" });
}

export function isWeekend(year, month, day) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0=domingo, 6=sábado
}

/**
 * Construye un "pool" de IDs repetidos (cada persona equivale a 2 "tokens")
 * para luego intentar asignar 9 unidades por día.
 */
export function buildWorkerPool(depts, days) {
    // Suma total de personas
    const totalPeople = depts.reduce((acc, d) => acc + Number(d.totalPeople), 0);
    const totalTokens = totalPeople * 2; // cada persona tiene 2 tokens
    const required = days * 9; // se necesitan 9 * days

    let pool = [];
    depts.forEach((dept) => {
        for (let i = 0; i < dept.totalPeople * 2; i++) {
            pool.push(dept.id);
        }
    });

    // Ejemplo: si tenemos exceso de tokens, podríamos remover algunos de forma aleatoria
    if (totalTokens > required) {
        // removes 1 token al azar, etc. (puedes ajustarlo)
        const indexToRemove = Math.floor(Math.random() * pool.length);
        pool.splice(indexToRemove, 1);
    }
    return pool;
}

/**
 * Intenta asignar 9 "unidades" para un día, bajo un limite "limitDept" (máximo de items que un dept
 * puede tener en un mismo día). Ej: si limitDept=4, no puedes tener más de 4 tokens del mismo dept.
 * - weekend => limitDept bajo (por ejemplo 2) => se fuerza más variedad
 */
export function tryAssignDay(pool, limitDept, isWeekendFlag, depts, assignmentCounter) {
    let dayWorkers = [];
    let dayDeptCount = {};
    let localPool = [...pool];
    let i = 0;
    let attempts = 0;

    while (dayWorkers.length < 9 && attempts < 20000) {
        if (i >= localPool.length) break;
        const candidate = localPool[i];
        // Localiza el "dept" real
        const dept = depts.find((d) => d.id === candidate);
        if (!dept) {
            i++;
            attempts++;
            continue;
        }
        // Si es fin de semana y dept no trabaja, salta
        if (isWeekendFlag && dept.noWeekend) {
            i++;
            attempts++;
            continue;
        }
        // Si llegó al máx de turnos totales de ese dept
        if (assignmentCounter[candidate] >= dept.maxShifts) {
            i++;
            attempts++;
            continue;
        }
        // Checar cuántas veces ya se asignó en este día
        const currentDayCount = dayDeptCount[candidate] || 0;
        if (currentDayCount >= limitDept) {
            i++;
            attempts++;
            continue;
        }

        // Aceptamos a candidate
        dayWorkers.push(candidate);
        dayDeptCount[candidate] = currentDayCount + 1;
        assignmentCounter[candidate] += 1;
        localPool.splice(i, 1);
        attempts++;
    }

    if (dayWorkers.length === 9) {
        return { success: true, dayWorkers, newPool: localPool };
    } else {
        return { success: false };
    }
}

/**
 * Genera una asignación aleatoria de 9 unidades por día, para 'days' días, usando
 * un array de 'departamentos' con sus restricciones (maxShifts, noWeekend, etc.).
 */
export function generateCalendar(depts = [], days, year, month) {
    if (!Array.isArray(depts)) depts = [];
    let schedule = [];

    // Mantendrá el conteo de cuántas veces ha sido usado cada dept en total
    let assignmentCounter = {};
    depts.forEach((d) => {
        if (d.maxShifts == null) d.maxShifts = 9999;
        if (d.noWeekend == null) d.noWeekend = false;
        assignmentCounter[d.id] = 0;
    });

    // Construimos un pool con tokens
    let originalPool = buildWorkerPool(depts, days);
    let pool = [...originalPool];

    // Mezclamos aleatoriamente el pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Asignamos día a día
    for (let day = 1; day <= days; day++) {
        const weekendFlag = isWeekend(year, month, day);

        // Escogemos un "límite" base
        let primaryLimit = weekendFlag ? 2 : 4;
        let fallbackLimit = weekendFlag ? 3 : 5;

        // Intento primario
        let resultPrimary = tryAssignDay(pool, primaryLimit, weekendFlag, depts, assignmentCounter);

        if (resultPrimary.success) {
            schedule.push({
                dia: day,
                diaSemana: getDayName(year, month, day),
                unidades: resultPrimary.dayWorkers,
            });
            pool = resultPrimary.newPool;
            continue;
        }

        // Si falló, intentamos un fallback
        // "Reiniciamos" el pool con la mezcla original
        pool = [...originalPool];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        // Volvemos a poner a 0 el assignmentCounter y reasignamos días previos
        // en teoría esto es más complejo; para simplicidad lo omitimos o lo mantendríamos.

        let resultFallback = tryAssignDay(pool, fallbackLimit, weekendFlag, depts, assignmentCounter);
        if (resultFallback.success) {
            schedule.push({
                dia: day,
                diaSemana: getDayName(year, month, day),
                unidades: resultFallback.dayWorkers,
            });
            pool = resultFallback.newPool;
        } else {
            schedule.push({
                dia: day,
                diaSemana: getDayName(year, month, day),
                error: `No se pudo asignar 9 turnos con límite ${fallbackLimit}.`
            });
        }
    }

    return schedule;
}

/**
 * Convierte el ID de departamento a su 'name' real para mostrarlo.
 */
export function getDeptName(depts, id) {
    const found = depts.find((d) => d.id === id);
    return found ? found.name : `Dept ${id}`;
}

/**
 * Calcula estadísticas por día y globales (cuántas veces salió cada dept).
 */
export function computeStats(schedule) {
    let dayStats = [];
    let globalStats = {};

    schedule.forEach((dayObj) => {
        if (dayObj.error) {
            // Día con error => no asigna nada
            dayStats.push({ dia: dayObj.dia, counts: {} });
            return;
        }

        let counts = {};
        dayObj.unidades.forEach((unidad) => {
            counts[unidad] = (counts[unidad] || 0) + 1;
            globalStats[unidad] = (globalStats[unidad] || 0) + 1;
        });

        dayStats.push({ dia: dayObj.dia, counts });
    });

    return { dayStats, globalStats };
}