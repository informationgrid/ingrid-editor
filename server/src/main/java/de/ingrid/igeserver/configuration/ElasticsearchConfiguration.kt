package de.ingrid.igeserver.configuration

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("elasticsearch")
@ComponentScan(basePackages = ["de.ingrid.elasticsearch"])
class ElasticsearchConfiguration
