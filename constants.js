
// These next sets are temporary Select list options for LoanPolicyDetail.js
// The idea is to eventually replace them with small, controlled vocabularies
// on the server side.
export const loanProfileTypes = [
  { label: 'Fixed', id: 1, value: 1 },
  { label: 'Rolling', id: 2, value: 2 },
  { label: 'Indefinite', id: 3, value: 3 },
];

export const intervalPeriods = [
  { label: 'Minutes', id: 1, value: 'Minutes' },
  { label: 'Hours', id: 2, value: 'Hours' },
  { label: 'Days', id: 3, value: 'Days' },
  { label: 'Weeks', id: 4, value: 'Weeks' },
  { label: 'Months', id: 5, value: 'Months' },
];

export const intervalIdsMap = {
  MINUTES: 'Minutes',
  HOURS: 'Hours',
  DAYS: 'Days',
  WEEKS: 'Weeks',
  MONTHS: 'Months',
};

export const dueDateManagementOptions = [
  { label: 'Keep the current due date', id: 1, value: 1 },
  { label: 'Move to the end of the previous open day', id: 2, value: 2 },
  { label: 'Move to the beginning of the next open day', id: 3, value: 3 },
  { label: 'Move to the end of the next open day', id: 4, value: 4 },
];

export const renewFromOptions = [
  { label: 'Current due date', id: 1, value: 1 },
  { label: 'System date', id: 2, value: 2 },
];

export const patronIdentifierTypes = [
  { key: 'BARCODE', label: 'Barcode', queryKey: 'barcode' },
  { key: 'EXTERNAL', label: 'External system id', queryKey: 'externalSystemId' },
  { key: 'FOLIO', label: 'FOLIO record number', queryKey: 'id' },
  { key: 'USER', label: 'Username', queryKey: 'username' },
];

export default '';
