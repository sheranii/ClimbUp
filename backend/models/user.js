const fs = require('fs').promises;
const path = require('path');

// Safely point to our JSON file regardless of where the app is run from
const dataFilePath = path.join(__dirname, '../database/users.json');

const User = {
    // 1. Read all users from the JSON file
    async getAll() {
        try {
            const data = await fs.readFile(dataFilePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // If the file is missing or empty, return an empty array
            if (error.code === 'ENOENT') return [];
            throw error;
        }
    },

    // 2. Write the updated users array back to the JSON file
    async saveAll(users) {
        await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2));
    },

    // 3. Find a specific user by their email (used for login and signup)
    async findByEmail(email) {
        const users = await this.getAll();
        return users.find(user => user.email === email);
    },
    
    // 4. Find a specific user by their ID (used for verifying tokens)
    async findById(id) {
        const users = await this.getAll();
        return users.find(user => user.id === id);
    },

    // 5. Create a new user and save them
    async create(userData) {
        const users = await this.getAll();
        
        const newUser = {
            id: Date.now().toString(), // Generate a simple unique ID
            name: userData.name,
            email: userData.email,
            password: userData.password, // This will be hashed before getting here
            climbCoins: 0,
            highestStreak: 0,
            totalScore: 0,
            matchesPlayed: 0,
            topicsChosen: [],
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await this.saveAll(users); // Save the updated list back to the file
        
        return newUser;
    },

    // 6. Update user's game stats
    async updateStats(userId, score, topic) {
        const users = await this.getAll();
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        // Update stats
        users[userIndex].totalScore = (users[userIndex].totalScore || 0) + score;
        users[userIndex].matchesPlayed = (users[userIndex].matchesPlayed || 0) + 1;
        
        // Initialize topicsChosen if it doesn't exist yet
        if (!users[userIndex].topicsChosen) {
             users[userIndex].topicsChosen = [];
        }

        // Add the topic if it was provided
        if (topic) {
            users[userIndex].topicsChosen.push(topic);
        }

        await this.saveAll(users);
        return users[userIndex];
    }
};

module.exports = User;