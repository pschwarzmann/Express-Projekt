"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '3000');
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Database connection
const pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});
// Test database connection
pool.getConnection()
    .then(connection => {
    console.log('Database connection successful');
    connection.release();
})
    .catch(err => {
    console.error('Database connection failed:', err);
});
// Hilfsfunktion zum Parsen der Wahrscheinlichkeit
function parseProbability(prob) {
    const [numerator, denominator] = prob.split('/').map(Number);
    return numerator / denominator;
}
// Routes
app.get('/api/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching all items...');
        const [rows] = yield pool.query('SELECT * FROM probability_roller.items');
        console.log('Found items:', rows);
        res.json(rows);
    }
    catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Roll route - supports both GET and POST
app.get('/api/roll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('GET /api/roll - Rolling for random item');
        // Hole alle Items mit ihren Wahrscheinlichkeiten
        const [items] = yield pool.query('SELECT * FROM probability_roller.items');
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(404).json({ error: 'No items found in database' });
        }
        // Berechne die Gesamtwahrscheinlichkeit
        const totalProbability = items.reduce((sum, item) => sum + parseProbability(item.probability), 0);
        // Generiere eine zufällige Zahl zwischen 0 und der Gesamtwahrscheinlichkeit
        const random = Math.random() * totalProbability;
        // Finde das Item basierend auf der Wahrscheinlichkeit
        let cumulativeProbability = 0;
        let selectedItem = items[0];
        for (const item of items) {
            cumulativeProbability += parseProbability(item.probability);
            if (random <= cumulativeProbability) {
                selectedItem = item;
                break;
            }
        }
        console.log('GET /api/roll - Selected item:', selectedItem);
        res.json(selectedItem);
    }
    catch (error) {
        console.error('Error in GET /api/roll:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
app.post('/api/roll', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('POST /api/roll - Rolling for random item');
        // Hole alle Items mit ihren Wahrscheinlichkeiten
        const [items] = yield pool.query('SELECT * FROM probability_roller.items');
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(404).json({ error: 'No items found in database' });
        }
        // Berechne die Gesamtwahrscheinlichkeit
        const totalProbability = items.reduce((sum, item) => sum + parseProbability(item.probability), 0);
        // Generiere eine zufällige Zahl zwischen 0 und der Gesamtwahrscheinlichkeit
        const random = Math.random() * totalProbability;
        // Finde das Item basierend auf der Wahrscheinlichkeit
        let cumulativeProbability = 0;
        let selectedItem = items[0];
        for (const item of items) {
            cumulativeProbability += parseProbability(item.probability);
            if (random <= cumulativeProbability) {
                selectedItem = item;
                break;
            }
        }
        console.log('POST /api/roll - Selected item:', selectedItem);
        res.json(selectedItem);
    }
    catch (error) {
        console.error('Error in POST /api/roll:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Database configuration:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
    });
});
