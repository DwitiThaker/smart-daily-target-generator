const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function buildUrl(base, path) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function request(url, options = {}) {
  const res = await fetch(buildUrl(API, url), {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

// ✅ EXPORT EACH FUNCTION

export async function getStudent(studentId) {
  return request(`/students/${studentId}`);
}

export async function createStudent(data) {
  return request("/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudent(studentId, data) {
  return request(`/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function createAttempt(data) {
  return request("/attempts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWeakTopics(studentId) {
  return request(`/students/${studentId}/weak-topics`);
}

export async function generatePlan(studentId, hours) {
  return request("/generate-daily-plan", {
    method: "POST",
    body: JSON.stringify({
      student_id: studentId,
      study_hours_override: hours,
    }),
  });
}