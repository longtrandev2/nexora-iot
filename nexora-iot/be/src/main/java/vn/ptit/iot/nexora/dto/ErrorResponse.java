package vn.ptit.iot.nexora.dto;

/** Error envelope used by every endpoint: {"error": "<Vietnamese message>"}. */
public record ErrorResponse(String error) {
}
