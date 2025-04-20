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
exports.challengeApi = void 0;
exports.getPlanets = getPlanets;
exports.checkResidentsAlignment = checkResidentsAlignment;
exports.checkForceAlignment = checkForceAlignment;
exports.calculateForceBalanceIndex = calculateForceBalanceIndex;
exports.findBalancedPlanet = findBalancedPlanet;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const api_config_1 = require("./api_config");
const api = axios_1.default.create({
    httpsAgent: new https_1.default.Agent({
        rejectUnauthorized: false // This will ignore SSL certificate validation
    })
});
exports.challengeApi = axios_1.default.create({
    headers: api_config_1.CONFIG.HEADERS
});
const getPeopleForPlanet = (residents) => __awaiter(void 0, void 0, void 0, function* () {
    if (residents.length === 0) {
        return [];
    }
    const peoplePromises = residents.map((resident) => api.get(resident));
    const peopleResponses = yield Promise.all(peoplePromises);
    return peopleResponses.map((response) => {
        const person = response.data;
        return {
            name: person.name
        };
    });
});
function getPlanets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Fetching all planets...");
            let planets = [];
            let nextUrl = "https://swapi.dev/api/planets/";
            while (nextUrl) {
                const response = yield api.get(nextUrl);
                planets = planets.concat(response.data.results);
                nextUrl = response.data.next;
            }
            console.log(`Successfully fetched ${planets.length} planets.`);
            return planets;
        }
        catch (error) {
            console.error("Error fetching planets:", error);
            throw error;
        }
    });
}
;
function checkResidentsAlignment(residents) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Checking Force alignment for ${residents.length} residents...`);
        let lightSideCount = 0;
        let darkSideCount = 0;
        const alignmentDetails = [];
        for (const resident of residents) {
            const alignment = yield checkForceAlignment(resident.name);
            if (alignment.alignment === 'light') {
                lightSideCount++;
            }
            else if (alignment.alignment === 'dark') {
                darkSideCount++;
            }
            console.log(`${resident.name}: ${alignment.alignment}`);
            alignmentDetails.push(alignment);
        }
        return {
            lightSideCount,
            darkSideCount,
            totalCount: residents.length,
            alignmentDetails
        };
    });
}
function checkForceAlignment(characterName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield exports.challengeApi.get(`${api_config_1.CONFIG.BASE_URL}/resources/oracle-rolodex?name=${encodeURIComponent(characterName)}`);
            // Decode the base64 encoded oracle notes
            const encodedNotes = response.data.oracle_notes;
            const decodedNotes = Buffer.from(encodedNotes, 'base64').toString('utf-8');
            // Determine alignment based on the decoded notes
            const isLightSide = decodedNotes.toLowerCase().includes('light side');
            const isDarkSide = decodedNotes.toLowerCase().includes('dark side');
            return {
                name: characterName,
                alignment: isLightSide ? 'light' : isDarkSide ? 'dark' : 'unknown',
                notes: decodedNotes
            };
        }
        catch (error) {
            console.error(`Error checking force alignment for ${characterName}:`, error);
            return {
                name: characterName,
                alignment: 'unknown',
                notes: ''
            };
        }
    });
}
function calculateForceBalanceIndex(lightSideCount, darkSideCount, totalCharacters) {
    // Skip calculation if there are no characters
    if (totalCharacters === 0) {
        return 0;
    }
    // Calculate FBI using the formula:
    // FBI = (Light Side Characters - Dark Side Characters) / Total Characters
    const fbi = (lightSideCount - darkSideCount) / totalCharacters;
    return fbi;
}
function findBalancedPlanet() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Starting to find the balanced planet...");
            const planetsWithFBI = [];
            // Get all planets
            const planets = yield getPlanets();
            for (const planet of planets) {
                console.log(`Processing planet: ${planet.name}`);
                // Skip planets with no residents
                if (planet.residents.length === 0) {
                    console.log(`${planet.name} has no residents, skipping`);
                    continue;
                }
                // Get residents for this planet
                const residents = yield getPeopleForPlanet(planet.residents);
                console.log(`${planet.name} has ${residents.length} residents`);
                const alignmentResults = yield checkResidentsAlignment(residents);
                const fbi = calculateForceBalanceIndex(alignmentResults.lightSideCount, alignmentResults.darkSideCount, alignmentResults.totalCount);
                console.log(`${planet.name} FBI: ${fbi.toFixed(4)} (Light: ${alignmentResults.lightSideCount}, Dark: ${alignmentResults.darkSideCount}, Total: ${alignmentResults.totalCount})`);
                planetsWithFBI.push({
                    name: planet.name,
                    fbi: fbi,
                    lightSideCount: alignmentResults.lightSideCount,
                    darkSideCount: alignmentResults.darkSideCount,
                    totalCharacters: alignmentResults.totalCount
                });
            }
            planetsWithFBI.sort((a, b) => Math.abs(a.fbi) - Math.abs(b.fbi));
            const balancedPlanet = planetsWithFBI[0];
            console.log(`Most balanced planet: ${balancedPlanet.name} with FBI: ${balancedPlanet.fbi.toFixed(4)}`);
            return balancedPlanet;
        }
        catch (error) {
            console.error("Error in findBalancedPlanet:", error);
            throw error;
        }
    });
}
