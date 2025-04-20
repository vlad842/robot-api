import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

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
router.get('/status', (req: Request, res: Response) => {
    // Select a new random system for each request
    selectRandomSystem();
    res.json({
        damaged_system: currentDamagedSystem
    });
});

// GET /repair-bay endpoint
router.get('/repair-bay', (req: Request, res: Response) => {
    const systemCode = systemMapping[currentDamagedSystem];
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.send(`<!DOCTYPE html><html><head><title>Repair</title></head><body><div class="anchor-point">${systemCode}</div></body></html>`);
});

// POST /teapot endpoint
router.post('/teapot', (req: Request, res: Response) => {
    res.status(418).send("I'm a teapot");
});

export default router; 