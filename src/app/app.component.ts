import { User } from './core/models/user.model';
import { UserService } from './core/services/user.service';
import { OAuthService } from './core/services/oauth.service';
import { AppService } from '../app/core/services/app.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'ttd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'FatCatCoders Application';
  public users$: Observable<User[]>;
  public isAuthenticated$ = this.oAuthService.isAuthenticated$.pipe(shareReplay(1));
  public links = [
    { path: 'dashboard', title: 'Dashboard' },
    { path: 'users', title: 'Users' },
  ];

  constructor(private userService: UserService,
              private oAuthService: OAuthService, ) { }

  ngOnInit(): void {
    this.initData();
  }

  private initData(): void {
    this.userService.getAllAdmins().subscribe(this.cacheUsers.bind(this));
  }

  private cacheUsers(users: any[]) {
    localStorage.setItem('admins', JSON.stringify(users));
  }

  logout() {
    this.oAuthService.logout();
  }

  ngOnDestroy(): void {
    localStorage.clear();
  }
}
