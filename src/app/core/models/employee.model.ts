export interface Employee {
  name: string;
  status: boolean;
  id: number;
  updatedAt: string;
  createdAt: string;
  workDays?: EmployeeWorkSummary[];
  aggregateWorkDays?: EmployeeWorkSummary;
}

export interface EmployeeSummary {
  name: string;
  status: boolean;
  id: number;
  updatedAt: string;
  createdAt: string;
  workDays?: EmployeeWorkSummary;
}
export interface EmployeeWorkSummary {
  totalClockedInTime: number;
  totalProductiveTime: number;
  totalUnProductiveTime: number;
  neutralTime?: number;
  productivityRatio?: number;
  clockInTime: string;
  clockOutTime: string;
  createdAt: string;
  id?: number;
  employeeID: number; // link to the Employee
}

export interface EmployeeGeneralSummary {
  totalWorkSummary: TotalWorkSummary;
  totalNumberOfEmployees: number;
}

interface TotalWorkSummary {
  totalClockedInTime: number;
  totalProductiveTime: number;
  totalUnProductiveTime: number;
}
