import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from './../../core/models/employee.model';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDateRangePicker } from '@angular/material/datepicker';
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

  // date range picker form
  public range = new FormGroup({
    employeeStatus: new FormControl(),
    filter: new FormControl(),
    start: new FormControl(),
    end: new FormControl()
  });
  public startDate = '';
  public endDate = '';
  public employeeStatus = false;
  public filter = '';

  private date = new Date();
  private isLastClicked: boolean;
  private startDateFilter: Date;
  private endDateFilter: Date;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['name', 'totalClockedInTime', 'totalProductiveTime',
    'totalUnProductiveTime', 'productivityRatio', 'edit'];
  public isLoading = true;

  ngOnInit() {
    this.dataSource.filterPredicate = this.getFilterPredicate();
    this._dateAdapter.setLocale('en-GB');
  }

  public finishedSelection(): void {
    this.applyFilter();
  }

  applyFilter() {
    const startDate = this.startDateCtrl.value;
    const endDate = this.endDateCtrl.value;
    const employeeStatus = this.range.get('employeeStatus').value;
    const filter = this.range.get('filter').value;

    this.startDate = (startDate === null || startDate === '') ? '' : startDate.toDateString();
    this.endDate = (endDate === null || endDate === '') ? '' : endDate.toDateString();
    this.filter = filter === null ? '' : filter;
    this.employeeStatus = employeeStatus === null ? '' : employeeStatus;

    const filterValue = this.startDate + '$' + this.endDate + '$' + this.filter + '$' + this.employeeStatus;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getFilterPredicate() {
    return (row: Employee, filters: string) => {
      const filterArray = filters.split('$');
      const startDate = new Date(filterArray[0]).getTime();
      const endDate = new Date(filterArray[1]).getTime();
      const filter = filterArray[2];
      const employeeStatus = filterArray[3];

      const matchFilter = [];

      const columnStartDate = new Date(row.createdAt).getTime();
      const columnEndDate = new Date(row.updatedAt).getTime();
      const columnName = row.name;
      const columnEmployeeStatus = `${row.status}`;

      let customFilterStartDate: boolean;
      let customFilterEndDate: boolean;
      if (startDate || endDate) {
        customFilterStartDate = columnStartDate >= startDate;
        customFilterEndDate = columnEndDate <= endDate;
      }
      const customFilterEmployeeStatus = columnEmployeeStatus.toLowerCase().includes(employeeStatus);
      const customFilterEmployeeName = columnName.toLowerCase().includes(filter);

      if (customFilterStartDate || customFilterEndDate) {
        matchFilter.push(customFilterStartDate);
        matchFilter.push(customFilterEndDate);
      }
      matchFilter.push(customFilterEmployeeStatus);
      matchFilter.push(customFilterEmployeeName);

      return matchFilter.every(Boolean);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearFilters() {
    this.range.controls.filter.setValue('');
    this.startDateCtrl.setValue('');
    this.endDateCtrl.setValue('');
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

      this.setEndDate(todayDate);
      this.setStartDate(todayDate);
      this.changeMonth();

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

      this.setStartDate(yesterdayDate)
      this.setEndDate(yesterdayDate)

      this.changeMonth();

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

      this.setStartDate(new Date(year, month, day));
      this.setEndDate(new Date());

      this.changeMonth();

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
      const curr = new Date();
      const diff = this.date.getDate() - this.date.getDay() + (this.date.getDay() === 0 ? -6 : 1);
      const startOfWeek = new Date(this.date.setDate(diff));

      const first = startOfWeek.getDate() - 7;
      const last = startOfWeek.getDate() - 1;

      const firstday = new Date(curr.setDate(first));
      const lastday = new Date(curr.setDate(last));

      this.setStartDate(firstday);
      this.setEndDate(lastday);

      this.changeMonth();

      this.startDateCtrl.setValue(firstday.toISOString());
      this.endDateCtrl.setValue(lastday.toISOString());
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

      const firstday = new Date(curr.setDate(first));
      const lastday = new Date(curr.setDate(last));

      this.setStartDate(firstday);
      this.setEndDate(lastday);
      this.changeMonth();

      this.startDateCtrl.setValue(firstday.toISOString());
      this.endDateCtrl.setValue(lastday.toISOString());
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
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

      this.setStartDate(firstDay);
      this.setEndDate(new Date());
      this.changeMonth();

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
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      this.setStartDate(firstDay);
      this.setEndDate(lastDay);

      this.changeMonth();

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

  private changeMonth(): void {
    if (this.startDateFilter.getMonth() === this.endDateFilter.getMonth() && !this.isLastClicked) { return; }
    if (this.endDateFilter.getMonth() > this.startDateFilter.getMonth()) {
      const previous = document
        .getElementsByClassName('mat-focus-indicator mat-calendar-previous-button mat-icon-button')[0] as HTMLElement;
      previous.click();
      this.isLastClicked = true;
    } else {
      const next = document
        .getElementsByClassName('mat-focus-indicator mat-calendar-next-button mat-icon-button')[0] as HTMLElement;
      next.click();
      this.isLastClicked = false;
    }
  }

  private setStartDate = (startDate: Date) => this.startDateFilter = startDate;
  private setEndDate = (endDate: Date) => this.endDateFilter = endDate;
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
