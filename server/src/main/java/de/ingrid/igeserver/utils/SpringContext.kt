package de.ingrid.igeserver.utils

import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware
import org.springframework.stereotype.Component

@Component
class SpringContext : ApplicationContextAware {

    companion object {
        private var context: ApplicationContext? = null

        /**
         * Get the Spring managed bean instance of the given class type if it exists, null otherwise
         */
        fun <T: Any?> getBean(beanClass: Class<T>?): T? {
            return context?.getBean(beanClass)
        }
    }

    override fun setApplicationContext(context: ApplicationContext) {
        Companion.context = context
    }
}