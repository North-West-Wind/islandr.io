import bodyParser = require('body-parser');
import { createConnection } from 'mysql2/promise';
import express = require('express');
const app = express();
app.use(bodyParser.json());

(async () => {
    // Replace with your actual MySQL connection details
    const db = await createConnection({
        host: '3000',
        user: 'root',
        password: 'Welcome@123',
        database: 'GameDB',
    });
    // Endpoint to retrieve user data
    app.get('/getUserData', async (req: any, res: any) => {
        const loggedInUser = localStorage.getItem('loggedInUser'); // Retrieve user from local storage
        if (!loggedInUser) {
            return res.status(403).json({ error: 'User is not logged in' });
        }
        try {
            const [rows]: any = await db.query('SELECT * FROM Users WHERE username = ?', [loggedInUser]);
            res.json(rows[0]);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Endpoint to update user score
    app.post('/updateUserScore', async (req: any, res: any) => {
        const loggedInUser = localStorage.getItem('loggedInUser'); // Retrieve user from local storage
        const { newScore } = req.body;
        if (!loggedInUser) {
            return res.status(403).json({ error: 'User is not logged in' });
        }
        try {
            await db.query('UPDATE Users SET score = ? WHERE username = ?', [newScore, loggedInUser]);
            res.json({ message: 'User score updated successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
})();