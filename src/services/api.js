import { Platform } from 'react-native';

// In web, localhost connects directly. On Android emulator, use 10.0.2.2.
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PORT = '5001';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_HOST}:${PORT}/api`;
export const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL || `ws://${DEFAULT_HOST}:${PORT}/ws`;

let socket = null;
const eventListeners = new Set();
let isConnected = false;

// Connect to Backend WebSocket
export function initWebSocket(onEvent) {
  if (onEvent) {
    eventListeners.add(onEvent);
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(WS_BASE_URL);

    socket.onopen = () => {
      console.log('[GatePass Client] WebSocket connected to', WS_BASE_URL);
      isConnected = true;
    };

    socket.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        eventListeners.forEach((listener) => {
          try {
            listener(payload);
          } catch (err) {
            console.error('[GatePass Client] Listener error:', err);
          }
        });
      } catch (parseErr) {
        console.error('[GatePass Client] Message parse error:', parseErr);
      }
    };

    socket.onclose = () => {
      console.log('[GatePass Client] WebSocket disconnected. Retrying in 5s...');
      isConnected = false;
      setTimeout(() => initWebSocket(), 5000);
    };

    socket.onerror = (err) => {
      console.log('[GatePass Client] WebSocket offline or unreachable.');
    };
  } catch (err) {
    console.log('[GatePass Client] Failed to create WebSocket connection.');
  }
}

export function removeEventListener(listener) {
  eventListeners.delete(listener);
}

// REST API Helpers with seamless fallback
async function apiRequest(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[GatePass API] ${path} call failed:`, err.message);
    throw err;
  }
}

// 1. Fetch initial live data from backend
export async function apiLogin(credentials) {
  return await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function apiGetDemoUsers() {
  return await apiRequest('/auth/demo-users').catch(() => null);
}

export async function fetchInitialData() {
  const [requests, activity, activeVisitors, staff, amenities, maintenance] = await Promise.all([
    apiRequest('/requests').catch(() => null),
    apiRequest('/activity').catch(() => null),
    apiRequest('/visitors/active').catch(() => null),
    apiRequest('/staff').catch(() => null),
    apiRequest('/amenities').catch(() => null),
    apiRequest('/maintenance').catch(() => null),
  ]);

  return {
    requests,
    activity,
    activeVisitors,
    staff,
    amenities,
    maintenance,
  };
}

// 2. Guard sends visitor approval request to resident
export async function apiLogVisitorEntry(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/visitors/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function apiCreateVisitorRequest(data) {
  return await apiRequest('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 3. Resident approves visitor
export async function apiApproveRequest(id, leaveAtGate = false) {
  return await apiRequest(`/requests/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ leaveAtGate }),
  });
}

// 4. Resident denies visitor
export async function apiDenyRequest(id) {
  return await apiRequest(`/requests/${id}/deny`, {
    method: 'PUT',
  });
}

// 5. Resident creates pre-approved pass
export async function apiCreatePass(passData) {
  return await apiRequest('/passes', {
    method: 'POST',
    body: JSON.stringify(passData),
  });
}

// 6. Guard verifies passcode
export async function apiVerifyPasscode(code) {
  return await apiRequest('/passes/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// 7. Guard checks out visitor
export async function apiCheckOutVisitor(id) {
  return await apiRequest(`/visitors/${id}/checkout`, {
    method: 'PUT',
  });
}

// 8. Resident pays maintenance
export async function apiPayMaintenance() {
  return await apiRequest('/maintenance/pay', {
    method: 'POST',
  });
}

// 9. Emergency SOS
export async function apiTriggerSOS(type, location = 'Estate Management Office') {
  return await apiRequest('/sos', {
    method: 'POST',
    body: JSON.stringify({ type, flat: location }),
  });
}

// 10. Admin Overview & Society Directory
export async function apiGetAdminOverview() {
  return await apiRequest('/admin/overview');
}

// 11. Society Helpdesk Tickets
export async function apiGetHelpdeskTickets(flat = null) {
  const query = flat ? `?flat=${encodeURIComponent(flat)}` : '';
  return await apiRequest(`/helpdesk${query}`);
}

// 12. Society Admin: Onboard New Resident Owner & Unit
export async function apiOnboardResident(data) {
  return await apiRequest('/admin/residents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 13. Society Admin: Update Resident Details
export async function apiUpdateResident(id, data) {
  return await apiRequest(`/admin/residents/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// 14. Society Admin: Delete / Offboard Resident
export async function apiDeleteResident(id) {
  return await apiRequest(`/admin/residents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
