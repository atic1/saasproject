export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  // Nepal phone numbers: 10 digits starting with 98 or 97
  return /^(98|97)\d{8}$/.test(phone);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

export const isValidSlug = (slug) => {
  return /^[a-z0-9-]+$/.test(slug);
};

export const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  return errors;
};

export const validateRegisterForm = ({ name, email, password, businessName, businessType }) => {
  const errors = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Invalid email address';
  if (!password) errors.password = 'Password is required';
  else if (!isValidPassword(password)) errors.password = 'Password must be at least 8 characters';
  if (!businessName) errors.businessName = 'Business name is required';
  if (!businessType) errors.businessType = 'Business type is required';
  return errors;
};