package de.ingrid.igeserver.profiles

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Profile("sample")
@Configuration
@ComponentScan(basePackages = ["de.ingrid.igeserver.profiles.sample"])
class SampleConfig
