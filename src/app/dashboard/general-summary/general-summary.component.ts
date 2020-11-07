import { Component, Input, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { ReportsHelper } from 'app/helper/reports';
import { EmployeeGeneralSummary, EmployeeWorkSummary } from './../../core/models/employee.model';

@Component({
  selector: 'ttd-general-summary',
  templateUrl: './general-summary.component.html',
  styleUrls: ['./general-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSummaryComponent implements OnChanges {
  private readonly reportKeys: string[] = ['totalClockedInTime', 'totalProductiveTime', 'totalUnProductiveTime'];
  public generalSummary: EmployeeGeneralSummary;
  public isLoading = true;

  @Input() totalWorkSummary: EmployeeWorkSummary[];
  @Input() totalNumberOfEmployees: number;

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges.totalWorkSummary.previousValue) {
      this.generalSummary.totalWorkSummary.totalClockedInTime = 0;
      this.generalSummary.totalWorkSummary.totalProductiveTime = 0;
      this.generalSummary.totalWorkSummary.totalUnProductiveTime = 0;
      this.generalSummary = null;
    }

    if (simpleChanges.totalWorkSummary.currentValue) {
      this.generalSummary = {
        totalWorkSummary: Object.assign({}, ReportsHelper.sumObjectsByKey(...simpleChanges.totalWorkSummary.currentValue)) ,
        totalNumberOfEmployees: this.totalNumberOfEmployees || 0
      };
    }

    this.isLoading = false;
  }
}
