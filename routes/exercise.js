import express, { json } from 'express';
import debug from 'debug'
import { authenticateToken } from '../middleware/authenticateToken.js';
import { getDb } from '../database.js';
import { ObjectId } from 'mongodb';
const debugUser = debug('app:User');

const router = express.Router();

router.get('/all', authenticateToken, async (req, res) => {
    
    const userId = req.user.user_id; // Comes from the token
    
    try {
        const db = getDb();
        const allExercises = await db.collection('exercise').find({
            $or: [
                { user: new ObjectId(userId) },              // User-specific documents
                { createdByUserFlag: false }                 // Application default documents
              ] 
        }).toArray();
        
        if (allExercises) {
            res.status(200).json(allExercises);
        }

        }   catch (error) {
            console.error("Error querying exercises", error);
            res.status(500).send('Error getting exercises from the server');
        }
});

router.get('/category/:catName', async (req, res) => {
    const category = req.params.catName;
    console.log(`Attempting to get category ${category}`);


    const exercisesInCategory = await getExercisesWithCategory(category);
    if (exercisesInCategory){
        res.status(200).json(exercisesInCategory);
    }
    else {
        res.status(500).send('Error getting users from the server');
    } 
});

export default router;
