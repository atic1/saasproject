const MockProvider = require('./MockProvider');

class KhaltiProvider extends MockProvider {
  async initiatePayment({ payment, invoice, business, backendUrl }) {
    return {
      type: 'redirect',
      url: `${backendUrl}/api/payments/callback/mock?transaction_uuid=${payment.transaction_uuid}&status=completed&provider=khalti`
    };
  }
}

module.exports = KhaltiProvider;
