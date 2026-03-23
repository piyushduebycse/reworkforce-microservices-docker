package com.revworkforce.performanceservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String jwtSecret;
    private Key getSigningKey() { return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)); }
    public Claims validateToken(String token) { return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody(); }
    public String getEmailFromToken(String token) { return validateToken(token).getSubject(); }
    public Long getUserIdFromToken(String token) { String id = validateToken(token).get("userId", String.class); return id != null ? Long.parseLong(id) : null; }
    public String getRoleFromToken(String token) { return validateToken(token).get("role", String.class); }
    public boolean isTokenValid(String token) { try { validateToken(token); return true; } catch (Exception e) { return false; } }
}
