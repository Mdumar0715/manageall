/**
 * API Client — Centralized fetch wrapper for all backend calls
 */
const API = {
  BASE: '/api',

  async get(endpoint) {
    const res = await fetch(`${this.BASE}${endpoint}`);
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },

  async post(endpoint, data) {
    const res = await fetch(`${this.BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },

  async put(endpoint, data) {
    const res = await fetch(`${this.BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch(`${this.BASE}${endpoint}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    return res.json();
  }
};
