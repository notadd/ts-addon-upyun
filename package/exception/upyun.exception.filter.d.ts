import { ExceptionFilter, HttpException, ArgumentsHost } from "@nestjs/common";
export declare class UpyunExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, context: ArgumentsHost): void;
}
