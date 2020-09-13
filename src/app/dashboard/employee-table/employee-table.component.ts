import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from './../../core/models/employee.model';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { DateAdapter } from '@angular/material/core';

export interface IEmployeeFilter {
  column: string;
  value: string;
}

@Component({
  selector: 'ttd-employee-table',
  templateUrl: './employee-table.component.html',
  styleUrls: ['./employee-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeTableComponent implements OnInit, AfterViewInit {
  @Input() set employees(value: any[]) {
    if (value) {
      this.dataSource.data = value;
      this.isLoading = false;
    }
  }

  constructor(private _dateAdapter: DateAdapter<any>) { }

  public get startDateCtrl(): AbstractControl {
    return this.range.controls.start;
  }

  public get endDateCtrl(): AbstractControl {
    return this.range.controls.end;
  }
  @Output() employeeSelected = new EventEmitter<Employee>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('picker', { static: false }) datepicker: MatDateRangePicker<Date>;

  // date range picker
  public range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  date = new Date();

  private isLastClicked = false;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['name', 'totalClockedInTime', 'totalProductiveTime',
    'totalUnProductiveTime', 'productivityRatio', 'edit'];
  public filter: string;
  public isLoading = true;
  public employeeStatus: boolean;
  filterValues: any = {};

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter: string) => {
      const accumulator = (currentTerm, key) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      if (this.startDateCtrl.value && this.endDateCtrl.value) {
        return data.createdAt >= this.startDateCtrl.value && data.updatedAt <= this.endDateCtrl.value;
      }
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
    this._dateAdapter.setLocale('en-GB');
  }

  applyFilter(filterValue: string | boolean) {
    if (typeof filterValue !== 'boolean') {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.dataSource.filter = filterValue + '';
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  nestedFilterCheck(search, data, key) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearFilters() {
    this.dataSource.filter = '';
  }

  public opened() {
    const container = document.createElement('div');
    const filterDiv = document.createElement('div');

    filterDiv.className = 'filter-by-example';
    const heading = document.createElement('h4');

    container.className = 'container';
    heading.innerText = 'Filter by example';
    heading.className = 'heading';

    this.generateButtons(filterDiv);
    container.appendChild(heading);
    container.append(filterDiv);

    setTimeout(() => {
      const element = document.getElementsByTagName('mat-datepicker-content');
      element[0].appendChild(container);
    });
  }

  public onSearchEmployeesKeyUp = (value: string) => {
    this.dataSource.filter = value && value.trim().toLocaleLowerCase();
  }

  public sortData(sort: any): void {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'totalClockedInTime': return compare(a.totalClockedInTime, b.totalClockedInTime, isAsc);
        case 'totalProductiveTime': return compare(a.totalProductiveTime, b.totalProductiveTime, isAsc);
        case 'totalUnProductiveTime': return compare(a.totalUnProductiveTime, b.totalUnProductiveTime, isAsc);
        case 'productivityRatio': return compare(a.productivityRatio, b.productivityRatio, isAsc);
        default: return 0;
      }
    });
  }

  public selectEmployee(emp: Employee): void {
    const { name, status, id, createdAt, updatedAt } = emp;
    this.employeeSelected.emit({ name, status, id, createdAt, updatedAt, workDays: [] });
  }

  private generateButtons(container: HTMLDivElement): any {
    this.createTodayButton(container);
    this.createYesterdayButton(container);
    this.createLast7DaysButton(container);
    this.createLastWeekButton(container);
    this.createThisWeekButton(container);
    this.createLastMonthButton(container);
    this.createThisMonth(container);
    this.createCustomButton(container);
  }

  private styleFilterBtns(button: HTMLButtonElement): void {
    button.className = 'mat-focus-indicator mat-stroked-button mat-button-base mat-primary';
    button.setAttribute('type', 'submit');
    button.setAttribute('color', 'primary');
  }

  // done
  private createTodayButton(container: HTMLDivElement): void {
    const today = document.createElement('button');
    const todayTxt = document.createTextNode('Today');
    today.onclick = () => {
      const todayDate = new Date();
      this.startDateCtrl.setValue(todayDate.toISOString());
      this.endDateCtrl.setValue(todayDate.toISOString());
    };
    this.styleFilterBtns(today);
    today.appendChild(todayTxt);
    container.appendChild(today);
  }

  // done
  private createYesterdayButton(container: HTMLDivElement): void {
    const yesterday = document.createElement('button');
    const yesterdayTxt = document.createTextNode('Yesterday');
    yesterday.onclick = () => {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      this.startDateCtrl.setValue(yesterdayDate.toISOString());
      this.endDateCtrl.setValue(yesterdayDate.toISOString());

    };
    this.styleFilterBtns(yesterday);
    yesterday.appendChild(yesterdayTxt);
    container.appendChild(yesterday);
  }

  // done
  private createLast7DaysButton(container: HTMLDivElement): void {
    const last7DaysBtn = document.createElement('button');
    const last7DaysTxt = document.createTextNode('Last 7 days');
    last7DaysBtn.onclick = () => {
      const date = new Date();
      const last = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
      const day = last.getDate();
      const month = last.getMonth();
      const year = last.getFullYear();

      this.startDateCtrl.setValue(new Date(year, month, day).toISOString());
      this.endDateCtrl.setValue(new Date().toISOString());
    };
    this.styleFilterBtns(last7DaysBtn);
    last7DaysBtn.appendChild(last7DaysTxt);
    container.appendChild(last7DaysBtn);
  }

  private createLastWeekButton(container: HTMLDivElement): void {
    const lastWeek = document.createElement('button');
    const lastWeekTxt = document.createTextNode('Last Week');
    lastWeek.onclick = () => {
      const beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000);
      const day = beforeOneWeek.getDay();
      const diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1);
      const lastMonday = new Date(beforeOneWeek.setDate(diffToMonday));
      const lastSunday = new Date(beforeOneWeek.setDate(diffToMonday + 6));

      this.startDateCtrl.setValue(lastMonday.toISOString());
      this.endDateCtrl.setValue(lastSunday.toISOString);
    };
    this.styleFilterBtns(lastWeek);
    lastWeek.appendChild(lastWeekTxt);
    container.appendChild(lastWeek);
  }

  // done
  private createThisWeekButton(container: HTMLDivElement): void {
    const thisWeek = document.createElement('button');
    const thisWeekTxt = document.createTextNode('This Week');
    thisWeek.onclick = () => {
      const curr = new Date();
      const first = curr.getDate() - curr.getDay();
      const last = first + 6;

      const firstday = new Date(curr.setDate(first)).toISOString();
      const lastday = new Date(curr.setDate(last)).toISOString();

      this.startDateCtrl.setValue(firstday);
      this.endDateCtrl.setValue(lastday);
    };
    this.styleFilterBtns(thisWeek);
    thisWeek.appendChild(thisWeekTxt);
    container.appendChild(thisWeek);
  }

  // done
  private createLastMonthButton(container: HTMLDivElement): void {
    const lastMonthBtn = document.createElement('button');
    const lastMonthTxt = document.createTextNode('Last Month');
    lastMonthBtn.onclick = () => {
      const element = document
        .getElementsByClassName('mat-focus-indicator mat-calendar-previous-button mat-icon-button')[0] as HTMLElement;
      element.click();
      this.isLastClicked = true;
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
      this.startDateCtrl.setValue(firstDay.toISOString());
      this.endDateCtrl.setValue(lastDay.toISOString());
    };
    this.styleFilterBtns(lastMonthBtn);
    lastMonthBtn.appendChild(lastMonthTxt);
    container.appendChild(lastMonthBtn);
  }

  // done
  private createThisMonth(container: HTMLDivElement): void {
    const thisMonthTxt = document.createTextNode('This Month');
    const thisMonth = document.createElement('button');
    thisMonth.onclick = () => {
      if (this.isLastClicked) {
        const element = document
          .getElementsByClassName('mat-focus-indicator mat-calendar-next-button mat-icon-button')[0] as HTMLElement;
        element.click();
      }
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      this.startDateCtrl.setValue(firstDay.toISOString());
      this.endDateCtrl.setValue(lastDay.toISOString());
    };
    this.styleFilterBtns(thisMonth);
    thisMonth.appendChild(thisMonthTxt);
    container.appendChild(thisMonth);
  }

  // done
  private createCustomButton(container: HTMLDivElement): void {
    const custom = document.createElement('button');
    const customTxt = document.createTextNode('Custom');
    custom.onclick = () => {
      this.startDateCtrl.setValue('');
      this.endDateCtrl.setValue('');
    };
    this.styleFilterBtns(custom);
    custom.appendChild(customTxt);
    container.appendChild(custom);
  }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
