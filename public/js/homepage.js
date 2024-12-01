// 
// homepage 
document.addEventListener("DOMContentLoaded", async () => {
    const currentPlanContainer = document.getElementById("current-plan-details");
    // Fetch the user's current plan from the server
    async function fetchCurrentPlan() {
        const url = "https://app.lift-ledger.com/plan/active";
        try {
            const response = await fetch(url, { method: "GET", credentials: "include" });
            if (response.ok) {
                const currentPlan = await response.json();
                
                //Check if the return object is empty
                if(Object.keys(currentPlan).length === 0) {
                    currentPlanContainer.innerHTML = `<p>No current plan set. Please navigate 'PLANS' to get started!</p>`;
                }
                else {
                    displayCurrentPlan(currentPlan);
                }
            } else {
                console.error("Failed to fetch current plan:", response.statusText);
                currentPlanContainer.innerHTML = `<p>No current plan set. Please select a plan to get started!</p>`;
            }
        } catch (error) {
            console.error("Error fetching current plan:", error);
        }
    }

    // Dynamically display the current plan
    function displayCurrentPlan(plan) {
        // Clear existing content
        currentPlanContainer.innerHTML = "";
	
        // Plan header
        const planHeader = document.createElement("div");
        planHeader.className = "current-plan-header";
        planHeader.innerHTML = `
            <h3>${plan.name} (${plan.duration} weeks)</h3>
        `;

        currentPlanContainer.appendChild(planHeader);

        // Display days
        const daysList = document.createElement("div");
        daysList.className = "days-list";

        plan.day_detail.forEach(day => {
            const dayLink = document.createElement("a");
            dayLink.className = "day-link";
            dayLink.textContent = day.day;
            dayLink.href = `/wod.html?dayId=${encodeURIComponent(day.day_id)}&planId=${plan._id}`; // Pass planId and day to the workout screen
            daysList.appendChild(dayLink);
        });

        currentPlanContainer.appendChild(daysList);
    }

    // Fetch and display the current plan on page load
    fetchCurrentPlan();
});
