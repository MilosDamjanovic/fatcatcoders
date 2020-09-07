import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private httpClient: HttpClient) { }

  public get(path: string): Observable<any> {
    return this.httpClient.get(`${environment.api}${path}`).pipe(delay(300), catchError(this.handleError.bind(this)));
  }

  public post(path: string, body: any) {
    return this.httpClient.post(`${environment.api}${path}`, body).pipe(delay(500), catchError(this.handleError.bind(this)));
  }

  public put(path: string, body: any) {
    return this.httpClient.put(`${environment.api}${path}`, body).pipe(delay(500), catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse | any): Observable<any> {
    // Check for different kinds of errors
    const err = error.error;
    return throwError(err);
  }
}
