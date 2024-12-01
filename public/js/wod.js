document.addEventListener("DOMContentLoaded", async () => {
    const workoutContainer = document.getElementById("exercise-list");
    const saveWorkoutBtn = document.getElementById("save-workout-btn");
    const workoutTitle = document.getElementById("workout-title");

    const params = new URLSearchParams(window.location.search);
    const dayExerciseId = params.get("dayId");
    const planId = params.get("planId");


    let workoutData = null;
    let previousWorkoutData = null;

    async function fetchWorkout() {
        
        const url = `https://app.lift-ledger.com/plan/${planId}?day=${encodeURIComponent(dayExerciseId)}`;
        const previousWorkoutUrl = `https://app.lift-ledger.com/plan/user-workout/previous?planId=${planId}&dayId=${dayExerciseId}`;
        
        console.log(`dayExerciseId: ${dayExerciseId}`);
        console.log(`planId: ${planId}`);

        try {
            // Fetch workout data from the plan document
            const workoutResponse = await fetch(url, { method: "GET", credentials: "include" });
            if (!workoutResponse.ok) throw new Error("Failed to fetch workout data");
             workoutData = await workoutResponse.json();
    
            // Fetch previous workout data from the user_actual collection
            const previousWorkoutResponse = await fetch(previousWorkoutUrl, {
                method: "GET",
                credentials: "include",
            });
            previousWorkoutData = previousWorkoutResponse.ok
                ? await previousWorkoutResponse.json()
                : []; // Fallback to an empty array if no previous workouts
    
            // Render the workout UI
            console.log(previousWorkoutData);
            console.log(workoutData);
            displayWorkout(workoutData, previousWorkoutData);
        } catch (error) {
            console.error("Error fetching workout data:", error);
        }
    }
    
    function displayWorkout(workoutData, previousWorkoutData) {
        workoutTitle.textContent = `${workoutData.day} - ${workoutData.planName}`;
        workoutContainer.innerHTML = "";
    
        workoutData.exercises.forEach((exercise, exerciseIndex) => {
            const exerciseCard = document.createElement("div");
            exerciseCard.className = "exercise-card";
    
            // Exercise Header
            const exerciseHeader = document.createElement("div");
            exerciseHeader.className = "exercise-header";
            exerciseHeader.innerHTML = `
                <span>${exercise.exercise}</span>
                <span>${exercise.category}</span>
            `;
    
            // Create a container for sets
            const setsContainer = document.createElement("div");
            setsContainer.className = "sets-container";
    
            // Determine whether to use previous workout data or fallback to plan data
            const previousExerciseData = previousWorkoutData.find(
                prev => prev.day_exercise_id === exercise.day_exercise_id
            );
    
            const setsToDisplay = previousExerciseData
                ? previousExerciseData.sets // Use previous workout sets if available
                : Array.from({ length: exercise.sets }).map((_, index) => ({
                      set_number: index + 1,
                      weight: exercise.weight,
                      reps: exercise.startReps,
                      intensity: exercise.intensity,
                      note: "",
                  })); // Fallback to planned data
    
            // Populate rows for sets
            setsToDisplay.forEach((set, setIndex) => {
                const setRow = createSetRow(set, exerciseIndex, setIndex);
                setsContainer.appendChild(setRow);
            });
    
            // Add buttons to add or remove sets
            const controlButtons = document.createElement("div");
            controlButtons.className = "set-controls";
    
            const addSetButton = document.createElement("button");
            addSetButton.textContent = "Add Set";
            addSetButton.className = "add-set-btn";
            addSetButton.addEventListener("click", () => {
                const newSetRow = createSetRow(null, exerciseIndex, setsContainer.children.length);
                setsContainer.appendChild(newSetRow);
            });
    
            const removeSetButton = document.createElement("button");
            removeSetButton.textContent = "Remove Last Set";
            removeSetButton.className = "remove-set-btn";
            removeSetButton.addEventListener("click", () => {
                if (setsContainer.children.length > 0) {
                    setsContainer.removeChild(setsContainer.lastChild);
                }
            });
    
            controlButtons.appendChild(addSetButton);
            controlButtons.appendChild(removeSetButton);
    
            // Append elements to the exercise card
            exerciseCard.appendChild(exerciseHeader);
            exerciseCard.appendChild(setsContainer);
            exerciseCard.appendChild(controlButtons);
    
            workoutContainer.appendChild(exerciseCard);
        });
    }
    
    // Function to create a row for a set
    function createSetRow(setData, exerciseIndex, setIndex) {
        const setRow = document.createElement("div");
        setRow.className = "set-row";
    
        // Weight Input
        const weightLabel = document.createElement("label");
        weightLabel.htmlFor = `weight-${exerciseIndex}-${setIndex}`;
        weightLabel.textContent = "Weight (lbs)";
    
        const weightInput = document.createElement("input");
        weightInput.type = "number";
        weightInput.placeholder = "0";
        weightInput.value = setData?.weight || ""; // Prefill with data if available
        weightInput.id = `weight-${exerciseIndex}-${setIndex}`;
        weightInput.maxLength = 4; // Limit the input size
        weightInput.style.width = "60px"; // Adjust width for 4 digits
    
        // Reps Input
        const repsLabel = document.createElement("label");
        repsLabel.htmlFor = `reps-${exerciseIndex}-${setIndex}`;
        repsLabel.textContent = "Reps";
    
        const repsInput = document.createElement("input");
        repsInput.type = "number";
        repsInput.placeholder = "0";
        repsInput.value = setData?.reps || "";
        repsInput.id = `reps-${exerciseIndex}-${setIndex}`;
        repsInput.maxLength = 4; // Limit the input size
        repsInput.style.width = "60px";
    
        // Intensity Input
        const intensityLabel = document.createElement("label");
        intensityLabel.htmlFor = `intensity-${exerciseIndex}-${setIndex}`;
        intensityLabel.textContent = "Intensity (%)";
    
        const intensityInput = document.createElement("input");
        intensityInput.type = "number";
        intensityInput.placeholder = "0";
        intensityInput.value = setData?.intensity || "";
        intensityInput.id = `intensity-${exerciseIndex}-${setIndex}`;
        intensityInput.maxLength = 4; // Limit the input size
        intensityInput.style.width = "60px";
    
        // Notes Input
        const noteLabel = document.createElement("label");
        noteLabel.htmlFor = `note-${exerciseIndex}-${setIndex}`;
        noteLabel.textContent = "Notes";
    
        const noteInput = document.createElement("textarea");
        noteInput.placeholder = "Add notes here";
        noteInput.value = setData?.note || "";
        noteInput.id = `note-${exerciseIndex}-${setIndex}`;
        noteInput.style.width = "150px"; // Keep the width larger for notes
        noteInput.style.height = "60px"; // Adjust height for usability
    
        // Append inputs and labels to the setRow
        setRow.appendChild(weightLabel);
        setRow.appendChild(weightInput);
    
        setRow.appendChild(repsLabel);
        setRow.appendChild(repsInput);
    
        setRow.appendChild(intensityLabel);
        setRow.appendChild(intensityInput);
    
        setRow.appendChild(noteLabel);
        setRow.appendChild(noteInput);
    
        return setRow;
    }
    
    
    

    saveWorkoutBtn.addEventListener("click", async () => {
        const workoutLog = []; // Array to store logs for all exercises
        const workoutNotes = document.getElementById("workout-notes").value || ""; // Collect overall workout notes
        const workoutDate = new Date().toISOString(); // Current date for logging
    
        // Use the existing dayExerciseId and planId variables
        const dayId = dayExerciseId; 
        const currentPlanId = planId;
    
        // Loop through each exercise card
        const exerciseCards = document.querySelectorAll(".exercise-card");
        exerciseCards.forEach((exerciseCard, exerciseIndex) => {
            const exerciseData = workoutData.exercises[exerciseIndex]; // Ensure workoutData exists
            const sets = []; // Array to hold data for individual sets
    
            // Loop through each set row for this exercise
            const setRows = exerciseCard.querySelectorAll(".set-row");
            setRows.forEach((setRow, setIndex) => {
                const weight = document.getElementById(`weight-${exerciseIndex}-${setIndex}`).value;
                const reps = document.getElementById(`reps-${exerciseIndex}-${setIndex}`).value;
                const intensity = document.getElementById(`intensity-${exerciseIndex}-${setIndex}`).value;
                const note = document.getElementById(`note-${exerciseIndex}-${setIndex}`).value;
    
                sets.push({
                    set_number: setIndex + 1, // Assign set number (1-based index)
                    weight: parseFloat(weight) || 0, // Default to 0 if input is empty
                    reps: parseInt(reps) || 0,
                    intensity: parseFloat(intensity) || 0,
                    note: note || "", // Allow empty notes
                });
            });
    
            // Push the log for this exercise
            workoutLog.push({
                day_exercise_id: exerciseData.day_exercise_id, // Unique identifier for this exercise
                sets: sets, // Include sets array
            });
        });
    
        // Prepare the payload
        const payload = {
            planId: currentPlanId,
            day_id: dayId,
            workout_date: workoutDate,
            workout_notes: workoutNotes,
            workoutLog: workoutLog, // Log for all exercises
        };
    
        // Send the payload to the server
        const url = `https://app.lift-ledger.com/plan/user-workout/log`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
    
            if (response.ok) {
                alert("Workout logged successfully!");
                window.location.href = './basic.html';
            } else {
                console.error("Failed to log workout:", response.statusText);
            }
        } catch (error) {
            console.error("Error logging workout:", error);
        }
    });
    
    
    

    // Fetch and display workout on page load
    fetchWorkout();
});
