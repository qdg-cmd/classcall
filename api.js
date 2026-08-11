export const GAS_URL = "https://script.google.com/macros/s/AKfycbzxP8F1WgNj4ersvQNgWfO2hHzYMIbGw3bjOZu86DBSZprN95lYX2bd4-5EFpiMsfY6ng/exec";

export async function fetchInitData() {
  if (GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
    console.warn("GAS_URL is not set. Using mock data.");
    return {
      schoolName: "광평중학교",
      notice: "금일 하교 시간은 15:30분입니다.",
      classMemo: "수학 수행평가 안내",
      autoDismiss: 30,
      teachers: [
        { name: "홍길동", location: "본교무실" },
        { name: "이순신", location: "학년교무실" }
      ],
      studentsData: {
        classList: [
          { grade: "1", classNum: "1" },
          { grade: "1", classNum: "2" }
        ],
        students: [
          { grade: "1", classNum: "1", num: "1", name: "김학생" },
          { grade: "1", classNum: "1", num: "2", name: "이학생" },
          { grade: "1", classNum: "2", num: "1", name: "박학생" }
        ]
      },
      periodConfig: {
        start: "08:50",
        periodLen: 45,
        breakLen: 10,
        lunchAfter: 4,
        lunchLen: 50,
        maxPeriod: 7
      },
      agenda: []
    };
  }
  
  const res = await fetch(`${GAS_URL}?api=init`);
  return await res.json();
}

export async function fetchCalls() {
  if (GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) return [];
  const res = await fetch(`${GAS_URL}?api=calls`);
  return await res.json();
}

export async function fetchMeals() {
  if (GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) return [];
  const res = await fetch(`${GAS_URL}?api=meal`);
  return await res.json();
}

export async function submitCall(callData) {
  if (GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
    console.log("Mock Call Submitted:", callData);
    return { ok: true };
  }
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({ action: "call", ...callData })
  });
  return await res.json();
}

export async function confirmCall(row) {
  if (GAS_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) return { ok: true };
  const res = await fetch(`${GAS_URL}?api=confirm&row=${row}`);
  return await res.json();
}
