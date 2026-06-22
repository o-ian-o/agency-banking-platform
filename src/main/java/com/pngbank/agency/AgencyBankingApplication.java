package com.pngbank.agency;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class AgencyBankingApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgencyBankingApplication.class, args);
    }
}