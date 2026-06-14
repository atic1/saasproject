const MockProvider = require('./MockProvider');

class KhaltiProvider extends MockProvider {
  async initiatePayment({ payment }) {
    return {
      type: 'redirect',
      url: `http://localhost:5000/api/payments/callback/mock?transaction_uuid=${payment.transaction_uuid}&status=completed&provider=khalti`
    };
  }
}

module.exports = KhaltiProvider;
