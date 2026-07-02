const PaymentProvider = require('./PaymentProvider');

class MockProvider extends PaymentProvider {
  async initiatePayment({ payment, invoice, business, backendUrl }) {
    // Standard mock redirect parameters
    return {
      type: 'redirect',
      url: `${backendUrl}/api/payments/callback/mock?transaction_uuid=${payment.transaction_uuid}&status=completed`
    };
  }

  async verifyPayment({ payment, callbackData }) {
    const isSuccess = callbackData.status === 'completed';
    return {
      status: isSuccess ? 'completed' : 'failed',
      transactionId: callbackData.transaction_code || `mock_tx_${Date.now()}`,
      amount: payment.amount.total,
      rawResponse: callbackData
    };
  }

  async handleCallback(req) {
    const { transaction_uuid, status, transaction_code } = req.query || req.body;
    return {
      transaction_uuid,
      status: status === 'completed' ? 'completed' : 'failed',
      transactionId: transaction_code || `mock_tx_${Date.now()}`,
      callbackData: req.query || req.body
    };
  }
}

module.exports = MockProvider;
