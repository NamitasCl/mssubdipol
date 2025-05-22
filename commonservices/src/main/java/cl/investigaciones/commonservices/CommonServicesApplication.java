package cl.investigaciones.commonservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CommonServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(CommonServicesApplication.class, args);
    }

}
