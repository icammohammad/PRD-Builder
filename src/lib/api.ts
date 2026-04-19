export const api = {
  get: async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return response.json();
  },
  post: async (url: string, data: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return response.json();
  },
  patch: async (url: string, data: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return response.json();
  },
  delete: async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return response.json();
  },
};
