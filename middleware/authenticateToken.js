import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bad_secret';

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({message: "Unauthorized"});
    }
    //else
    try {
        // Decode and Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();  
    } catch (error) {
        console.error("Token verification failed: ", error);
        return res.status(403).json({message: "Invalid or expired token"});
    }
}

