package com.nfteam.server.security.handler;

import com.nfteam.server.security.utils.ErrorResponder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@Component
public class MemberAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        ErrorResponder.sendErrorResponse(response, HttpStatus.UNAUTHORIZED);
        Exception exception = (Exception) request.getAttribute("exception");
        log.warn("Security - Unauthorized Exception: {}", exception != null ? exception.getMessage() : authException.getMessage());
    }

}