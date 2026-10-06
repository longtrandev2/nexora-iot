package vn.ptit.iot.nexora.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** HS256 token valid 24h; subject = user id. */
@Service
public class JwtService {

    private static final Duration TTL = Duration.ofHours(24);

    private final SecretKey key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 characters (application-local.yml)");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issue(int userId) {
        Instant now = Instant.now();
        return Jwts.builder().subject(String.valueOf(userId))
                .issuedAt(Date.from(now)).expiration(Date.from(now.plus(TTL)))
                .signWith(key).compact();
    }

    /** User id of a valid token, or null. */
    public Integer userId(String token) {
        try {
            return Integer.valueOf(Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
