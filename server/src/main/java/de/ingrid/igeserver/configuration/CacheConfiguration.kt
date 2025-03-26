
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
