export class ApiResponse {
  constructor(success, data = null, message = '', code = '', warnings = []) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.code = code;
    this.warnings = warnings;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Operación exitosa', code = 'SUCCESS') {
    return new ApiResponse(true, data, message, code);
  }

  static error(message = 'Error en la operación', code = 'ERROR', data = null) {
    return new ApiResponse(false, data, message, code);
  }

  static warning(data = null, message = 'Advertencia', code = 'WARNING', warnings = []) {
    return new ApiResponse(true, data, message, code, warnings);
  }
}