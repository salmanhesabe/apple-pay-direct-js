# Hesabe Apple Pay

A module for Apple Pay integration directly on merchant websites through the Hesabe payment gateway.

## Installation

### NPM

```bash
npm i @hesabe-pay/direct-apple-pay
```

### CDN

```html

<script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@latest/cdn/hesabe-apple-pay.min.js"></script>
```

## Usage

#### Steps

1. Request Checkout API in Hesabe (Follow the normal steps)
2. In response, you will get `token` and `data`, pass it as `token` and `requestData` respectively in the
   `HesabeApplePay` constructor.
3. Pass the Apple Pay button selector (eg: `.apple-pay-button`) `config.elements.applePayButtonQuerySelector`
4. After all the required parameters are set, call the `init()` method to initialize Apple Pay.




### CDN

```html

<head>
    <script src="https://unpkg.com/@hesabe-pay/direct-apple-pay@latest/cdn/hesabe-apple-pay.min.js"></script>
</head>
<body>
<button class="apple-pay-button" data-paymenttype="9">
    Apple Pay
</button>
</body>
<script>

    const config = {
        token: 'token',
        requestData: 'encrypted-data',
        amount: '10.00',
        availablePaymentGateways: [9],
        countryCode: 'KW',
        currencyCode: 'KWD',
        env: 'sandbox',
        debug: true,
        elements: {
            applePayButtonQuerySelector: '.apple-pay-button'
        },
        paymentAttemptedCallback: () => {
        }, // If we want to handle payment completion without redirection, for redirect no need pass this callback or keep it null
        paymentCancelledCallback: () => {
        } // Optional callback for Apple Pay cancellation
    }


    const payment = new HesabeApplePay(config);
    payment.init();
</script>
```
---

### ES Modules

#### JS Section : Initialize Hesabe Apple Pay
```javascript
import HesabeApplePay from '@hesabe-pay/direct-apple-pay';

const config = {
       token: 'token',
       requestData: 'encrypted-data',
       amount: '10.00',
       availablePaymentGateways: [9],
       countryCode: 'KW',
       env: 'sandbox',
       elements: {
           applePayButtonQuerySelector: '.apple-pay-button'
       },
       currencyCode: 'KWD',
       paymentAttemptedCallback: (result) => {}, // If we want to handle payment completion without redirection, for redirect no need pass this callback or keep it null
       paymentCancelledCallback: () => {} // Optional callback for Apple Pay cancellation
}

const payment = new HesabeApplePay(config);

// Call init when it is ready check browser compatibility and show the buttons 
payment.init();
```
#### HTML Section : Design your Apple Pay button
```html
<!--HTML Part-->
<!-- Design your apple button with attribute data-paymenttype and class -->
<body>
      <button class="apple-pay-button" data-paymenttype="9">
         Apple Pay
      </button>
</body>
```
---


## Configuration

| Option                      | Type    | Required | Description                                           |
|-----------------------------|---------|----------|-------------------------------------------------------|
| `token`                     | string  | ✓        | Authentication token                                  |
| `requestData`               | string  | ✓        | Encrypted payment data                                |
| `amount`                    | string  | ✓        | Payment amount                                        |
| `availablePaymentGateways`  | array   | ✓        | Available payment gateway IDs,[Types](#payment-types) |
| `countryCode`               | string  |          | Country code. default 'KW'                            |
| `env`                       | string  | ✓        | Environment: 'sandbox' or 'production'                |
| `currencyCode`              | string  |          | Currency code. default 'KWD'                          |
| `debug`                     | boolean |          | Enable debug logging (default: false)                 |
| `paymentAttemptedCallback`  | function|          | Optional callback function for payment completion      |
| `paymentCancelledCallback`  | function|          | Optional callback function for payment cancellation    |
| `elements`                  | object  |          | DOM element configuration for Apple Pay buttons       |

### Elements Configuration

The `elements` object configures how the library interacts with your DOM elements:

```javascript
elements: {
    applePayButtonQuerySelector: '.apple-pay-button'      // CSS selector for buttons
}
```


- `applePayButtonQuerySelector`: CSS selector to find Apple Pay buttons

### Payment Callback

You can provide an optional callback function to handle payment completion instead of browser redirection:

```javascript
paymentAttemptedCallback: (result) => {
    if (result.success) {
        // Payment was successful
        console.log('Transaction details:', result.data);
        // result.data contains the transaction enquiry response with status, amount, etc.
    } else {
        // Payment failed
        console.log('Payment error:', result.error);
    }
}
```

**Callback Response Format:**
- `success`: Boolean indicating payment transaction success/failure
- `data`: Transaction details from the enquiry API
- `error`: Error message (when any technical occurs)

**Enquiry API Response Examples:**

### `result` in `paymentAttemptedCallback`
**Successful Transaction:**
```json
{
  "status": true,
  "message": "Transaction found",
  "data": {
    "data": [
      {
        "token": "10487173933928293396853",
        "amount": "9.000",
        "reference_number": "104877892956",
        "status": "SUCCESSFUL",
        "TransactionID": "504657004599619",
        "Id": 18710759,
        "PaymentID": "102504611000169989",
        "Terminal": "530801",
        "TrackID": "18464809",
        "payment_type": "KNET",
        "service_type": "SMS Payment",
        "customerName": "",
        "customerEmail": "",
        "customerMobile": "",
        "customerCardType": "-NA-",
        "customerCard": "-NA-",
        "datetime": "2025-02-12 16:13:58"
      }
    ]
  }
}
```

**Failed Transaction:**
```json
{
  "status": true,
  "message": "Transaction found",
  "data": {
    "data": [
      {
        "token": "84221717513802249458878535138",
        "amount": "33.000",
        "reference_number": "1751380220",
        "status": "FAILED",
        "TransactionID": "27289",
        "Id": 130431,
        "PaymentID": "17",
        "Terminal": "99999999",
        "TrackID": "27289",
        "payment_type": "DEEMA",
        "service_type": "Payment Gateway",
        "customerName": null,
        "customerEmail": null,
        "customerMobile": null,
        "customerCardType": "-NA-",
        "customerCard": "-NA-",
        "datetime": "2025-07-01 17:33:25"
      }
    ]
  }
}
```

**Transaction Not Found:**
```json
{
  "status": false,
  "message": "Transaction not found",
  "data": null
}
```

**Handling Result Data:**
```javascript
paymentAttemptedCallback: (result) => {
    if (result.success) {
        // Payment was successful
        console.log('Payment successful:', result.data);
        // Access transaction details: result.data.data.data[0]
        const transaction = result.data.data.data[0];
        console.log('Transaction ID:', transaction.TransactionID);
        console.log('Amount:', transaction.amount);
        console.log('Reference Number:', transaction.reference_number);
        console.log('Payment Type:', transaction.payment_type);
        console.log('Date/Time:', transaction.datetime);
    } else {
        // Payment failed
        console.log('Payment failed:', result.data);
        // Handle failed transaction or API errors
        if (result.data && result.data.data) {
            const transaction = result.data.data.data[0];
            console.log('Failed Transaction ID:', transaction.TransactionID);
            console.log('Failed Amount:', transaction.amount);
            console.log('Failure Reason:', transaction.status);
        } else if (result.data && !result.data.status) {
            console.log('Transaction not found:', result.data.message);
        }
    }
}
```

### Payment Cancellation Callback

You can also provide an optional callback function to handle when users cancel the payment:

```javascript
paymentCancelledCallback: () => {
    console.log('User cancelled the payment');
    // Handle cancellation logic here
}
```

This callback is triggered when the user cancels the Apple Pay session before completing the payment.

**Testing Environment:**
- Make sure enviroment is set to `sandbox` for testing purposes.
- Enable debug mode by setting `debug: true` in the configuration to see detailed logs in the console.

## Before going live
- Ensure you have a valid merchant enabled "Apple Pay" payment method for live account.
- Set the `env` to `production` in the configuration.
- Set the `debug` to `false` in the configuration.
- Make sure checkout token and request data are valid for production.
- Test thoroughly in the sandbox environment before switching to production.


## Methods

- `init()` - Initialize Apple Pay

## Payment Types

- `MPGS_APPLE_PAY` (9) - MPGS Apple Pay
- `CYBERSOURCE_APPLE_PAY` (10) - CyberSource Apple Pay
- `KNET_DEBIT` (11) - KNET Debit cards
- `KNET_CREDIT` (12) - KNET Credit cards
- `KNET_INTERNATIONAL_APPLE_PAY` (13) - KNET International Apple Pay
- `AMEX_APPLE_PAY` (14) - American Express Apple Pay

## Browser Support

- Safari 11.1+
- iOS Safari 11.3+
- Other browsers with Apple Pay JS support

## License

MIT License - see LICENSE file for details.