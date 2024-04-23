//Compute total hours
const computeTotalHours = (clockIn, clockOut) => {
  const clockInDate = new Date(clockIn);
  const clockOutDate = new Date(clockOut);
  const totalHours = (clockOutDate - clockInDate) / 1000 / 60 / 60;
  return totalHours;
};

//event listener on sumbit run computeTotalHours
document.querySelector("#timecard-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const clockIn = document.querySelector("#clock-in-time").value;
  const clockOut = document.querySelector("#clock-out-time").value;
  const totalHours = computeTotalHours(clockIn, clockOut);
  document.querySelector("#total-hours").value = totalHours;
  document.querySelector("#timecard-form").submit();
});

// TODO: Handle timecard submissions in batches
