package de.ingrid.igeserver.profiles

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Profile("ingrid-up-sh")
@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver.profiles.ingrid_up_sh"])
class InGridUPSHConfig