package cl.investigaciones.turnos.scheduling.algorithm;

import java.util.List;

/**
 * Distribuye elementos de `items` sobre `slots` de forma Round‑Robin preservando el orden dado.
 */
public class LoadBalancer {

    public static <T> int distribute(List<T> slots, List<T> items, java.util.function.BiConsumer<T,T> assigner) {
        int index = 0;
        int assignments = 0;
        for (T slot : slots) {
            if (items.isEmpty()) break;
            T item = items.get(index % items.size());
            assigner.accept(slot, item);
            index++;
            assignments++;
        }
        return assignments;
    }
}