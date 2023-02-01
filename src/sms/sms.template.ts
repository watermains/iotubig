import * as moment from 'moment';

export const reloadAlertTemplate = ({
  meterName,
  user,
  amount,
}) => `Water Meter (${meterName}) Reload \n
Hi ${user},\n
Your water meter has been credited with ${amount} as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Note: Load application to the meter is not in real time. Please check your IoTubig account in the next 12-24 hours for your updated balance.\n
For other concerns, please contact your Building Administrator.
`;

export const reloadDeductionTemplate = ({
  meterName,
  user,
  amount,
}) => `Water Meter (${meterName}) Deduction \n
Hi ${user},\n
Your water meter has been deducted with ${amount} as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}. This is due to your monthly consumption wasn't able to reach the minimum amount set by the building Administrator.\n
Note: Load application to the meter is not in real time. Please check your IoTubig account in the next 12-24 hours for your updated balance.\n
For other concerns, please contact your Building Administrator.
`;

export const reloadPendingTemplate = ({
  meterName,
  user,
  amount,
  paymentCode
}) => `Water Meter (${meterName}) Reload Pending \n
Hi ${user},\n
Your reload request with an amount of Php ${amount} is currently PENDING and waiting for successful payment through its merchant.\n
Kindly visit and pay your transaction to the merchant's premises and use the given PAYMENT CODE. \n\n
PAYMENT CODE: ${paymentCode}\n\n
Note: Load application to the meter is not in real time. Please check your IoTubig account in the next 12-24 hours for your updated balance.\n
For other concerns, please contact your Building Administrator.
`;

export const meterStatusAlert = ({
  meterName,
  status,
  user,
}) => `Water Meter (${meterName}) ${status === 'opened' ? 'Opened' : 'Closed'}\n
Hi ${user},\n

Your water meter has been ${status} as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n

For other concerns, please contact your Building Administrator.
`;

export const lowBalanceAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is Low Balance (${balance} Php) as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please reload immediately.`;

export const belowZeroBalanceAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is Below Zero Balance (${balance} Php) as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please reload immediately.\n
Warning: If your meter closes even after reloading, your meter will open in the next 12-24 hours.
`;

export const overdrawnLimitAlert = ({
  meterName,
  user,
  balance,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is near the Overdrawn Water Limit as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Meter will be closed. Please pay at least (${balance} Php) immediately for your meter to open.\n
Warning: If your meter closes even after reloading, your meter will open in the next 12-24 hours.
`;

export const lowBatteryAlert = ({
  meterName,
  user,
  batteryLevel,
}) => `Water Meter (${meterName}) Alert\n
Hi ${user},\n

Your water meter is WEAK (Low Battery ${batteryLevel}%) as of ${moment().tz('Asia/Manila').format(
  'MMMM Do YYYY, h:mm:ss a',
)}.\n
Please contact your Building Administrator immediately to change your battery  or it will close soon.`;
