"use strict";
// types.ts - Type definitions
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
exports.run = run;
const axios_1 = __importDefault(require("axios"));
function fetchAllTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.get("https://pokeapi.co/api/v2/type");
        return response.data.results.map((t) => t.name).sort();
    });
}
function fetchAllPokemon() {
    return __awaiter(this, void 0, void 0, function* () {
        const allPokemon = [];
        let nextUrl = "https://pokeapi.co/api/v2/pokemon?limit=100";
        while (nextUrl) {
            const response = yield axios_1.default.get(nextUrl);
            const results = response.data.results;
            const details = yield Promise.all(results.map((p) => __awaiter(this, void 0, void 0, function* () {
                const data = yield axios_1.default.get(p.url);
                return {
                    name: data.data.name,
                    height: data.data.height, // decimeters
                    types: data.data.types.map((t) => t.type.name),
                };
            })));
            allPokemon.push(...details);
            nextUrl = response.data.next;
        }
        return allPokemon;
    });
}
function groupByType(pokemonList) {
    const typeGroups = {};
    for (const pokemon of pokemonList) {
        for (const type of pokemon.types) {
            if (!typeGroups[type]) {
                typeGroups[type] = {};
            }
            // Ensure each Pokémon is counted only once per type using their name as the key
            typeGroups[type][pokemon.name] = pokemon;
        }
    }
    // Convert to array of Pokémon per type
    const finalGroups = {};
    for (const type in typeGroups) {
        finalGroups[type] = Object.values(typeGroups[type]);
    }
    return finalGroups;
}
function computeAverageHeightsByType(typeGroups) {
    const result = {};
    for (const [type, pokemons] of Object.entries(typeGroups)) {
        const total = pokemons.reduce((sum, p) => sum + p.height, 0);
        const averageMeters = (total / pokemons.length) / 10;
        result[type] = parseFloat(averageMeters.toFixed(3));
    }
    return result;
}
function calculateAverageHeights(pokemonList) {
    const grouped = groupByType(pokemonList);
    const averages = {};
    for (const [type, pokemons] of Object.entries(grouped)) {
        const totalHeight = pokemons.reduce((sum, p) => sum + p.height, 0);
        const avg = totalHeight / pokemons.length;
        averages[type] = parseFloat(avg.toFixed(3)); // round to 3 decimal places
    }
    return averages;
}
// Execute the challenge
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allTypes = yield fetchAllTypes();
            const allPokemon = yield fetchAllPokemon();
            const heights = yield calculateAverageHeights(allPokemon);
            console.log("heights:", heights);
            // const finalSortedResult: Record<string, number> = {};
            // for (const type of allTypes) {
            //   if (averaged[type] !== undefined) {
            //     finalSortedResult[type] = averaged[type];
            //   }
            // }
            console.log("Final average heights by type:");
            return { heights };
        }
        catch (error) {
            console.error("Something went wrong:", error);
        }
    });
}
