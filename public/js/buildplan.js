

// need exercises and their categories to populate everything on screen

// Every Column has their own add button can we made them have the same ability
// need to keep track of which column we're in 

// Document Level Vars
// Reference to input and container

const daysInput = document.getElementById('days-input');
const columnDataContainer = document.getElementById('workout-column-container');
let categories = ["All"];
let exercises = [];
let fitleredExercises = [];

// GLOBAL EXERCISE COMPONENT COUNTER
let EXERCISE_COMPONENT_CNT = 0;

const trashIconClass = 'll-button fa-sharp-duotone fa-solid fa-trash-can fa-lg';
const trashIconStyle = '--fa-primary-opacity: 2; padding-left: 25px';

const expandIconClass = 'll-button fa-solid fa-expand fa-lg';
const expandIconStyle = '--fa-primary-opacity: 2; padding-left: 5px';

const minimizeIconClass = 'll-button fa-solid fa-minimize';
const minimizeIconStyle = '--fa-primary-opacity: 2; padding-left: 5px; color: #FFd43b';

// Components
const innerHTMLExerciseButton = `            
                <div class=" add-exercise-layout">
                    <i class=" fa-solid fa-plus fa-lg" ></i>
                    <span><b>ADD A NEW EXERCISE</b></span>
                </div>
            `;

const innerHTMLColumnHeader = `
                <input type="text"  class="ll-button day-name-input" placeholder="Rename Day...">
                <div style="align-content: center; margin-left: 10px;">
                </div>
`;

const innerHTMLColumnData = `
    <div class="column-data-top-row">
        <span class="exercise-category"></span>
    </div>
    <hr class="column-data-divider">
    <select class="exercise-value">
    </select>
`
const hiddenCardHtml = `
        <label for="sets">Sets:</label>
        <input type="number" id="sets" min="1" max="10" />
        <label for="weight">Weight:</label>
        <input type="number" id="weight" />
        <label for="start-reps">Starting Rep Range:</label>
        <input type="number" id="start-reps" />
        <label for="end-reps">Ending Rep Range:</label>
        <input type="number" id="end-reps" />
        <label for="intensity">Intensity (%):</label>
        <input type="number" id="intensity" min="0" max="100" />
`


function fetchExerciseJSON() {
    // create a container for the exercises
    const exerciseContainer = document.getElementById('exercise-container');

    // Fetch returns a Promise containing the response
    fetch('https://app.lift-ledger.com/exercise/all').then((res) => {
        if (!res.ok) { // status code 200-299 okay
            throw new Error
            (`http error! status ${res.status}`);
        }
        return res.json(); // parse as json and return another promise  this is what allows us to do the following line
    }).then(data => { 
      exercises = data;
      fitleredExercises = exercises;
      getCategories();
      console.log(exercises);
      console.log(categories);
    }).catch(error => console.error('Error fetching JSON:', error));
    
    // after parsing JSON
}

function getCategories() {
    exercises.forEach(e => {
        let category = e.category;
        if (!categories.includes(category)){
            categories.push(category);
        }
    });
}

function tester(){
    console.log("Value changed");
}

// Function to generate columns inside of the horizontal container
function generateColumns() {
    // Clear existing columns
    columnDataContainer.innerHTML = '';

    const numberOfDays = parseInt(daysInput.value);
    if (isNaN(numberOfDays) || numberOfDays <= 0) {
        alert('Please enter a valid number of training days.');
        return;
    }

    // Create columns dynamically
    for (let i = 1; i <= numberOfDays; i++) {
        const columnId = `column-${i}`; // Unique ID for each column

        // Create column container
        const column = document.createElement('div');
        column.className = 'workout-day-column';
        column.id = columnId;

        // Add header to the column
        const columnHeader = document.createElement('div');
        columnHeader.className = 'column-header';
        columnHeader.textContent = `Day ${i}`;
        columnHeader.innerHTML = innerHTMLColumnHeader;

        // Add content area
        const columnContent = document.createElement('div');
        columnContent.id = 'column-data-container';

        // Add "Add Exercise" button
        const addButton = document.createElement('div');
        addButton.className = 'column-data add-exercise-button-container';
        addButton.id = 'add-exercise btn'
        addButton.innerHTML = innerHTMLExerciseButton;
        addButton.addEventListener('click', () => addExercise(columnId));

        // Append elements to the column
        column.appendChild(columnHeader);
        column.appendChild(columnContent);
        column.appendChild(addButton);

        // Append column to the container
        columnDataContainer.appendChild(column);
    }
}

    function addExercise(columnId) {
        const column = document.getElementById(columnId);
        const columnContent = column.querySelector('#column-data-container');

        const cardId = `column-${columnId}-exercise-${EXERCISE_COMPONENT_CNT}`;

        // Show the modal to select a category
        showModal(categories, (selectedCategory) => {
            // Create new exercise entry
            const exercise = document.createElement('div');
            exercise.className = 'column-data';
            exercise.id = `column-data-${EXERCISE_COMPONENT_CNT}`;
            exercise.setAttribute('data-id', cardId)
            exercise.innerHTML = innerHTMLColumnData;


            // create trash icon and expand and give its event
            const topRow = exercise.querySelector('.column-data-top-row');

            const deleteicon = document.createElement('i');
            deleteicon.style = trashIconStyle;
            deleteicon.className = trashIconClass;

            const columnRowId = `column-data-${EXERCISE_COMPONENT_CNT}`;
            deleteicon.addEventListener('click', () =>{
                exercise.remove();
            });

            const expandicon = document.createElement('i');
            expandicon.style = expandIconStyle;
            expandicon.className = expandIconClass;

            expandicon.addEventListener('click', () => {
                exercise.classList.toggle('expanded');
                if (exercise.classList.contains('expanded')){
                    expandicon.style = minimizeIconStyle;
                    expandicon.className = minimizeIconClass;
                }
                else {
                    expandicon.style = expandIconStyle;
                    expandicon.className = expandIconClass;

                }
            });

            topRow.appendChild(deleteicon);
            topRow.appendChild(expandicon);

            // Update the category in the new exercise
            const categorySpan = exercise.querySelector('.exercise-category');
            categorySpan.textContent = selectedCategory;

            // Populate exercise drop-down
            const exerciseSelect = exercise.querySelector('.exercise-value');

            exercises.forEach(e => {
                const exerciseOption = document.createElement('option');
                exerciseOption.className = 'exercise-value-option'
                exerciseOption.value = e.name;
                exerciseOption.text = e.name;
                
                // check exercises' categories and attach all that match
                if (selectedCategory === 'All'){
                    exerciseSelect.appendChild(exerciseOption);
                    console.log(e.name);
                }
                else if (e.category === selectedCategory) {
                    // create an option tag
                    exerciseSelect.appendChild(exerciseOption);
                    console.log("Added " + e.name);
                }
            });

            // Create hidden content:

            const expandableContent = document.createElement('div');
            expandableContent.className = "expandable-content";
            expandableContent.innerHTML = `        
                <label for="sets-${cardId}">Sets:</label>
                <input class="exercise-value-option" type="number" id="sets-${cardId}" min="1" max="10" />
                <label for="weight-${cardId}">Weight:</label>
                <input class="exercise-value-option" type="number" id="weight-${cardId}" />
                <label for="start-reps-${cardId}">Starting Rep Range:</label>
                <input class="exercise-value-option" type="number" id="start-reps-${cardId}" />
                <label for="end-reps-${cardId}">Ending Rep Range:</label>
                <input class="exercise-value-option" type="number" id="end-reps-${cardId}" />
                <label for="intensity-${cardId}">Intensity (%):</label>
                <input class="exercise-value-option" type="number" id="intensity-${cardId}" min="0" max="100" />
                `
            
            // Expandable content Append to exercise
            exercise.appendChild(expandableContent);

            // Append to the column's content area
            columnContent.appendChild(exercise);

            // Increment the global exercise counter
            EXERCISE_COMPONENT_CNT += 1;
        });
    }

    function buildPlanToJSON() {
        //const result = {};
        
        const planName = document.getElementById('title-input').value || '';
        const planDescription = document.getElementById('description-input').value || '';
        const planWeekCnt = document.getElementById('week-input').value || '';
        const planDayCnt = document.getElementById('days-input').value || '';

        const columns = parseColumnsToJSON();

        const result = {
            name: planName,
            description: planDescription,
            current_plan: false,
            duration: planWeekCnt,
            num_workout_days: planDayCnt,
            day_detail: columns
        };

        sendPlanData(result); // POST request
        window.location.href = './viewplans.html'; // redirect to the standard plan page
        return result;
    }

    function parseColumnsToJSON() {
        const columns = document.querySelectorAll('.workout-day-column');
        const result = [];
    
        columns.forEach(column => {
            // Extract the day name from the column header
            const dayNameInput = column.querySelector('.day-name-input');
            const dayName = dayNameInput ? dayNameInput.value : 'Unnamed Day';
    
            // Get all exercises (column-data elements) within the column
            const exercises = [];
            const columnDataElements = column.querySelectorAll('.column-data');

            let exerciseSequence = 1;

            columnDataElements.forEach(dataElement => {
                const category = dataElement.querySelector('.exercise-category')?.textContent.trim() || '';
                const exercise = dataElement.querySelector('.exercise-value')?.value.trim() || '';
                const sets = dataElement.querySelector(`[id^="sets"]`)?.value || '';
                const weight = dataElement.querySelector(`[id^="weight"]`)?.value || '';
                const startReps = dataElement.querySelector(`[id^="start-reps"]`)?.value || '';
                const endReps = dataElement.querySelector(`[id^="end-reps"]`)?.value || '';
                const intensity = dataElement.querySelector(`[id^="intensity"]`)?.value || '';
    
                // Validate if the exercise entry is complete
                if (category && exercise) {
                    exercises.push({
                        day_exercise_id: crypto.randomUUID(),
                        exercise_sequence: exerciseSequence++,
                        category,
                        exercise,
                        sets: parseInt(sets) || 0,
                        weight: parseFloat(weight) || 0,
                        startReps: parseInt(startReps) || 0,
                        endReps: parseInt(endReps) || 0,
                        intensity: parseInt(intensity) || 0,
                        user_actual: []         // This is an empty array that will be populated with user data
                    });
                }
            });
    
            // Add day and its exercises to the result
            result.push({
                day: dayName,
                day_id: crypto.randomUUID(),
                exercises: exercises
            });
        });
    
        console.log(result); // Check the JSON in the console
        return result;
    }
    
    


// Show the modal
function showModal(categories, onCategorySelected) {
    const modal = document.getElementById('category-modal');
    const modalOptions = document.getElementById('modal-category-options');

    // Clear previous options
    modalOptions.innerHTML = '';

    // Populate categories
    categories.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.textContent = category;

        categoryButton.addEventListener('click', () => {
            // When a category is selected, close the modal and pass the category to the callback
            hideModal();
            onCategorySelected(category);
        });
        modalOptions.appendChild(categoryButton);

    });

    // Show the modal
    modal.classList.add('active');
}

// Hide the modal
function hideModal() {
    const modal = document.getElementById('category-modal');
    modal.classList.remove('active');
}

// Deletes the exercise for a specific column
function deleteColumnRow(columnId, rowId) {
    // Select the correct column
    const column = document.getElementById(columnId);
    // do i need that....
    console.log(column);
    const row = document.getElementById(rowId);
    console.log(row);
    row.remove();
}

// HTTP Post for plan data
async function sendPlanData(planData) {
    const url = 'https://app.lift-ledger.com/plan/new-plan';

    try {
        const response = await fetch(url, {
            method: 'POST', // Specify the HTTP method
            headers: {
                'content-type': 'application/json', // Ensure the server understands JSON
            },
            token: 'include',
            body: JSON.stringify(planData), // Convert plan data to JSON string
        });

        if (response.ok) {
            const result = await response.json(); // Parse the server's response
            console.log('Plan data sent successfully:', result);
        } else {
            console.error('Failed to send plan data:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error occurred while sending plan data:', error);
    }
}


document.getElementById('save-plan-btn').addEventListener('click', () => {
    const planJSON = buildPlanToJSON();
    console.log(planJSON); // You can also send this to a server using fetch/POST
});


const inputElement = document.getElementById('days-input')
inputElement.addEventListener('change', generateColumns); // When days changed
document.getElementById('modal-cancel-btn').addEventListener('click', hideModal); // Hide the modal if no value
// Get basic exercise data
fetchExerciseJSON();




