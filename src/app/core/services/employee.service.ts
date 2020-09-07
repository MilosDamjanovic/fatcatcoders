import { EmployeeWorkSummary } from './../models/employee.model';
import { api } from './../models/api.model';
import { AppService } from './../services/app.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private appService: AppService) { }

  public addNewEmployeeTrack(data: { ews: EmployeeWorkSummary, id: number }): Observable<any> {
    return this.appService.post(
      api.user.addNewTrack.replace(':userId', `${data.id}`),
      data.ews);
  }

  public getAllTracks(): Observable<EmployeeWorkSummary[]> {
    return this.appService.get(api.time.tracks);
  }
}
