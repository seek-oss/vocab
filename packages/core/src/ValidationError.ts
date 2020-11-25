export class ValidationError extends Error {
  code: string;
  rawMessage: string;
  constructor(code: string, message: string) {
    super(`Invalid vocab.config.js: ${code} - ${message}`);
    this.code = code;
    this.rawMessage = message;
  }
}
