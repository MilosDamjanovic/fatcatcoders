import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from './../../core/models/employee.model';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';

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

  constructor() { }

  private get startDateCtrl(): AbstractControl {
    return this.range.controls.start;
  }

  private get endDateCtrl(): AbstractControl {
    return this.range.controls.end;
  }
  @Output() employeeSelected = new EventEmitter<Employee>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('input', { static: true }) input: ElementRef;
  @ViewChild('picker', { static: false}) datepicker: MatDateRangePicker<Date>;

  // date range picker
  public range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  date = new Date();

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['name', 'totalClockedInTime', 'totalProductiveTime',
    'totalUnProductiveTime', 'productivityRatio', 'edit'];
   public filter: string;
   public isLoading = true;
   public employeeStatus: boolean;
  filterValues: any = {};

  public dateToPass;

  ngOnInit() {
    this.dataSource.filterPredicate = (data, filter: string) => {
      const accumulator = (currentTerm, key) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
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

  getDateFilterPredicate(filterValue: string) {
    this.dataSource.filterPredicate = (data, filter) => {
      if (this.startDateCtrl.value && this.endDateCtrl.value) {
        return data.createdAt >= this.startDateCtrl.value && data.updatedAt <= this.endDateCtrl.value;
      }
    };
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

  public opened(picker: any) {
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

  public startDateEmit(event): any {
    console.log(event.value);
  }

  public endDateEmit(event): any {
    console.log(event.value);
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

  private createTodayButton(container: HTMLDivElement): void {
    const today = document.createElement('button');
    const todayTxt = document.createTextNode('Today');
    today.onclick = () => {
      this.startDateCtrl.setValue('2020-09-12T22:00:00.000Z');
      this.endDateCtrl.setValue('2020-09-12T22:00:00.000Z');
      this.range.markAsDirty();
      // this.datepicker._goToDateInView(new Date(), 'month');
      const todayx = new Date();
      const future = new Date();
      future.setDate(todayx.getDate() + 31);
      // this.date = future;

    };
    this.styleFilterBtns(today);
    today.appendChild(todayTxt);
    container.appendChild(today);
  }

  private createYesterdayButton(container: HTMLDivElement): void {
    const yesterday = document.createElement('button');
    const yesterdayTxt = document.createTextNode('Yesterday');
    yesterday.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(yesterday);
    yesterday.appendChild(yesterdayTxt);
    container.appendChild(yesterday);
  }

  private createLast7DaysButton(container: HTMLDivElement): void {
    const last7Days = document.createElement('button');
    const last7DaysTxt = document.createTextNode('Last 7 days');
    last7Days.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(last7Days);
    last7Days.appendChild(last7DaysTxt);
    container.appendChild(last7Days);
  }

  private createLastWeekButton(container: HTMLDivElement): void {
    const lastWeek = document.createElement('button');
    const lastWeekTxt = document.createTextNode('Last Week');
    lastWeek.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(lastWeek);
    lastWeek.appendChild(lastWeekTxt);
    container.appendChild(lastWeek);
  }

  private createThisWeekButton(container: HTMLDivElement): void {
    const thisWeek = document.createElement('button');
    const thisWeekTxt = document.createTextNode('This Week');
    thisWeek.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(thisWeek);
    thisWeek.appendChild(thisWeekTxt);
    container.appendChild(thisWeek);
  }

  private createLastMonthButton(container: HTMLDivElement): void {
    const lastMonth = document.createElement('button');
    const lastMonthTxt = document.createTextNode('Last Month');
    lastMonth.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(lastMonth);
    lastMonth.appendChild(lastMonthTxt);
    container.appendChild(lastMonth);
  }

  private createThisMonth(container: HTMLDivElement): void {
    const thisMonthTxt = document.createTextNode('This Month');
    const thisMonth = document.createElement('button');
    thisMonth.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(thisMonth);
    thisMonth.appendChild(thisMonthTxt);
    container.appendChild(thisMonth);
  }

  private createCustomButton(container: HTMLDivElement): void {
    const custom = document.createElement('button');
    const customTxt = document.createTextNode('Custom');
    custom.onclick = () => {
      // start end date lol

    };
    this.styleFilterBtns(custom);
    custom.appendChild(customTxt);
    container.appendChild(custom);
  }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
