function saveShift(shift) {
  const inputId = {
    morning: 'morningTemp',
    afternoon: 'afternoonTemp',
    evening: 'eveningTemp',
    night: 'nightTemp'
  }[shift];

  const tempValue = document.getElementById(inputId).value;
  if (!tempValue) {
    alert("Please enter the temperature.");
    return;
  }

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let data = JSON.parse(localStorage.getItem('temperatureLogs')) || [];

  // Find today's entry or create it
  let todayEntry = data.find(entry => entry.date === today);
  if (!todayEntry) {
    todayEntry = { date: today };
    data.unshift(todayEntry);
  }

  // Update the relevant shift
  todayEntry[shift] = {
    temp: parseFloat(tempValue),
    time: timeNow
  };

  localStorage.setItem('temperatureLogs', JSON.stringify(data));
  displayLogs();
  document.getElementById(inputId).value = ''; // Clear input
}

function displayLogs() {
  const logDiv = document.getElementById('log');
  const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];

  let html = '';
  logs.forEach(log => {
    html += `<div class="entry"><strong>${log.date}</strong><br>`;
    if (log.morning) html += `🌅 Morning: ${log.morning.temp}°C at ${log.morning.time}<br>`;
    if (log.afternoon) html += `☀️ Afternoon: ${log.afternoon.temp}°C at ${log.afternoon.time}<br>`;
    if (log.evening) html += `🌇 Evening: ${log.evening.temp}°C at ${log.evening.time}<br>`;
    if (log.night) html += `🌙 Night: ${log.night.temp}°C at ${log.night.time}<br>`;
    html += `</div>`;
  });

  logDiv.innerHTML = html;
}

// Load logs on page load
displayLogs();


async function downloadPDF() {
  const logs = JSON.parse(localStorage.getItem('temperatureLogs')) || [];
  if (logs.length === 0) {
    alert("No data to download.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;
  doc.setFontSize(14);
  doc.text("Weekly Temperature Report", 70, y);
  y += 10;

  logs.forEach((log, index) => {
    const m = log.morning || { temp: '-', time: '-' };
    const a = log.afternoon || { temp: '-', time: '-' };
    const e = log.evening || { temp: '-', time: '-' };
    const n = log.night || { temp: '-', time: '-' };

    doc.setFontSize(12);
    doc.text(`Date: ${log.date}`, 10, y); y += 8;
    doc.text(`🌅 Morning: ${m.temp}°C at ${m.time}`, 10, y); y += 6;
    doc.text(`☀️ Afternoon: ${a.temp}°C at ${a.time}`, 10, y); y += 6;
    doc.text(`🌇 Evening: ${e.temp}°C at ${e.time}`, 10, y); y += 6;
    doc.text(`🌙 Night: ${n.temp}°C at ${n.time}`, 10, y); y += 10;

    // New page if content goes below
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("temperature_report.pdf");
}


function clearLogs() {
  if (confirm("Are you sure you want to delete all logs?")) {
    localStorage.removeItem('temperatureLogs');
    displayLogs();
    alert("All logs have been cleared.");
  }
}
