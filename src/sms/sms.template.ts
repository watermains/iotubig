import * as moment from 'moment';

export const reloadAlertTemplate = ({
  meterName,
  user,
  amount,
}) => `Water Meter (${meterName}) Reload \n
Hi ${user},\n
Your water meter has been credited with Php ${amount} as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Note: Credit application to the meter is not in real time. Please check your IoTubig account in the next three hours for your updated balance.\n\n
For other concerns, please contact your Administrator.`;

export const meterStatusAlert = ({
  meterName,
  status,
  user,
}) => `Water Meter (${meterName}) ${status === 'opened' ? 'Opened' : 'Closed'}\n
Hi ${user},\n

Your water meter has been ${status} as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n

For other concerns, please contact your Administrator.
`;

export const lowBalanceAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is Low Balance (${balance} Php) as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please reload immediately.`;

export const belowZeroBalanceAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is Below Zero Balance (${balance} Php) as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please reload immediately.`;

export const overdrawnLimitAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is near the Overdrawn Water Limit as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Meter will be closed. Please pay your balance (${balance} Php) immediately.`;

export const lowBatteryAlert = ({
  meterName,
  user,
  batteryLevel,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter has a Low Battery status (${batteryLevel}%) as of ${moment().format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please contact your Building Administrator immediately to change your battery.`;
