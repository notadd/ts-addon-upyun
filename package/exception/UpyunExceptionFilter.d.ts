import { ExceptionFilter, HttpException } from '@nestjs/common';
export declare class UpyunExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, response: any): void;
}
