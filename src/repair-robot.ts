import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

const systemMapping = {
    navigation: "NAV-01",
    communications: "COM-02",
    life_support: "LIFE-03",
    engines: "ENG-04",
    deflector_shield: "SHLD-05"
};

const availableSystems = Object.keys(systemMapping) as Array<keyof typeof systemMapping>;

let currentDamagedSystem: keyof typeof systemMapping;

function selectRandomSystem() {
    const randomIndex = Math.floor(Math.random() * availableSystems.length);
    currentDamagedSystem = availableSystems[randomIndex];
    console.log(`Selected damaged system: ${currentDamagedSystem}`);
}

// Initialize with a random system
selectRandomSystem();

// GET /status endpoint
app.get('/status', (req: Request, res: Response) => {
    // Select a new random system for each request
    selectRandomSystem();
    res.json({
        damaged_system: currentDamagedSystem
    });
});

// GET /repair-bay endpoint
app.get('/repair-bay', (req: Request, res: Response) => {
    const systemCode = systemMapping[currentDamagedSystem];
    
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