package com.revworkforce.reportingservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}") private String jwtSecret;
    private Key key() { return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)); }
    public Claims validate(String token) { return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody(); }
    public String getRoleFromToken(String token) { return validate(token).get("role", String.class); }
    public boolean isTokenValid(String token) { try { validate(token); return true; } catch(Exception e) { return false; } }
}
