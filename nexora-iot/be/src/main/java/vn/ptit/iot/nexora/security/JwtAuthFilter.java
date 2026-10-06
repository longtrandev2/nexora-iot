package vn.ptit.iot.nexora.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Reads `Authorization: Bearer <jwt>`; a valid token authenticates the request with the
 * user id (Integer) as principal. Invalid tokens are flagged so the entry point can answer
 * "Phiên đăng nhập đã hết hạn" instead of "Chưa đăng nhập".
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    static final String INVALID_TOKEN_ATTRIBUTE = "nexora.auth.invalidToken";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            String token = header.substring(BEARER_PREFIX.length()).trim();
            jwtService.parseUserId(token).ifPresentOrElse(
                    userId -> SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(userId, null, List.of())),
                    () -> request.setAttribute(INVALID_TOKEN_ATTRIBUTE, Boolean.TRUE));
        }
        chain.doFilter(request, response);
    }
}
