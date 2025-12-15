// -------------------------
// School holidays & special days
// -------------------------
const schoolHolidays = [];

// Add all holiday dates from 20 Dec 2025 to 4 Jan 2026
let startHoliday = new Date("2025-12-20");
let endHoliday = new Date("2026-01-04");
for (let d = new Date(startHoliday); d <= endHoliday; d.setDate(d.getDate() + 1)) {
  schoolHolidays.push(formatDateYYYYMMDD(d));
}

// Add Inset Day: 5 Jan 2026
const insetDays = [
  { date: "2026-01-05", title: "Inset Day", classes: ["Nursery","Reception","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"], action: "No pupils", deadline: "2026-01-05 00:00", important: true }
];

// -------------------------
// Dummy events
// -------------------------
const allEvents = [
  {
    title: "Outdoor Learning",
    date: "2025-12-17", // first Wednesday
    repeat: "weekly",
    classes: ["Nursery"],
    action: "Send kids in with waterproofs/change of clothes",
    deadline: "2025-12-17 09:00",
    important: false
  },
  {
    title: "Christmas Show 10-11am",
    date: "2025-12-11",
    classes: ["Nursery"],
    action: "Arrive by 9:45am",
    deadline: "2025-12-11 09:45",
    important: true
  },
  {
    title: "Infants Disco 2-3pm",
    date: "2025-12-18",
    classes: ["Nursery","Reception","Year 1","Year 2"],
    action: "Purchase tickets through the Ffrindiau'r Ffin shop ffrindiaurffin.sumupstore.com",
    deadline: "2025-12-18 23:59",
    important: true
  },
  {
    title: "Juniors Disco 3:15-4:15pm",
    date: "2025-12-18",
    classes: ["Year 3","Year 4","Year 5","Year 6"],
    action: "Purchase tickets through the Ffrindiau'r Ffin shop ffrindiaurffin.sumupstore.com",
    deadline: "2025-12-14 23:59",
    important: true
  },
  {
    title: "Deadline for purchasing disco tickets",
    date: "2025-12-14",
    classes: ["Nursery","Reception","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6"],
    action: "Purchase tickets through the Ffrindiau'r Ffin shop ffrindiaurffin.sumupstore.com",
    deadline: "2025-12-14 23:59",
    important: true
  }
];

// Merge inset days into events
allEvents.push(...insetDays);

let calendar;

document.addEventListener("DOMContentLoaded", function() {
  const calendarEl = document.getElementById("calendar");

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    events: generateCalendarEvents(allEvents)
  });
  calendar.render();

  applyFilters();

  document.querySelectorAll(".filters input").forEach(cb => {
    cb.addEventListener("change", applyFilters);
  });

  document.getElementById("subscribeCalendar").href = "#"; // placeholder
});

// -------------------------
// Generate calendar events
// -------------------------
function generateCalendarEvents(events) {
  let calEvents = [];
  events.forEach(ev => {
    if (ev.repeat === "weekly") {
      let d = new Date(ev.date);
      for (let i = 0; i < 4; i++) {
        const formatted = formatDateYYYYMMDD(d);
        if (!schoolHolidays.includes(formatted)) { // skip holidays
          calEvents.push({ title: ev.title, date: formatted });
        }
        d.setDate(d.getDate() + 7);
      }
    } else {
      if (!schoolHolidays.includes(ev.date)) {
        calEvents.push({ title: ev.title, date: ev.date });
      }
    }
  });
  return calEvents;
}

// -------------------------
// Apply class filters
// -------------------------
function applyFilters() {
  const selectedClasses = Array.from(
    document.querySelectorAll(".filters input:checked")
  ).map(cb => cb.value);

  const filtered = allEvents.filter(ev =>
    ev.classes.some(c => selectedClasses.includes(c))
  );

  calendar.removeAllEvents();
  calendar.addEventSource(generateCalendarEvents(filtered));

  renderTodos(filtered);
}

// -------------------------
// Render To-Do tables
// -------------------------
function renderTodos(events) {
  const thisWeekEl = document.querySelector("#thisWeek tbody");
  const nextWeekEl = document.querySelector("#nextWeek tbody");
  const importantEl = document.querySelector("#importantDeadlines tbody");

  thisWeekEl.innerHTML = "";
  nextWeekEl.innerHTML = "";
  importantEl.innerHTML = "";

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

  events.forEach(ev => {
    let dates = [];
    if (ev.repeat === "weekly") {
      let d = new Date(ev.date);
      for (let i = 0; i < 4; i++) {
        const formatted = formatDateYYYYMMDD(d);
        if (!schoolHolidays.includes(formatted)) dates.push(new Date(d));
        d.setDate(d.getDate() + 7);
      }
    } else {
      if (!schoolHolidays.includes(ev.date)) dates.push(new Date(ev.date));
    }

    dates.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${formatDateDDDMMMDD(d)}</td>
        <td>${ev.classes.join(", ")}</td>
        <td>${ev.title}</td>
        <td>${ev.action}</td>
        <td>${formatDateDDMMYYHHMM(new Date(ev.deadline))}</td>
      `;

      if (d >= startOfWeek && d <= endOfWeek) thisWeekEl.appendChild(row.cloneNode(true));
      else if (d >= startOfNextWeek && d <= endOfNextWeek) nextWeekEl.appendChild(row.cloneNode(true));

      if (ev.important) importantEl.appendChild(row.cloneNode(true));
    });
  });
}

// -------------------------
// Helpers
// -------------------------
function formatDateYYYYMMDD(d) {
  return d.toISOString().split("T")[0];
}

function formatDateDDDMMMDD(d) {
  return d.toLocaleDateString("en-GB", { weekday:"short", day:"2-digit", month:"short" });
}

function formatDateDDMMYYHHMM(d) {
  return d.toLocaleDateString("en-GB").replace(/\//g,"/") + " " + d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}
