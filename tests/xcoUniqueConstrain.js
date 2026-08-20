// xcoUniqueConstrain.js
// Playwright/JS equivalent of MT.MannaiTrading.XCOuniqueConstrain (Java).
//
// Java version:
//   SimpleDateFormat sdf = new SimpleDateFormat("ddMMyyyyHHmmss");
//   String dateTime = sdf.format(new Date());
//   return dateTime;
//
// i.e. a timestamp string in day-month-year-hour-minute-second order, e.g.
// "16082026195731" for 16-Aug-2026 19:57:31. Kept as its own module (instead
// of folded into the generic utils.js) because it's shared, standalone logic
// - same as it being its own class/package in the Java project - and is used
// by both orderCreationDemo.spec.js (XCO Number) and vehicleShipment.spec.js
// (Chassis No).

function pad(n, width = 2) {
  return String(n).padStart(width, '0');
}

function generateXCO() {
  const now = new Date();

  const dd = pad(now.getDate());
  const MM = pad(now.getMonth() + 1); // getMonth() is 0-indexed
  const yyyy = now.getFullYear();
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return `${dd}${MM}${yyyy}${HH}${mm}${ss}`;
}

module.exports = { generateXCO };