document.addEventListener("DOMContentLoaded", async () => {
    const plansContainer = document.getElementById("plan-list");

    // Fetch plans from the server
    async function fetchPlans() {
        const url = "https://app.lift-ledger.com/plan/all"; // Adjust this endpoint
        try {
            const response = await fetch(url, { method: "GET", credentials: "include" });
            if (response.ok) {
                const plans = await response.json();
                displayPlans(plans);
            } else {
                console.error("Failed to fetch plans:", response.statusText);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    }

    // Sends a put request to the server to toggle the value of current_plan in plan doc
    function toggleActivePlan(isActivePlan, planId) {
        console.log(`toggling ${planId}`);
        const url = `https://app.lift-ledger.com/plan/toggle/${planId}`;
        fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            //body: JSON.stringify({ current_plan: !isActivePlan }),
        })
            .then(response => {
                if (response.ok) {
                    console.log("Plan toggled successfully");
                    fetchPlans();

                } else {
                    console.error("Failed to toggle plan:", response.statusText);
                }
            })
            .catch(error => console.error("Error toggling plan:", error));
    }

    // Dynamically load plans into the UI
    function displayPlans(plans) {
        plansContainer.innerHTML = ""; // Clear existing plans

        plans.forEach(plan => {
            // Determine if this is the user's active plan
            const isActivePlan = plan.current_plan;


            // Plan Header
            const planHeader = document.createElement("div");
            planHeader.innerHTML = `<b>${plan.name} (${plan.duration} weeks)</b>`;

            // Mark the current_plan's header and assign relevant button
            const activePlanToggleBtn = document.createElement('button');
            activePlanToggleBtn.type = 'button';
            if (isActivePlan){
                planHeader.className = 'active-plan plan-header'
                activePlanToggleBtn.className = 'remove-as-current-btn';
                activePlanToggleBtn.innerHTML = 'Remove as Active';
            
            }
            else {
                planHeader.className = "plan-header";
                activePlanToggleBtn.className = 'set-as-current-btn';
                activePlanToggleBtn.innerHTML = 'Set as Active';
            }

            //  
            activePlanToggleBtn.addEventListener('click', () => toggleActivePlan(isActivePlan, plan._id));
            planHeader.appendChild(activePlanToggleBtn);

            // Create a container for this plan's days
            const daysContainer = document.createElement("div");
            daysContainer.className = 'days-container';
            daysContainer.style.display = 'none';

            // Add plan header click event to display details
            planHeader.addEventListener('click', () => {
                daysContainer.style.display = daysContainer.style.display === "none" ? "grid" : "none";
            });

            // Group exercises by day
            const exercisesByDay = groupExercisesByDay(plan.day_detail);

            Object.keys(exercisesByDay).forEach(day => {
                // Day Header
                const dayContainer = document.createElement("div");
                dayContainer.className = "day-container";

                const dayHeader = document.createElement("div");
                dayHeader.className = "day-header";
                dayHeader.innerHTML = `
                    <span>${day}</span>
                    <span>${exercisesByDay[day].length} Exercises</span>
                `;

                // Day Details (hidden by default)
                const dayDetails = document.createElement("div");
                dayDetails.className = "day-details";
                dayDetails.style.display = 'none'; // set this so it works on 1 click

                // Create a table for the day's exercises
                const table = document.createElement("table");
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Category</th>
                            <th>Sets</th>
                            <th>Reps</th>
                            <th>Weight</th>
                            <th>Intensity</th>
                        </tr>
                    </thead>
                `;
                const tableBody = document.createElement("tbody");

                exercisesByDay[day].forEach(exercise => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${exercise.exercise}</td>
                        <td>${exercise.category}</td>
                        <td>${exercise.sets}</td>
                        <td>${exercise.startReps}-${exercise.endReps}</td>
                        <td>${exercise.weight} lbs</td>
                        <td>${exercise.intensity}%</td>
                    `;
                    tableBody.appendChild(row);
                });

                table.appendChild(tableBody);
                dayDetails.appendChild(table);

                // Toggle visibility on day header click
                dayHeader.addEventListener("click", () => {
                    dayDetails.style.display =
                        dayDetails.style.display === "none" ? "block" : "none";
                });

                // Append header and details to day container
                dayContainer.appendChild(dayHeader);
                dayContainer.appendChild(dayDetails);

                // Add day container to the days container
                daysContainer.appendChild(dayContainer);
            });

            // Append to the main container
            plansContainer.appendChild(planHeader);
            plansContainer.appendChild(daysContainer);
        });
    }

    // Group exercises by day
    function groupExercisesByDay(dayDetails) {
        const grouped = {};
        dayDetails.forEach(dayDetail => {
            const day = dayDetail.day;
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(...dayDetail.exercises);
        });
        return grouped;
    }

    // Collapse All Plan Headers
    function collapseAllPlans() {
        const plans = document.querySelectorAll('.days-container');
        console.log(plans);
        plans.forEach( dayContainer =>{
            dayContainer.style.display = "none";            
        });
    }

    // Fetch and display plans on page load
    fetchPlans();

    document.getElementById('collapse-button').addEventListener('click', collapseAllPlans);
});
