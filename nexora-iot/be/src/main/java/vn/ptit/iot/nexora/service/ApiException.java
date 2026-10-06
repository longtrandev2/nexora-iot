package vn.ptit.iot.nexora.service;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** Error with an HTTP status + Vietnamese message, returned as {"error": message}. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public static ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
