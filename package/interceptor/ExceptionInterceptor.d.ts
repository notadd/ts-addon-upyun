import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
export declare class ExceptionInterceptor implements NestInterceptor {
    intercept(dataOrRequest: any, context: ExecutionContext, stream$: Observable<any>): Observable<any>;
}
