# Hesabe Apple Pay

A lightweight, modular Apple Pay integration library for the Hesabe payment gateway.

## Installation

### NPM
```bash
npm install hesabe-apple-pay
```

### CDN
```html
<script src="https://unpkg.com/hesabe-apple-pay@1.0.0/cdn/hesabe-apple-pay.min.js"></script>
```

## Usage

### ES Modules
```javascript
import HesabeApplePay from 'hesabe-apple-pay';

const payment = new HesabeApplePay({
    token: 'your-auth-token',
    requestData: 'encrypted-payment-data',
    amount: '10.00',
    availablePaymentGateways: [9, 10, 11],
    countryCode: 'KW',
    env: 'sandbox', // or 'production'
    currencyCode: 'KWD'
    // merchantCode auto-set to 'HESABE_SANDBOX_MERCHANT' for sandbox
    // sessionId automatically generated
    // debug: false by default
});

// Initialize Apple Pay
payment.init();
```

### Browser (UMD)
```html
<script src="https://unpkg.com/hesabe-apple-pay@1.0.0/cdn/hesabe-apple-pay.min.js"></script>
<script>
const payment = new HesabeApplePay({
    merchantCode: 'your-merchant-code',
    merchantIdentifier: 'merchant.com.yourcompany.app',
    // ... other config
});
</script>
```

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `token` | string | ✓ | Authentication token |
| `requestData` | string | ✓ | Encrypted payment data |
| `amount` | string | ✓ | Payment amount |
| `availablePaymentGateways` | array | ✓ | Available payment gateway IDs |
| `countryCode` | string | ✓ | Country code |
| `env` | string | ✓ | Environment: 'sandbox' or 'production' |
| `currencyCode` | string | ✓ | Currency code |
| `debug` | boolean | | Enable debug logging (default: false) |

**Auto-configured for Sandbox:**
- `merchantCode`: Auto-set to 'HESABE_SANDBOX_MERCHANT'
- `sessionId`: Auto-generated unique identifier
- `merchantIdentifier`: Auto-set to 'merchant.hesabe.dev'
- `baseUrl`: Auto-set to 'https://sandbox.hesabe.com'

**Environment Configuration:**
- `sandbox`: Uses `merchant.hesabe.dev` and `https://sandbox.hesabe.com`
- `production`: Uses `merchant.hesabe.prod` and `https://hesabe.com`

## Methods

- `init()` - Initialize Apple Pay (only public method)

## Payment Types

- `STANDARD` (9) - Standard payment
- `VISA` (10) - Visa payments
- `KNET_DEBIT` (11) - KNET Debit cards
- `KNET_CREDIT` (12) - KNET Credit cards

## Browser Support

- Safari 11.1+
- iOS Safari 11.3+
- Other browsers with Apple Pay JS support

## License

MIT License - see LICENSE file for details.