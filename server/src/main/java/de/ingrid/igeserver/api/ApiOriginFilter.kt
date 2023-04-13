package de.ingrid.igeserver.api

import jakarta.servlet.*
import jakarta.servlet.http.HttpServletResponse

class ApiOriginFilter : Filter {

    override fun doFilter(request: ServletRequest, response: ServletResponse,
                          chain: FilterChain) {
        val res = response as HttpServletResponse
        res.addHeader("Access-Control-Allow-Origin", "*")
        res.addHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT")
        res.addHeader("Access-Control-Allow-Headers", "Content-Type")
        chain.doFilter(request, response)
    }

    override fun destroy() {}

    override fun init(filterConfig: FilterConfig) {}
}