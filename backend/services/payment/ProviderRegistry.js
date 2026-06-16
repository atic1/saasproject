const EsewaProvider = require('./EsewaProvider');
const KhaltiProvider = require('./KhaltiProvider');
const MockProvider = require('./MockProvider');

class ProviderRegistry {
  constructor() {
    this.providers = {};
    // Register default payment gateway providers
    this.register('esewa', new EsewaProvider());
    this.register('khalti', new KhaltiProvider());
    this.register('mock', new MockProvider());
  }

  register(name, providerInstance) {
    this.providers[name.toLowerCase()] = providerInstance;
  }

  resolve(name) {
    if (!name) return this.providers['mock'];
    const resolved = this.providers[name.toLowerCase()];
    if (!resolved) {
      console.warn(`Payment provider '${name}' not registered. Falling back to MockProvider.`);
      return this.providers['mock'];
    }
    return resolved;
  }
}

module.exports = new ProviderRegistry();
