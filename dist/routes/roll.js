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
const database_1 = require("../database");
const router = express_1.default.Router();
// Hilfsfunktion zum Rollen eines Items
function rollItem() {
    return __awaiter(this, arguments, void 0, function* (doubleLuck = false) {
        try {
            // Hole alle Items mit ihren Wahrscheinlichkeiten
            const [items] = yield database_1.pool.query('SELECT * FROM items');
            if (!Array.isArray(items) || items.length === 0) {
                throw new Error('Keine Items in der Datenbank gefunden');
            }
            // Berechne die Gesamtwahrscheinlichkeit
            const totalProbability = items.reduce((sum, item) => {
                const [numerator, denominator] = item.probability.split('/').map(Number);
                return sum + (numerator / denominator);
            }, 0);
            // Generiere eine Zufallszahl zwischen 0 und der Gesamtwahrscheinlichkeit
            let random = Math.random() * totalProbability;
            // Wenn doppeltes Glück aktiv ist, verdopple die Wahrscheinlichkeit für seltene Items
            if (doubleLuck) {
                random = random * 0.5; // Reduziere die Zufallszahl, um seltenere Items wahrscheinlicher zu machen
            }
            // Finde das entsprechende Item
            let cumulativeProbability = 0;
            for (const item of items) {
                const [numerator, denominator] = item.probability.split('/').map(Number);
                cumulativeProbability += numerator / denominator;
                if (random <= cumulativeProbability) {
                    return item;
                }
            }
            // Fallback: Gebe das letzte Item zurück
            return items[items.length - 1];
        }
        catch (error) {
            console.error('Fehler beim Rollen:', error);
            throw error;
        }
    });
}
// Normale Roll-Route
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield rollItem(false);
        res.json(item);
    }
    catch (error) {
        console.error('Fehler beim Rollen:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}));
// Doppeltes Glück Route
router.post('/double', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield rollItem(true);
        res.json(item);
    }
    catch (error) {
        console.error('Fehler beim Doppelten Glück:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}));
exports.default = router;
