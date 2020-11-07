import { ReportsHelper } from './../../helper/reports';
import { LoaderService } from './../../core/services/loader.service';
import { Employee, EmployeeWorkSummary, EmployeeSummary } from './../../core/models/employee.model';
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges, ViewChild
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'ttd-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileComponent implements OnChanges {
  @Input() set selectedEmployee(value: any) {
    this.loader.show();
    if (value || value === null) {
      this.currentEmployee = { ...value };
      this.selectedWorkDay = null;
      this.barChartOptions.title.text = `${value.name} time tracks`;
      this.aggregateBarChartOptions.title.text = `${value.name} aggregate time track`;
      this.employeeTracks = Object.assign([], [...value.workDays]);
      this.loader.hide();
    }
  }

  @Output() employeeUpdated = new EventEmitter<EmployeeSummary>();
  @Output() newTrackCreated = new EventEmitter<{ ews: EmployeeWorkSummary, id: number }>();

  @ViewChild('form', { static: false }) form: NgForm;

  public isNewPressed = false;

  public employeeTracks: EmployeeWorkSummary[];
  public selectedWorkDay: EmployeeWorkSummary;
  public currentEmployee: Employee;

  // Bar Chart
  public barChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: ''
    },
  };

  public aggregateBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    title: {
      display: true,
      text: ``
    },
  };
  public barChartType = 'bar';
  public barChartLegend = true;

  // employee's productivity, data arrays
  private totalClockedInTimeArr: number[] = [];
  private totalProductiveTimeArr: number[] = [];
  private totalUnProductiveTimeArr: number[] = [];
  private labels: string[] = [];

  public workDaysChartData = {
    barChartData: [],
    barChartLabel: []
  };

  public aggregateEmmployeeChartData = {
    barChartData: [],
    barChartLabel: []
  };

  constructor(private loader: LoaderService, private cdr: ChangeDetectorRef, private datePipe: DatePipe) { }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    this.loader.hide();
    this.isNewPressed = false;
    const change = simpleChanges.selectedEmployee;
    if (!!change) {
      this.clearChartData();
      this.clearAggChartData();
    }
    this.renderReportData();
    this.renderAggReportData();
  }

  public onEmployeeClick(emp?: EmployeeWorkSummary) {
    this.selectedWorkDay = emp;
    const { clockOutTime, clockInTime } = emp;

    emp.clockInTime = new Date(clockInTime).toISOString();
    emp.clockOutTime = new Date(clockOutTime).toISOString();

    emp.clockInTime = emp.clockInTime.substring(0, emp.clockInTime.length - 1);
    emp.clockOutTime = emp.clockOutTime.substring(0, emp.clockOutTime.length - 1);
  }

  private clearChartData() {
    this.workDaysChartData.barChartData = [];
    this.workDaysChartData.barChartLabel = [];
    this.totalProductiveTimeArr = [];
    this.totalClockedInTimeArr = [];
    this.totalUnProductiveTimeArr = [];
    this.labels.length = 0;
  }

  private clearAggChartData() {
    this.workDaysChartData.barChartData = [];
    this.workDaysChartData.barChartLabel = [];
  }

  private renderReportData(): void {
    const array = this.currentEmployee.workDays;

    this.employeeTracks.forEach(report => {
      this.totalClockedInTimeArr.push(+report.totalClockedInTime);
      this.totalProductiveTimeArr.push(+report.totalProductiveTime);
      this.totalUnProductiveTimeArr.push(+report.totalUnProductiveTime);
    });
    const mappedArr = array.map(({ createdAt }) => this.getPieChartLabels(createdAt));
    this.labels.push(...mappedArr);
    this.workDaysChartData = Object.assign({}, {
      barChartData: [
        { data: this.totalProductiveTimeArr, label: 'Productve time', stack: 'a' },
        { data: this.totalUnProductiveTimeArr, label: 'Unproductive time', stack: 'a' },
        { data: this.totalClockedInTimeArr, label: 'Clocked in time', stack: 'a' }
      ],
      barChartLabel: this.labels
    });
  }

  private renderAggReportData(): void {
    const employeeWorkSummary = ReportsHelper.sumObjectsByKey(...this.employeeTracks);
    const { totalClockedInTime, totalProductiveTime, totalUnProductiveTime } = employeeWorkSummary;
    this.aggregateEmmployeeChartData = Object.assign({}, {
      barChartData: [
        { data: [totalProductiveTime], label: 'Productve time', stack: 'a' },
        { data: [totalUnProductiveTime], label: 'Unproductive time', stack: 'a' },
        { data: [totalClockedInTime], label: 'Clocked in time', stack: 'a' }
      ],
      barChartLabel: [`${this.datePipe.transform(new Date(this.currentEmployee.createdAt), 'MMM d')}`]
    });
  }

  public isWorkTimeValid(form: NgForm): boolean {
    const clockInTime = new Date(this.selectedWorkDay.clockInTime);
    const clockOutTime = new Date(this.selectedWorkDay.clockOutTime);
    if (clockInTime >= clockOutTime && form) {
      form.form.controls.clockInTime.setErrors({ clock: true });
      form.form.controls.clockOutTime.setErrors({ clock: true });
      return false;
    } else {
      form.form.controls.clockInTime.setErrors(null);
      form.form.controls.clockOutTime.setErrors(null);
      return true;
    }
  }

  private getPieChartLabels(createdAt: string): string {
    if (this.currentEmployee) {
      return this.datePipe.transform(new Date(createdAt), 'MMM d');
    }
    return '';
  }

  private isDirty(form: NgForm): boolean {
    if (form.form.valid && form.form.pristine) {
      form.form.controls.totalUnProductiveTime.setErrors({ required: true });
      form.form.controls.totalProductiveTime.setErrors({ required: true });
      form.form.controls.totalClockedInTime.setErrors({ required: true });
      return false;
    }
    return true;
  }

  // update use info
  public updateStatus(form: NgForm): void {
    this.cdr.detach();
    this.loader.show();
    const updatedAt = new Date().toISOString();
    if (this.currentEmployee) {
      const { name, status, createdAt, id } = this.currentEmployee;
      this.employeeUpdated.emit({ name, status, createdAt, updatedAt, id });
    }
  }

  // add new user track
  public addNewTrack(form: NgForm): void {
    if (this.isDirty(form) && this.isWorkTimeValid(form) && form.dirty) {
      this.cdr.detach();
      this.loader.show();
      this.newTrackCreated.emit({ ews: this.selectedWorkDay, id: this.currentEmployee.id });
    }
  }

  public changeUserStatus(event: MatSlideToggleChange): void {
    this.currentEmployee.status = event.checked;
  }

  public closePanel(): void {
    this.selectedWorkDay = null;
  }

  public createNewTrack(form: NgForm): void {
    this.isNewPressed = true;
    this.currentEmployee.status = false;
    this.selectedWorkDay = {
      employeeID: this.currentEmployee.id,
      totalClockedInTime: 0,
      totalProductiveTime: 0,
      totalUnProductiveTime: 0,
      createdAt: new Date().toISOString(),
      clockInTime: new Date().toISOString(),
      clockOutTime: new Date().toISOString()
    };
  }
}
