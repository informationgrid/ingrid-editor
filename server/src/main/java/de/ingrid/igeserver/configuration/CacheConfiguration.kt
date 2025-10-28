/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.configuration

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Duration

@Configuration
@EnableCaching
class CacheConfiguration {

    @Bean
    fun cacheManager(): CacheManager {
        val cacheManager = CaffeineCacheManager()

        cacheManager.registerCustomCache(
            "bwastrSearchCache",
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofDays(1)).maximumSize(1000).build(),
        )

        cacheManager.registerCustomCache(
            "bwastrCoordinatesCache",
            Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofDays(1)).maximumSize(200).build(),
        )

        cacheManager.registerCustomCache("aclCache", Caffeine.newBuilder().build())

        return cacheManager
    }
}
