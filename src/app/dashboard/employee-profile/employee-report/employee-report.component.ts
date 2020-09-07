import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ttd-employee-report',
  templateUrl: './employee-report.component.html',
  styleUrls: ['./employee-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeReportComponent {

  @Input() barChartOptions: any;
  @Input() barChartData: any[];
  @Input() barChartLabel: string[];

  @Input() barChartLegend: boolean;
  @Input() barChartType: string;
  @Input() aggregate: boolean;

  constructor() { }

}
