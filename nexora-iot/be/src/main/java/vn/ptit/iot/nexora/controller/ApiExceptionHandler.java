package vn.ptit.iot.nexora.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.ptit.iot.nexora.dto.ApiDto.ErrorBody;
import vn.ptit.iot.nexora.service.ApiException;

/** Every error becomes {"error": "<Vietnamese message>"}. */
@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorBody> api(ApiException e) {
        return ResponseEntity.status(e.getStatus()).body(new ErrorBody(e.getMessage()));
    }

    /** Wrong parameter type (e.g. bad date) or unreadable JSON body. */
    @ExceptionHandler({TypeMismatchException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ErrorBody> badInput(Exception e) {
        return ResponseEntity.badRequest().body(new ErrorBody("Dữ liệu không hợp lệ"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorBody> other(Exception e) {
        if (e instanceof ErrorResponse spring) {   // Spring MVC: missing param 400, unknown path 404, 405...
            return ResponseEntity.status(spring.getStatusCode()).body(new ErrorBody("Yêu cầu không hợp lệ"));
        }
        log.error("Unexpected error", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorBody("Lỗi máy chủ, vui lòng thử lại"));
    }
}
