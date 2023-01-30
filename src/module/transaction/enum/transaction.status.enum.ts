export enum TransactionStatus {
  succeeded = 'SUCCEEDED',
  pending = 'PENDING',
  failed = 'FAILED',
  voided = 'VOIDED',
  refunded = 'REFUNDED',
}

export enum TransactionPaymentCodes {
  GCash = 'PH_GCASH',
  Maya = 'PH_PAYMAYA',
  ShopeePay = 'PH_SHOPEEPAY',
  GrabPay = 'PH_GRABPAY',
  Cebuana = 'CEBUANA',
  "7Eleven" = '7ELEVEN',
}
