import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Define the damaged system and its corresponding code
const damagedSystem = 'engines';
const systemCode = 'ENG-04';

// GET /status endpoint
app.get('/status', (req: Request, res: Response) => {
    res.json({
        damaged_system: damagedSystem
    });
});

// GET /repair-bay endpoint
app.get('/repair-bay', (req: Request, res: Response) => {
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
app.post('/teapot', (req: Request, res: Response) => {
    res.status(418).send("I'm a teapot");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 