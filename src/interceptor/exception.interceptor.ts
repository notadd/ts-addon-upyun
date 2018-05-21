import { Injectable, NestInterceptor, ExecutionContext, HttpException } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context.host";
import { catchError } from "rxjs/operators/catchError";
import { Observable } from "rxjs";

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, stream$: Observable<any>): Observable<any> {
        return stream$.pipe(
            catchError((err, caught): any => {
                if (err instanceof HttpException) {
                    return Promise.resolve({
                        code: err.getStatus(),
                        message: err.getResponse()
                    });
                } else if (err instanceof Error) {
                    return Promise.resolve({
                        code: 500,
                        message: "出现了意外错误:" + err.name + "\n" + err.message + "\n" + err.stack
                    });
                } else {
                    return Promise.resolve({
                        code: 500,
                        message: "出现了意外错误:" + err.toString()
                    });
                }
            })
        );
    }
}
