import { HttpException, HttpStatus } from "@nestjs/common";

export class CustomException extends HttpException {
  constructor(message: string, code: number, data = null) {
    super({ message, code, data }, HttpStatus.OK)
  }
}
