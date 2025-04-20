"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Define the damaged system and its corresponding code
const damagedSystem = 'engines';
const systemCode = 'ENG-04';
// GET /status endpoint
app.get('/status', (req, res) => {
    res.json({
        damaged_system: damagedSystem
    });
});
// GET /repair-bay endpoint
app.get('/repair-bay', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Repair Bay</title>
            </head>
            <body>
                <div class="anchor-point">${systemCode}</div>
            </body>
        </html>
    `;
    res.send(html);
});
// POST /teapot endpoint
app.post('/teapot', (req, res) => {
    res.status(418).send("I'm a teapot");
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
