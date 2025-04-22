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


function specificVolumeLiquid(pressure: number): number {
    const m = 0.0002462;
    const b = 0.0010377;
    return parseFloat((m * pressure + b).toFixed(6));
  }
  
  // Vapor volume follows exponential decay
  function specificVolumeVapor(pressure: number): number {
    const A = 32.7072;
    const k = 1.7303;
    const C = 0.003518;
    const value = A * Math.exp(-k * pressure) + C;
    return parseFloat(value.toFixed(4));
  }

router.get("/phase-change-diagram", (req: Request, res: Response): void => {
    let pressure = parseFloat(req.query.pressure as string);

    if (isNaN(pressure)) {
      res.status(400).json({
        error: "Invalid or out-of-range pressure. Must be between 0.05 and 10 MPa."
      });
      return;
    }

    pressure = Math.min(Math.max(pressure, 0.05), 10.0); // Clamp to [0.05, 10]

  
    const specific_volume_liquid = specificVolumeLiquid(pressure);
    const specific_volume_vapor = specificVolumeVapor(pressure);
    console.log(specific_volume_vapor);
    res.json({ specific_volume_liquid, specific_volume_vapor });
});

export default router; 