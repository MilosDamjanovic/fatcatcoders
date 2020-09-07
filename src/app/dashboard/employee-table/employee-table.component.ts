import { MatTableDataSource } from '@angular/material/table';
import { Employee } from './../../core/models/employee.model';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

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
  @Output() employeeSelected = new EventEmitter<Employee>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('input', { static: true }) input: ElementRef;

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = ['name', 'totalClockedInTime', 'totalProductiveTime',
    'totalUnProductiveTime', 'productivityRatio', 'edit'];
   public filter: string;
   public isLoading = true;
   public employeeStatus: boolean;
  filterValues: any = {};

  constructor() { }

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
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
