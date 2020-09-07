import { EmployeeWorkSummary } from './../core/models/employee.model';
export class ReportsHelper {

  private static readonly reportKeys: string[] = ['totalClockedInTime', 'totalProductiveTime', 'totalUnProductiveTime'];

  public static sumObjectsByKey(...workEffect: EmployeeWorkSummary[]): EmployeeWorkSummary {
    return workEffect.reduce((a: any, b: EmployeeWorkSummary) => {
      for (const k in b) {
        if (this.reportKeys.includes(k) && b.hasOwnProperty(k)) {
          a[k] = (a[k] || 0) + b[k];
        }
      }
      return { ...a };
    }, {});
  }
}

