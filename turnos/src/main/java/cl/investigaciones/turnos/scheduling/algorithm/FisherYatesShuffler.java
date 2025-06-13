package cl.investigaciones.turnos.scheduling.algorithm;

import java.util.Collections;
import java.util.List;
import java.util.Random;

public class FisherYatesShuffler {

    private static final Random RNG = new Random();

    public static <T> void shuffle(List<T> list) {
        for (int i = list.size() - 1; i > 0; i--) {
            int j = RNG.nextInt(i + 1);
            Collections.swap(list, i, j);
        }
    }
}