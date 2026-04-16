// Prisma Client Service
export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'member';
  name: string;
  prdGeneratedCount: number;
}

export interface Package {
  id: string;
  name: string;
  limit: number;
  price: number;
  description?: string;
}

export interface SystemConfig {
  geminiApiKey: string;
  landingPageTitle: string;
  landingPageHero: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const registerUser = async (email: string, password: string, name: string) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Server returned an invalid response. Please try again.");
  }

  if (!res.ok) throw new Error(data.error || "Registration failed");
  localStorage.setItem('token', data.token);
  return data.user;
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("Server returned an invalid response. Please try again.");
  }

  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem('token', data.token);
  return data.user;
};

export const logoutUser = async () => {
  localStorage.removeItem('token');
};

export const getMe = async () => {
  const res = await fetch('/api/auth/me', { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user");
  return await res.json();
};

export const getAllUsers = async () => {
  const res = await fetch('/api/admin/users', { headers: getHeaders() });
  return await res.json();
};

export const getAllPackages = async () => {
  const res = await fetch('/api/admin/packages', { headers: getHeaders() });
  return await res.json();
};

export const createPackage = async (data: any) => {
  const res = await fetch('/api/admin/packages', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const updatePackage = async (id: string, data: any) => {
  const res = await fetch(`/api/admin/packages/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const getSystemConfig = async () => {
  const res = await fetch('/api/admin/config', { headers: getHeaders() });
  return await res.json();
};

export const updateSystemConfig = async (data: any) => {
  const res = await fetch('/api/admin/config', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const savePrdToBackend = async (prd: string, title: string) => {
  const res = await fetch('/api/prds', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ prd, title })
  });
  return await res.json();
};

export const getPrdHistory = async () => {
  const res = await fetch('/api/prds', { headers: getHeaders() });
  return await res.json();
};
