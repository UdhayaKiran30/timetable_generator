package com.edumerge.timetable.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.*;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwt;

    public JwtAuthenticationFilter(JwtService jwt) {
        this.jwt = jwt;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer "))
            try {
            var c = jwt.parse(h.substring(7)).getPayload();
            var auth = new UsernamePasswordAuthenticationToken(c.getSubject(), null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + c.get("role", String.class))));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } catch (Exception ignored) {
        }
        chain.doFilter(req, res);
    }
}
