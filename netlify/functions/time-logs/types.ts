//General object type
export interface Obj<T> {
  [key: string]: T;
}

//Interface for Teamwork time API response
export interface TimeTotals {
  STATUS: string;
  'time-totals': {
    'total-mins-sum': string;
    'billed-hours-sum': string;
    'billable-mins-sum': string;
    'non-billed-mins-sum': string;
    'billable-hours-sum': string;
    'billed-mins-sum': string;
    'non-billable-hours-sum': string;
    'total-hours-sum': string;
    'non-billable-mins-sum': string;
    'non-billed-hours-sum': string;
  };
}

//Interface for Teamwork user API response
export interface TeamworkUser {
  people: people[];
}
//People object inside Teamwork user API people array
interface people {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
}
