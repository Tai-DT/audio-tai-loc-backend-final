# Payment Gateway Integration Guide

## Current Payment System Overview

### Implemented Features

1. **PayOS Integration**
   - Currently integrated with PayOS (Vietnamese payment gateway)
   - Supports sandbox and production environments
   - Handles payment link creation, webhooks, and refunds

2. **Payment Flow**
   ```
   User → Create Order → Request Payment → PayOS API → Return Payment Link
                                                     ↓
   User → Complete Payment → PayOS Webhook → Update Order/Payment Status
   ```

3. **Key Components**
   - `PaymentsService`: Core payment logic
   - `PaymentsController`: API endpoints
   - `PayOSService`: PayOS-specific implementation
   - `MockPayOSService`: Mock service for testing

4. **Database Schema**
   - `payments` table: Stores payment records
   - `orders` table: Links to payments via `orderId`

### Current API Endpoints

1. **POST /payments/payos/:orderId**
   - Creates PayOS payment link for an order
   - Returns checkout URL, QR code, and payment details

2. **POST /payments/payos/webhook**
   - Receives payment status updates from PayOS
   - Verifies webhook signature and updates order status

3. **GET /payments/order/:orderId/status**
   - Retrieves payment status for an order

4. **POST /payments/:paymentId/refund**
   - Processes refunds (Admin only)

## Integration Plan for VNPay/MoMo/ZaloPay

### 1. VNPay Integration

#### Setup Requirements
- Merchant account registration at https://sandbox.vnpayment.vn
- Required credentials:
  - `vnp_TmnCode`: Terminal/Merchant code
  - `vnp_HashSecret`: Secure hash secret
  - `vnp_Url`: Payment gateway URL

#### Environment Variables
```env
# VNPay Configuration
VNPAY_TMN_CODE=your-merchant-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payments/vnpay/return
VNPAY_IPN_URL=http://localhost:3001/payments/vnpay/ipn
```

#### Implementation Plan
1. Create `VNPayService` in `src/payments/vnpay.service.ts`
2. Implement payment creation with VNPay's required parameters
3. Create IPN handler for instant payment notifications
4. Add signature verification using SHA256

### 2. MoMo Integration

#### Setup Requirements
- Partner account at https://business.momo.vn
- Required credentials:
  - `partnerCode`: Partner identification
  - `accessKey`: API access key
  - `secretKey`: For signature generation

#### Environment Variables
```env
# MoMo Configuration
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_ENDPOINT=https://test-payment.momo.vn
MOMO_RETURN_URL=http://localhost:3001/payments/momo/return
MOMO_NOTIFY_URL=http://localhost:3001/payments/momo/ipn
```

#### Implementation Plan
1. Create `MoMoService` in `src/payments/momo.service.ts`
2. Implement QR code and app-to-app payment methods
3. Handle IPN with HMAC SHA256 signature
4. Support both one-time and recurring payments

### 3. ZaloPay Integration

#### Setup Requirements
- Merchant registration at https://docs.zalopay.vn/v2
- Required credentials:
  - `appId`: Application ID
  - `key1`, `key2`: Keys for signature generation
  - `endpoint`: API endpoint URL

#### Environment Variables
```env
# ZaloPay Configuration
ZALOPAY_APP_ID=your-app-id
ZALOPAY_KEY1=your-key1
ZALOPAY_KEY2=your-key2
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2
ZALOPAY_CALLBACK_URL=http://localhost:3001/payments/zalopay/callback
```

#### Implementation Plan
1. Create `ZaloPayService` in `src/payments/zalopay.service.ts`
2. Implement order creation with embedded data
3. Handle callback with MAC verification
4. Support mini-app integration

## Common Integration Components

### 1. Payment Gateway Factory
```typescript
// src/payments/payment-gateway.factory.ts
@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private payosService: PayOSService,
    private vnpayService: VNPayService,
    private momoService: MoMoService,
    private zalopayService: ZaloPayService,
  ) {}

  getGateway(method: PaymentMethod): IPaymentGateway {
    switch (method) {
      case PaymentMethod.PAYOS:
        return this.payosService;
      case PaymentMethod.VNPAY:
        return this.vnpayService;
      case PaymentMethod.MOMO:
        return this.momoService;
      case PaymentMethod.ZALOPAY:
        return this.zalopayService;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}
```

### 2. Payment Interface
```typescript
// src/payments/interfaces/payment-gateway.interface.ts
export interface IPaymentGateway {
  createPayment(orderId: number): Promise<PaymentResponse>;
  verifyWebhook(data: any, signature: string): boolean;
  handleWebhook(data: any): Promise<void>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  refundPayment(paymentId: number, amount?: number): Promise<void>;
}
```

### 3. Webhook Security
- Implement IP whitelisting for production
- Add request timestamp validation
- Store webhook events for debugging
- Implement idempotency for webhook processing

### 4. Error Handling
```typescript
// src/payments/exceptions/payment.exception.ts
export class PaymentException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    public readonly gateway: string,
    public readonly errorCode?: string,
  ) {
    super({ message, gateway, errorCode }, statusCode);
  }
}
```

## Testing Strategy

### 1. Unit Tests
- Mock external API calls
- Test signature generation/verification
- Test error scenarios

### 2. Integration Tests
- Use sandbox environments
- Test complete payment flows
- Verify webhook handling

### 3. E2E Tests
```typescript
// test/payments.e2e-spec.ts
describe('Payment Gateways E2E', () => {
  it('should create VNPay payment', async () => {
    // Create order
    // Request payment
    // Verify redirect URL
    // Simulate callback
    // Check order status
  });
});
```

## Security Considerations

1. **Signature Verification**
   - Always verify webhook signatures
   - Use time-based validation
   - Log failed verification attempts

2. **Data Encryption**
   - Encrypt sensitive payment data
   - Use HTTPS for all callbacks
   - Implement request replay protection

3. **Error Handling**
   - Don't expose internal errors
   - Log detailed errors internally
   - Return generic error messages to clients

## Monitoring and Logging

1. **Payment Metrics**
   - Success/failure rates per gateway
   - Average processing time
   - Gateway availability

2. **Alerts**
   - Failed payment threshold
   - Gateway timeout alerts
   - Signature verification failures

3. **Audit Trail**
   - Log all payment requests
   - Store gateway responses
   - Track status changes

## Implementation Timeline

### Week 1: VNPay Integration
- [ ] Register sandbox account
- [ ] Implement VNPayService
- [ ] Create endpoints
- [ ] Add unit tests
- [ ] Test with sandbox

### Week 2: MoMo Integration
- [ ] Setup partner account
- [ ] Implement MoMoService
- [ ] Add QR code support
- [ ] Implement IPN handler
- [ ] Integration testing

### Week 3: ZaloPay Integration
- [ ] Register merchant account
- [ ] Implement ZaloPayService
- [ ] Add callback handler
- [ ] Mini-app integration
- [ ] E2E testing

### Week 4: Production Deployment
- [ ] Production credentials
- [ ] Security audit
- [ ] Load testing
- [ ] Monitoring setup
- [ ] Go-live
