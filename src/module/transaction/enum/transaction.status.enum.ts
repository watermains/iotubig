export enum TransactionStatus {
  succeeded = 'SUCCEEDED',
  pending = 'PENDING',
  failed = 'FAILED',
  voided = 'VOIDED',
  refunded = 'REFUNDED',
}

export enum TransactionPaymentOptions {
  GCash = 'PH_GCASH',
  Maya = 'PH_PAYMAYA',
  ShopeePay = 'PH_SHOPEEPAY',
  GrabPay = 'PH_GRABPAY',
}
