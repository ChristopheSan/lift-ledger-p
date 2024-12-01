
// Document Level Vars
let categories = ["All"];
let exercises = [];
let fitleredExercises = [];


function fetchJSON() {
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
      populateExercises();
      getCategories();
      populateFilterValues();
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

function populateFilterValues() {
    console.log(categories);
    const categoryFilter = document.getElementById('category-filter');

    categories.forEach(cat => {
        // create an option to select based on the values found in all exercises
        const optionElement = document.createElement('option');
        optionElement.className = ('excercise-filter-item');
        optionElement.textContent = `${cat}`;

        categoryFilter.appendChild(optionElement);
    });

    const filterContainer = document.getElementById('filter-container');
    filterContainer.appendChild(categoryFilter);

}

// Uses filteredExercises to update what is being shown to the user based on the current filtered category

function populateExercises() {
    console.log(fitleredExercises);
    const exerciseContainer = document.getElementById('exercise-container');
    exerciseContainer.replaceChildren();

    fitleredExercises.forEach(exercise => {

        const itemDiv = document.createElement('div');
        itemDiv.className = ('exercise-item');

        const exerciseIDandNameElement = document.createElement('h3');
        const name = exercise.name;
        const id = exercise.exerciseId;
        exerciseIDandNameElement.textContent = `${id} | ${name}`;

        const hrElement = document.createElement('hr');
        
        const categoryElement = document.createElement('h4');
        const category = exercise.category;
        categoryElement.textContent = category;

        const linkElement = document.createElement('a');
        const link = exercise.exampleVideoUrl;
        linkElement.href = link;
        linkElement.target = "_blank";
        linkElement.innerHTML = `<i class="fa-brands fa-youtube fa-lg" style="color: #a6a6a6;"></i>`;
 

        // add everything to its container in order
        itemDiv.appendChild(exerciseIDandNameElement);
        itemDiv.appendChild(hrElement);
        itemDiv.appendChild(categoryElement);
        itemDiv.appendChild(linkElement);
        exerciseContainer.appendChild(itemDiv);

    }); // End for each
}

function handleFilterChange() {
    const selectedCategory = document.getElementById('category-filter').value;

    if (selectedCategory === 'All'){
        fitleredExercises = exercises;
    }
    else {
        fitleredExercises = exercises.filter(
            (exercise) => exercise.category === selectedCategory
        );

    }
    populateExercises();
}

// fitler change event
document.getElementById('category-filter').addEventListener('change', handleFilterChange);

fetchJSON();

// "exerciseId": 1,
// "name": "Cable Rope Crunch",
// "exampleVideoUrl": "https://youtu.be/6GMKPQVERzw",
// "createdByUserFlag": false,
// "user": null,
// "planWorkoutDetails": [],
// "category": "Abs"