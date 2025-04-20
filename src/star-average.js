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
exports.main = main;
const axios_1 = __importDefault(require("axios"));
// API configuration
const API_KEY = '6b9f4cdf10234d13b84fa62ec784a90a';
const BASE_URL = 'https://makers-challenge.altscore.ai/v1/s1/e2/resources/stars';
const SOLUTION_URL = 'https://makers-challenge.altscore.ai/v1/s1/e2/solution';
const HEADERS = {
    'accept': 'application/json',
    'API-KEY': API_KEY
};
// Sleep utility function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
function fetchAllStars() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get total count from headers
        const headResponse = yield axios_1.default.get(BASE_URL, { headers: HEADERS });
        const totalCount = parseInt(headResponse.headers['x-total-count'] || '0');
        console.log(`Total stars to collect: ${totalCount}`);
        // Fetch all stars
        const allStars = [];
        let page = 1;
        const starsPerPage = 3;
        const totalPages = Math.ceil(totalCount / starsPerPage);
        while (allStars.length < totalCount && page <= totalPages) {
            console.log(`Fetching page ${page}/${totalPages}...`);
            const response = yield axios_1.default.get(`${BASE_URL}?page=${page}`, { headers: HEADERS });
            const stars = response.data;
            allStars.push(...stars);
            // Print response headers for analysis
            console.log(`Headers for page ${page}:`);
            Object.entries(response.headers)
                .filter(([key]) => key.toLowerCase().startsWith('x-'))
                .forEach(([key, value]) => console.log(`  ${key}: ${value}`));
            page++;
            yield sleep(500); // Be gentle with the API
        }
        console.log(`Collected ${allStars.length} stars`);
        return allStars;
    });
}
function calculateAverages(stars) {
    const results = {};
    // 1. Simple average
    results["simple_avg"] = stars.reduce((sum, star) => sum + star.resonance, 0) / stars.length;
    console.log(`Simple Average: ${results['simple_avg']}`);
    // 2. Sort by ID and calculate average
    const idSorted = [...stars].sort((a, b) => a.id.localeCompare(b.id));
    results["id_sorted_avg"] = idSorted.reduce((sum, star) => sum + star.resonance, 0) / idSorted.length;
    console.log(`Average after sorting by ID: ${results['id_sorted_avg']}`);
    // 3. Cumulative resonance (based on hint about building upon previous)
    let cumulativeSum = 0;
    idSorted.forEach(star => {
        cumulativeSum += star.resonance;
    });
    results["cumulative_avg"] = cumulativeSum / idSorted.length;
    console.log(`Cumulative Average: ${results['cumulative_avg']}`);
    // 4. Try sorting by different position coordinates
    for (const coord of ['x', 'y', 'z']) {
        const sortedByCoord = [...stars].sort((a, b) => a.position[coord] - b.position[coord]);
        const avg = sortedByCoord.reduce((sum, star) => sum + star.resonance, 0) / sortedByCoord.length;
        results[`sorted_by_${coord}_avg`] = avg;
        console.log(`Average after sorting by ${coord}: ${avg}`);
    }
    // 5. Try weighting by position (distance from origin)
    let totalWeight = 0;
    let weightedSum = 0;
    stars.forEach(star => {
        const { x, y, z } = star.position;
        const weight = Math.sqrt(x * x + y * y + z * z);
        totalWeight += weight;
        weightedSum += star.resonance * weight;
    });
    results["distance_weighted_avg"] = weightedSum / totalWeight;
    console.log(`Distance-weighted Average: ${results['distance_weighted_avg']}`);
    // 6. Try other sorting methods (resonance value, etc.)
    const resonanceSorted = [...stars].sort((a, b) => a.resonance - b.resonance);
    results["resonance_sorted_avg"] = resonanceSorted.reduce((sum, star) => sum + star.resonance, 0) / resonanceSorted.length;
    console.log(`Average after sorting by resonance: ${results['resonance_sorted_avg']}`);
    return results;
}
function submitAnswer(value) {
    return __awaiter(this, void 0, void 0, function* () {
        // Round to appropriate precision
        const roundedValue = Math.round(value * 100) / 100;
        console.log(`Submitting answer: ${roundedValue}`);
        try {
            const response = yield axios_1.default.post(SOLUTION_URL, { answer: roundedValue }, { headers: Object.assign(Object.assign({}, HEADERS), { 'Content-Type': 'application/json' }) });
            console.log(`Submission response:`, response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error submitting answer:', error);
            return null;
        }
    });
}
function exploreHiddenData(stars) {
    // Check if there are any patterns in the data
    console.log("\nExploring possible patterns in the data...");
    // Check if there's any correlation between ID and resonance
    console.log("First few stars with IDs and resonances:");
    stars.slice(0, 5).forEach((star, i) => {
        console.log(`Star ${i + 1}: ID=${star.id}, resonance=${star.resonance}`);
    });
    // Check if IDs form a sequence
    console.log("\nChecking if IDs form a sequence...");
    const idSorted = [...stars].sort((a, b) => a.id.localeCompare(b.id));
    idSorted.slice(0, 5).forEach((star, i) => {
        console.log(`Star ${i + 1}: ID=${star.id}`);
    });
    // Additional checks can be added here
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stars = yield fetchAllStars();
            // Explore the data for patterns
            exploreHiddenData(stars);
            // Calculate various averages
            const averages = calculateAverages(stars);
            console.log("Calculated averages:", averages);
            // Let's try submitting the simple average first
            //await submitAnswer(averages["simple_avg"]);
            // If that doesn't work, you could try other calculations
            // await submitAnswer(averages["cumulative_avg"]);
            // await submitAnswer(averages["distance_weighted_avg"]);
            // etc.
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
