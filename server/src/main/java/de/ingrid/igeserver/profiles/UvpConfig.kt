package de.ingrid.igeserver.profiles

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Profile("uvp")
@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver.profiles.uvp"])
class UvpConfig