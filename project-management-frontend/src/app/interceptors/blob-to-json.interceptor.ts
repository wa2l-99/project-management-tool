import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class BlobToJsonInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      switchMap((event) => {
        if (event instanceof HttpResponse && event.body instanceof Blob) {
          return this.handleBlobResponse(event).pipe(
            map(
              (body) =>
                new HttpResponse({
                  body,
                  headers: event.headers,
                  status: event.status,
                  statusText: event.statusText,
                  url: event.url || undefined,
                })
            )
          );
        }
        return [event];
      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.error instanceof Blob) {
          return this.handleBlobError(err).pipe(
            switchMap((body) =>
              throwError(
                new HttpErrorResponse({
                  error: body,
                  headers: err.headers,
                  status: err.status,
                  statusText: err.statusText,
                  url: err.url || undefined,
                })
              )
            )
          );
        }
        return throwError(err);
      })
    );
  }

  private handleBlobResponse(event: HttpResponse<Blob>): Observable<any> {
    const reader = new FileReader();
    return new Observable<any>((observer) => {
      reader.onloadend = () => {
        try {
          const text = reader.result as string;
          let jsonResponse;
          if (event.body && event.body.type === 'application/json') {
            jsonResponse = JSON.parse(text);
          } else {
            jsonResponse = { message: text };
          }
          observer.next(jsonResponse);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };
      reader.onerror = () => {
        observer.error(reader.error);
      };
      if (event.body) {
        reader.readAsText(event.body);
      } else {
        observer.error(new Error('Response body is null'));
      }
    });
  }

  private handleBlobError(error: HttpErrorResponse): Observable<any> {
    return new Observable<any>((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const text = reader.result as string;
          const contentType = error.headers.get('Content-Type') || '';
          let jsonError;

          if (contentType.includes('application/json')) {
            try {
              jsonError = JSON.parse(text);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (Jerror) {
              jsonError = JSON.parse(JSON.stringify(text));
            }
          } else {
            jsonError = { message: text };
          }
          observer.next(jsonError);
          observer.complete();
        } catch (err) {
          observer.error(err);
        }
      };
      reader.onerror = () => {
        observer.error(reader.error);
      };
      if (error.error) {
        reader.readAsText(error.error);
      } else {
        observer.error(new Error('Error body is null'));
      }
    });
  }
}
