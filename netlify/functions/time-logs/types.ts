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

export interface TeamworkUser {
  people: people[];
}

interface people {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
}
