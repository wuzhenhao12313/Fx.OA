import moment from 'moment';

export function diffMonths(startDate, endDate) {
  let CurrentMonth = moment(startDate).startOf('month');
  let Months = [];
  while (CurrentMonth <= moment(endDate)) {
    Months.push(CurrentMonth.clone());
    CurrentMonth = CurrentMonth.add(1, 'months');
  }
  return Months;
}
