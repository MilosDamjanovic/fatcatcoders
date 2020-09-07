import { EmployeeGeneralSummary } from './../core/models/employee.model';
import { SnackbarService } from './../core/services/snackbar.service';
import { UserService } from './../core/services/user.service';
import { map, switchMapTo, tap, finalize } from 'rxjs/operators';
import { EmployeeService } from './../core/services/employee.service';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Employee, EmployeeWorkSummary } from '../core/models/employee.model';
import { Observable, forkJoin, of, BehaviorSubject } from 'rxjs';
import { ReportsHelper } from '../helper/reports';
import { LoaderService } from '../core/services/loader.service';

@Component({
  selector: 'ttd-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  public employeeData$: Observable<any>;
  public employeeGeneralSummaryData: EmployeeGeneralSummary;
  public employeeWorkTrack: Employee[];
  public employeeTableData$: Observable<any>;
  public totalWorkers: number;

  private refetchSubject$ = new BehaviorSubject(true);
  public cachedTracks: EmployeeWorkSummary[];
  public selectedEmployee: Employee;

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private loader: LoaderService
  ) { }

  ngOnInit() {
    this.employeeGeneralSummaryData = null;
    this.employeeTableData$ = this.refetchSubject$.pipe(
      tap(() => this.loader.show()),
      switchMapTo(this.getEmployeeStreamData()),
    );
  }

  private refetchData(param): void {
    this.cachedTracks.length = 0;
    this.employeeGeneralSummaryData = null;
    this.refetchSubject$.next(param);
  }



  private getEmployeeStreamData(): Observable<Employee[]> {
    return forkJoin([
      this.employeeService.getAllTracks(),
      this.userService.getAllUsers(),
    ]).pipe(
      map(([tracks, employees]) => {
        this.cachedTracks = tracks;
        this.totalWorkers = employees.length || 0;
        this.employeeWorkTrack = this.getEmployeeWorkTrack(employees, tracks);

        const result = tracks.reduce((empSummary, { totalClockedInTime, employeeID, id,
          totalProductiveTime, neutralTime, totalUnProductiveTime }) => {
          empSummary[employeeID] = empSummary[employeeID] || {
            id, employeeID, totalClockedInTime: 0,
            neutralTime: 0, totalUnProductiveTime: 0,
            totalProductiveTime: 0
          };
          empSummary[employeeID].totalClockedInTime += totalClockedInTime;
          empSummary[employeeID].totalProductiveTime += totalProductiveTime;
          empSummary[employeeID].totalUnProductiveTime += totalUnProductiveTime;
          empSummary[employeeID].neutralTime += neutralTime;
          return empSummary;
        }, {});
        employees.map(e => {
          const workLoad = Object.keys(result).find(wld => wld.includes(`${e.id}`));
          const data = { ...result[workLoad] };
          e.aggregateWorkDays = data;
        });
        return employees;
      }),
      finalize(() => this.loader.hide()));
  }

  private getEmployeeWorkTrack(employees: Employee[], tracks: EmployeeWorkSummary[]): Employee[] {
    const remappedEmployees: Employee[] = [...employees].map((e) => {
      e.workDays = tracks.filter((ews: EmployeeWorkSummary) => ews.employeeID === e.id);
      return e;
    });
    return remappedEmployees;
  }

  private handleDataSourceErr(err): void {
    this.loader.hide();
    this.snackbarService.notify('Action failed, please try again later');
    console.error(err);
  }

  private refreshPage(): void {
    this.selectedEmployee = null;
    this.refetchData(true);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  private displayUpdateSuccessToast(argument): void {
    this.snackbarService.notify(`${argument.name} is successfuly updated`);
    this.refreshPage();
  }

  private displayCreateSuccessToast(): void {
    this.snackbarService.notify(`New work track is successfuly created`);
    this.refreshPage();
  }

  public selectEmployee(emp: Employee) {
    emp.workDays = this.cachedTracks.filter((ews: EmployeeWorkSummary) => ews.employeeID === emp.id);
    this.selectedEmployee = { ...emp };
  }

  public addNewTrack(trackData: { ews: EmployeeWorkSummary, id: number }): void {
    this.employeeService.addNewEmployeeTrack({ ews: trackData.ews, id: trackData.id }).subscribe({
      next: this.displayCreateSuccessToast.bind(this),
      error: this.handleDataSourceErr.bind(this)
    });
  }

  public updateUserInfo(emp: Employee): void {
    this.userService.updateUser(emp)
    .subscribe({
      next: this.displayUpdateSuccessToast.bind(this),
      error: this.handleDataSourceErr.bind(this)
    });
  }
}
