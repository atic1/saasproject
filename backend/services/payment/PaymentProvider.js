class PaymentProvider {
  /**
   * Initiate payment and return checkout payload/form
   * @param {Object} params
   * @param {Object} params.payment - The Payment document
   * @param {Object} params.invoice - The Invoice document
   * @param {Object} params.business - The Business document
   * @returns {Promise<Object>} Checkout instructions (URLs, form parameters, etc.)
   */
  async initiatePayment({ payment, invoice, business }) {
    throw new Error('initiatePayment() must be implemented');
  }

  /**
   * Verify payment with the gateway
   * @param {Object} params
   * @param {Object} params.payment - The Payment document
   * @param {Object} params.callbackData - Incoming query/body parameters
   * @returns {Promise<Object>} Standardized status verification result
   */
  async verifyPayment({ payment, callbackData }) {
    throw new Error('verifyPayment() must be implemented');
  }

  /**
   * Handle incoming gateway webhook/callback redirect params
   * @param {Object} req - Express Request object
   * @returns {Promise<Object>} Standardized callback output
   */
  async handleCallback(req) {
    throw new Error('handleCallback() must be implemented');
  }
}

module.exports = PaymentProvider;
