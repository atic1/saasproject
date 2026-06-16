import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialFormState = {
  // Step 1: Identity
  name: '',
  type: 'gym',
  description: '',
  // Step 2: Contact
  ownerName: '',
  password: '',
  phone: '',
  email: '',
  address: '',
  city: 'kathmandu',
  // Step 3: Details
  panVat: '',
  registrationNumber: '',
  establishedYear: '',
  // Step 4: Features
  booking: true,
  customerPortal: true,
  posBilling: true
};

const BusinessRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        businessName: formData.name,
        businessType: formData.type,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      };

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        const firstMembership = data.memberships?.[0] || data.user?.memberships?.[0];
        if (firstMembership) {
          localStorage.setItem('businessId', firstMembership.businessId);
          localStorage.setItem('role', firstMembership.role);
        } else {
          localStorage.setItem('businessId', data.user?.id || 'demo');
          localStorage.setItem('role', 'owner');
        }
        setIsSuccess(true);
      } else {
        alert(data.message || 'Failed to register business');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto my-10 p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
        <div className="py-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-lg shadow-green-500/30 animate-bounce">
            ✓
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Registration Successful!</h2>
          <p className="text-gray-600 dark:text-gray-300">Your business "{formData.name}" has been registered successfully.</p>
          <button 
            className="mt-6 px-7 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 border-none"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 text-left relative overflow-hidden">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500"></div>

      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-purple-600 dark:from-white dark:to-purple-400">
          Register Your Business
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base">Join the Nepal Business SaaS Platform today</p>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-3 mb-8">
        {[1, 2, 3, 4].map(step => (
          <div 
            key={step} 
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentStep === step 
                ? 'bg-purple-500 scale-125 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                : currentStep > step 
                  ? 'bg-purple-300 dark:bg-purple-800' 
                  : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <div className="transition-opacity duration-500 opacity-100">
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Business Name</label>
              <input 
                type="text" 
                name="name" 
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                placeholder="e.g. Himalayan Fitness"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Business Type</label>
              <select 
                name="type" 
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="gym">Gym & Fitness</option>
                <option value="clinic">Clinic & Healthcare</option>
                <option value="salon">Salon & Spa</option>
                <option value="restaurant">Restaurant & Cafe</option>
                <option value="shop">Retail Shop</option>
                <option value="hostel">Hostel</option>
                <option value="tuition">Tuition Center</option>
                <option value="rental">Rental Service</option>
                <option value="service">Other Service</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Short Description</label>
              <textarea 
                name="description" 
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                rows="3"
                placeholder="Briefly describe your business..."
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {currentStep === 2 && (
          <div className="transition-opacity duration-500 opacity-100">
            <div className="flex flex-col md:flex-row gap-5 mb-6">
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Owner Full Name</label>
                <input 
                  type="text" 
                  name="ownerName" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="Alex Rivera"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="Minimum 8 characters"
                  minLength="8"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 mb-6">
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="e.g. 9841234567"
                  pattern="^98\d{8}$"
                  title="Must be a valid 10-digit Nepali number starting with 98"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="contact@business.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-5 mb-6">
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">City</label>
                <select 
                  name="city" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                  value={formData.city}
                  onChange={handleInputChange}
                >
                  <option value="kathmandu">Kathmandu</option>
                  <option value="pokhara">Pokhara</option>
                  <option value="lalitpur">Lalitpur</option>
                  <option value="bhaktapur">Bhaktapur</option>
                  <option value="biratnagar">Biratnagar</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Specific Address</label>
                <input 
                  type="text" 
                  name="address" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="e.g. Thamel, Ward 26"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="transition-opacity duration-500 opacity-100">
            <div className="flex flex-col md:flex-row gap-5 mb-6">
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">PAN / VAT Number</label>
                <input 
                  type="text" 
                  name="panVat" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="e.g. 123456789"
                  value={formData.panVat}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Registration Number</label>
                <input 
                  type="text" 
                  name="registrationNumber" 
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                  placeholder="Company Reg No."
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm">Established Year (BS or AD)</label>
              <input 
                type="number" 
                name="establishedYear" 
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20" 
                placeholder="e.g. 2075"
                value={formData.establishedYear}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        {/* Step 4: Features */}
        {currentStep === 4 && (
          <div className="transition-opacity duration-500 opacity-100">
            <h3 className="mb-4 text-gray-800 dark:text-gray-200 text-lg font-semibold text-left">Select Modules Needed</h3>
            
            <label className="flex items-center gap-3 mb-4 cursor-pointer text-left">
              <input 
                type="checkbox" 
                name="booking"
                className="w-5 h-5 accent-purple-500 cursor-pointer rounded"
                checked={formData.booking}
                onChange={handleInputChange}
              />
              <span className="text-gray-800 dark:text-gray-200 text-[15px]">Appointment & Booking System</span>
            </label>
            
            <label className="flex items-center gap-3 mb-4 cursor-pointer text-left">
              <input 
                type="checkbox" 
                name="customerPortal"
                className="w-5 h-5 accent-purple-500 cursor-pointer rounded"
                checked={formData.customerPortal}
                onChange={handleInputChange}
              />
              <span className="text-gray-800 dark:text-gray-200 text-[15px]">Customer Self-Service Portal</span>
            </label>

            <label className="flex items-center gap-3 mb-4 cursor-pointer text-left">
              <input 
                type="checkbox" 
                name="posBilling"
                className="w-5 h-5 accent-purple-500 cursor-pointer rounded"
                checked={formData.posBilling}
                onChange={handleInputChange}
              />
              <span className="text-gray-800 dark:text-gray-200 text-[15px]">POS & Digital Billing</span>
            </label>
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 1 ? (
            <button 
              type="button" 
              className="px-7 py-3 rounded-xl font-semibold text-base cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700" 
              onClick={handlePrev}
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <button 
            type="submit" 
            className="px-7 py-3 rounded-xl font-semibold text-base cursor-pointer transition-all duration-300 border-none bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (currentStep === 4 ? 'Complete Registration' : 'Continue')}
          </button>
        </div>

      </form>
    </div>
    </div>
  );
};

export default BusinessRegistration;
