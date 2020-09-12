import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../material.module';
import { DashboardComponent } from './dashboard.component';
import { GeneralSummaryComponent } from './general-summary/general-summary.component';
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component';
import { EmployeeTableComponent } from './employee-table/employee-table.component';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { EmployeeReportComponent } from './employee-profile/employee-report/employee-report.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EmployeeTableComponent,
    EmployeeProfileComponent,
    GeneralSummaryComponent,
    EmployeeReportComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DashboardRoutingModule,
    MaterialModule,
    ChartsModule
  ],
  providers: [DatePipe],
  exports: [DashboardComponent, ReactiveFormsModule, FormsModule]
})
export class DashboardModule { }
