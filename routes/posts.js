// import
import express from 'express';

const router = express.Router();

let posts = [
    { id: 1, title: 'Post 1'},
    { id: 2, title: 'Post 2'},
    { id: 3, title: 'Post 3'}
];

router.get('/', (req, resp) => {
    const limit = parseInt(req.query.limit);

    if (!isNaN(limit) && limit > 0) {
        resp.status(200).json(posts.slice(0, limit));
    }
    else {
        resp.status(200).json(posts);
    }
});

//Dynamic get post.
router.get('/:id', (req, resp) => {
    const id = parseInt(req.params.id);
    const post = posts.find((post) => post.id === id);

    if (!post) {
        resp.status(404).json({msg: `A post with the id of ${id} was not found`});
    }
    else {
        resp.status(200).json(post) // look through posts and fitler out the posts that have the same id
    }
});

// create a new post in a post request
router.post('/', (req, res) =>  {
    
    console.log(req.body);
    res.status(201).json(posts);
});

// testing liftledger api
router.post('/newplandata/', (req, res) => {
    console.log(req.body);
});

export default router;