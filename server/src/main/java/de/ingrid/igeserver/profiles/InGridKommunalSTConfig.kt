package de.ingrid.igeserver.profiles

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile


@Profile("ingrid_kommunal_st")
@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver.profiles.ingrid_kommunal_st"])
class InGridKommunalSTConfig