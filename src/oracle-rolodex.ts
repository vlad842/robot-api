import axios from "axios"
import https from "https";
import { CONFIG } from "./api_config";

const api = axios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false // This will ignore SSL certificate validation
    })
  });

  export const challengeApi = axios.create({
    headers: CONFIG.HEADERS
});
const getPeopleForPlanet = async (residents: string[]) => {
    if (residents.length === 0) {
        return [];
    }
    const peoplePromises = residents.map((resident) => api.get(resident));
    const peopleResponses = await Promise.all(peoplePromises);
    
    return peopleResponses.map((response) => {
        const person = response.data;
        return {
            name: person.name
        };
    });
}

export async function getPlanets() {
    
    try {
        console.log("Fetching all planets...");
        let planets: any[] = [];
        let nextUrl: string | null = "https://swapi.dev/api/planets/";

        while (nextUrl) {
            const response: { data: { results: any[]; next: string | null } } = await api.get(nextUrl);
            planets = planets.concat(response.data.results);
            nextUrl = response.data.next;
        }

        console.log(`Successfully fetched ${planets.length} planets.`);
        return planets;
    } catch (error) {
        console.error("Error fetching planets:", error);
        throw error;
    }
};

export async function checkResidentsAlignment(residents: { name: string }[]) {
    console.log(`Checking Force alignment for ${residents.length} residents...`);
    
    let lightSideCount = 0;
    let darkSideCount = 0;
    const alignmentDetails = [];
    
    for (const resident of residents) {
        const alignment = await checkForceAlignment(resident.name);
        
        if (alignment.alignment === 'light') {
            lightSideCount++;
        } else if (alignment.alignment === 'dark') {
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
}

export async function checkForceAlignment(characterName: string) {
    try {
        const response = await challengeApi.get(
            `${CONFIG.BASE_URL}/resources/oracle-rolodex?name=${encodeURIComponent(characterName)}`
        );
        
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
    } catch (error) {
        console.error(`Error checking force alignment for ${characterName}:`, error);
        return {
            name: characterName,
            alignment: 'unknown',
            notes: ''
        };
    }
}

export function calculateForceBalanceIndex(lightSideCount: number, darkSideCount: number, totalCharacters: number) {
    // Skip calculation if there are no characters
    if (totalCharacters === 0) {
        return 0;
    }
    
    // Calculate FBI using the formula:
    // FBI = (Light Side Characters - Dark Side Characters) / Total Characters
    const fbi = (lightSideCount - darkSideCount) / totalCharacters;
    
    return fbi;
}
export async function findBalancedPlanet() {
    try {
        console.log("Starting to find the balanced planet...");
        const planetsWithFBI = [];

        // Get all planets
        const planets = await getPlanets();
        
        for (const planet of planets) {
            console.log(`Processing planet: ${planet.name}`);
            
            // Skip planets with no residents
            if (planet.residents.length === 0) {
                console.log(`${planet.name} has no residents, skipping`);
                continue;
            }

            // Get residents for this planet
            const residents = await getPeopleForPlanet(planet.residents);
            console.log(`${planet.name} has ${residents.length} residents`);

            const alignmentResults = await checkResidentsAlignment(residents);

            const fbi = calculateForceBalanceIndex(
                alignmentResults.lightSideCount,
                alignmentResults.darkSideCount,
                alignmentResults.totalCount
            );
            
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
}

