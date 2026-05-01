const BASE = "/api/admin";

function getToken(): string | null {
  return localStorage.getItem("abhaya-admin-token");
}

export function saveToken(token: string) {
  localStorage.setItem("abhaya-admin-token", token);
}

export function clearToken() {
  localStorage.removeItem("abhaya-admin-token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-admin-token": token } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminLogin(password: string): Promise<string> {
  const data = await fetch(`${BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!data.ok) throw new Error("Invalid password");
  const json = await data.json();
  return json.token;
}

export async function patchOrganization(id: number, body: Record<string, unknown>) {
  return adminFetch(`/organizations/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteOrganization(id: number) {
  return adminFetch(`/organizations/${id}`, { method: "DELETE" });
}

export async function patchDonation(id: number, status: string) {
  return adminFetch(`/donations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function deleteDonation(id: number) {
  return adminFetch(`/donations/${id}`, { method: "DELETE" });
}

export async function patchHelpRequest(id: number, status: string) {
  return adminFetch(`/help-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export async function deleteHelpRequest(id: number) {
  return adminFetch(`/help-requests/${id}`, { method: "DELETE" });
}

export async function patchDisasterRelief(id: number, body: Record<string, unknown>) {
  return adminFetch(`/disaster-relief/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteDocument(id: number) {
  return adminFetch(`/documents/${id}`, { method: "DELETE" });
}
