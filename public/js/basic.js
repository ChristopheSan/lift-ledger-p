// Date finder for dashboard/home
const dateElement = document.getElementById("current-date");
const currentDate = new Date().toLocaleDateString();

dateElement.textContent = `${currentDate}`;