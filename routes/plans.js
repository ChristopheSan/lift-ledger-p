import express from "express";
import { ObjectId } from 'mongodb';
import { authenticateToken } from "../middleware/authenticateToken.js";
import { getDb } from "../database.js";

const router = express.Router();
const TEST_USER = '6744e8d0da31170df122cee2';

// Route to create a new plan
router.post("/new-plan", authenticateToken, async (req, res) => {
  console.log('new-plan route hit');

  const userId = req.user.user_id; // Extract user ID from the token
  const { name, description, current_plan, duration, num_workout_days, day_detail } = req.body;

  try {
    // Validate required fields
    if (!name || !duration || !num_workout_days || !day_detail) {

      console.log("missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate day_detail structure
    if (day_detail.length !== parseInt(num_workout_days)) {
      console.log("number of days does not match day-detail length");
      return res.status(400).json({ message: "Number of days does not match day_detail length" });
    }

    const db = getDb();
    const plansCollection = db.collection("plan");

    // Create a new plan object
    const newPlan = {
      userId: new ObjectId(userId), 
      name,
      description,
      current_plan,
      duration: parseInt(duration),
      num_workout_days: parseInt(num_workout_days),
      day_detail, // Store workout day details
      createdAt: new Date(),
    };

    // Insert the plan into the database
    const result = await plansCollection.insertOne(newPlan);

    // Respond with success
    res.status(201).json({ message: "Plan created successfully", planId: result.insertedId });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get all of the current user's plans
router.get('/all', authenticateToken, async (req, res) => {
  console.log('/plan/all route hit');
  const userID = req.user.user_id;
  console.log(req.user.user_id, req.user.name, req.user.email);

  try {

    const db = getDb();

    const userPlans = await db.collection('plan').find( {userId: new ObjectId(userID)}).sort({createdAt: -1}).toArray();

    console.log('result: ', userPlans);

    if (userPlans) {
      res.status(200).json(userPlans);
    }

  } catch (error) {
    console.error("Error Fetching plans", error);
    res.status(500).json({message: "Server Error"});
  }
  
});

// Route to get the current user's ACTIVE plan
router.get('/active', authenticateToken, async (req, res) => {
  console.log("/plan/active route hit");
  const userId = req.user.user_id;

  try {
    const db = getDb();
    const activePlan = await db.collection('plan').findOne( {userId: new ObjectId(userId), current_plan: true});

    console.log(`User: ${req.user.email}'s active plan \n ${(activePlan)}`);

    // check to see if there is no active plans for a user
    if (!activePlan) {
      const empty = {};
      res.status(200).json(empty);
      console.log('sending empty json object');
    }
    else {
      res.status(200).json(activePlan);
    }
  } catch (error) {
    console.error("Error Fetching active plan", error);
    res.status(500).json({message: "Server Error"});
  }
});

// Route to toggle the given plan's 'current_plan' field
// Also if a user has a current plan already then it toggles that to false
router.put('/toggle/:planId', authenticateToken, async (req, res) => {
  console.log("/toggle/active route hit");
  const planId = req.params.planId; // from the route
  const userId = req.user.user_id; // from the credential check

  try {


    // First, identify if the user has a current_plan: true in the db
    // If found, toggle it
    const db = getDb();
    // finds the current plan for the current user and toggles it to false - if it doesn't exist then do nothing;
    db.collection('plan').updateOne({userId: new ObjectId(userId), current_plan: true}, {$set: {current_plan: false}});

    // Update the plan that we want
    db.collection('plan').updateOne({_id: new ObjectId(planId)}, {$set: {current_plan: true}})

    res.status(201).json({message: "Current plan updated"} )

  } catch (error) {
    console.error("Error toggling active plan", error);
    res.status(500).json({message: "Server Error"});
  }
})

// This is route for the wod query
router.get("/:planId", async (req, res) => {
  console.log(":planId route hit for workoutData");
  const { planId } = req.params; // Extract planId from the URL
  const { dayExerciseId } = req.query; // Extract dayExerciseId from query params
  //const { dayExerciseId } = req.query; // Extract dayExerciseId from query params

  console.log(`planId: ${planId}`)
  console.log(`dayId: ${dayExerciseId}`)

  try {
      const db = getDb();
      const plansCollection = db.collection("plan");

      // Find the plan by ID
      const plan = await plansCollection.findOne({ _id: new ObjectId(planId) });
      if (!plan) {
          return res.status(404).json({ message: "Plan not found" });
      }

      // Find the specific day by day_id
      const dayDetail = plan.day_detail.find(day => day.day_exercise_id === dayExerciseId); // not sure why this is day.day_exercise_id but it works
      if (!dayDetail) {
          return res.status(404).json({ message: "Day not found in the plan" });
      }

      console.log((dayDetail)); // this is json

      // Prepare the response data
      const response = {
          planName: plan.name,
          day: dayDetail.day,
          exercises: dayDetail.exercises,
      };

      res.status(200).json(response); // Send the response
  } catch (error) {
      console.error("Error fetching workout data:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// Route to post data into the user-workout table
router.post('/user-workout/log', authenticateToken, async (req, res) => {
  console.log('plan/user-workout/log route hit');

  const userId = req.user.user_id;
  const {planId, day_id, workout_date, workout_notes, workoutLog } = req.body;

  try {
    const db = getDb();
    const userWorkoutCollection = db.collection("user-workout");

    // Insert a new workout log
    const newWorkoutLog = {
        userId: new ObjectId(userId),
        planId: new ObjectId(planId),
        day_id: day_id,
        workout_date: new Date(workout_date),
        workout_notes: workout_notes,
        exercises: workoutLog, // Array of exercise logs
    };

    const result = await userWorkoutCollection.insertOne(newWorkoutLog);

    res.status(201).json({ message: "Workout logged successfully!", logId: result.insertedId });
} catch (error) {
    console.error("Error logging workout:", error);
    res.status(500).json({ message: "Server error" });
}

});

// Route to get the previous workout log of a given dayId
router.get("/user-workout/previous", authenticateToken, async (req, res) => {
  console.log('/plan/user-workout/previous route hit');
  const { planId, dayId } = req.query;
  const userId = req.user.user_id; 

  try {
      const db = getDb();
      console.log(`userId: ${userId}`)
      console.log(`planId: ${planId}`)
      console.log(`dayId: ${dayId}`);

      const userWorkouts = await db
          .collection("user-workout")
          .find({ userId: new ObjectId(userId), planId: new ObjectId(planId), day_id: dayId })
          .sort({ workout_date: -1 }) // Get the most recent workout first
          .limit(1) // Only fetch the latest workout
          .toArray();
          
          res.status(200).json(userWorkouts[0]?.exercises || []); // Send only the workout log array
          // res.status(200).json(userWorkouts[0]?.workoutLog || []); // Send only the workout log array
  } catch (error) {
      console.error("Error fetching previous workouts:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// Route to update the user_actual array in each plan-day=exercise
router.put('/plan/user_actual/', authenticateToken, async (req, res) => {
  console.log("/plan/user_actual route hit");
  const userId = req.user.user_id; // from the credential check


});

export default router;
