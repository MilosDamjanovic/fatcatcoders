import { AppService } from './app.service';
import { User } from './../models/user.model';
import { api } from './../models/api.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserReq } from '../models/user.model';
import { Router } from '@angular/router';
import { mergeMap, catchError } from 'rxjs/operators';

const AUTHENTICATION_KEY = 'time-track:authenticated';

@Injectable({ providedIn: 'root' })
export class OAuthService {

  private isAuthenticated = new BehaviorSubject(this.getIsAuthenticated() || false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(private router: Router, private appService: AppService) { }

  public login(user: UserReq): Observable<boolean> {
    return this.appService.post(api.oauth.login, user).
      pipe(
        mergeMap(this.handleAuthentication.bind(this)),
        catchError(this.handleAuthError.bind(this))
      );
  }

  public logout(): void {
    this.setIsAuthenticated(false);
    this.isAuthenticated.next(false);
    this.router.navigateByUrl('/login');
  }

  public getIsAuthenticated(): boolean {
    return JSON.parse(localStorage.getItem(AUTHENTICATION_KEY));
  }

  public setIsAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated.next(true);
    localStorage.setItem(AUTHENTICATION_KEY, JSON.stringify(isAuthenticated));
  }

  private handleAuthError(err): void {
    throw err;
  }

  private handleAuthentication(user): Observable<boolean> {
    const users = JSON.parse(localStorage.getItem('admins'));
    const existingUser = users.find((u: User) => u.email === user.email && u.password === user.password);
    return existingUser ? of(true) : of(false);
  }

}
