import { User } from './../models/user.model';
import { Employee } from './../models/employee.model';
import { api } from './../models/api.model';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private appService: AppService) {

  }
  public getAllUsers(): Observable<Employee[]> {
    return this.appService.get(api.user.getAll);
  }

  public createUser(userData: User): Observable<User> {
    return this.appService.post(api.user.create, userData);
  }

  public updateUser(userData: Employee): Observable<Employee> {
    return this.appService.put(
      api.user.update.replace(':userId', `${userData.id}`), userData);
  }

   public getAllAdmins(): Observable<any[]> {
    return this.appService.get(api.admins.getAll);
  }
}
