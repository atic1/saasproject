// Decode JWT payload without verifying signature
// Verification always happens on the server
export const decodeToken = (token) => {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return Date.now() >= payload.exp * 1000;
};

export const getTokenRole = (token) => {
  const payload = decodeToken(token);
  return payload?.platformrole || null;
};