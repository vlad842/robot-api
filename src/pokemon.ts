// types.ts - Type definitions

import axios, { AxiosResponse } from "axios";

interface Pokemon {
    name: string;
    height: number;
    types: string[];
  }
  async function fetchAllTypes(): Promise<string[]> {
    const response = await axios.get("https://pokeapi.co/api/v2/type");
    return response.data.results.map((t: any) => t.name).sort();
  }
  
  async function fetchAllPokemon(): Promise<Pokemon[]> {
    const allPokemon: Pokemon[] = [];
    let nextUrl: string | null = "https://pokeapi.co/api/v2/pokemon?limit=100";
  
    while (nextUrl) {
      const response: AxiosResponse = await axios.get(nextUrl);
      const results = response.data.results;
  
      const details = await Promise.all(
        results.map(async (p: any) => {
          const data = await axios.get(p.url);
          return {
            name: data.data.name,
            height: data.data.height, // decimeters
            types: data.data.types.map((t: any) => t.type.name),
          };
        })
      );
  
      allPokemon.push(...details);
      nextUrl = response.data.next;
    }
  
    return allPokemon;
  }

  function groupByType(pokemonList: Pokemon[]): Record<string, Pokemon[]> {
    const typeGroups: Record<string, Record<string, Pokemon>> = {};
  
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
    const finalGroups: Record<string, Pokemon[]> = {};
    for (const type in typeGroups) {
      finalGroups[type] = Object.values(typeGroups[type]);
    }
  
    return finalGroups;
  }
  
  function computeAverageHeightsByType(typeGroups: Record<string, Pokemon[]>): Record<string, number> {
    const result: Record<string, number> = {};
  
    for (const [type, pokemons] of Object.entries(typeGroups)) {
      const total = pokemons.reduce((sum, p) => sum + p.height, 0);
      const averageMeters = (total / pokemons.length) / 10;
      result[type] = parseFloat(averageMeters.toFixed(3));
    }
  
    return result;
  }

  function calculateAverageHeights(pokemonList: Pokemon[]): Record<string, number> {
    const grouped = groupByType(pokemonList);
    const averages: Record<string, number> = {};
  
    for (const [type, pokemons] of Object.entries(grouped)) {
      const totalHeight = pokemons.reduce((sum, p) => sum + p.height, 0);
      const avg = totalHeight / pokemons.length;
      averages[type] = parseFloat(avg.toFixed(3)); // round to 3 decimal places
    }
  
    return averages;
  }
  
  
  // Execute the challenge
  export async function run() {
    try {
        const allTypes = await fetchAllTypes();
        const allPokemon = await fetchAllPokemon();
        const heights = await calculateAverageHeights(allPokemon);
        console.log("heights:", heights);
    
        // const finalSortedResult: Record<string, number> = {};
        // for (const type of allTypes) {
        //   if (averaged[type] !== undefined) {
        //     finalSortedResult[type] = averaged[type];
        //   }
        // }
    
        console.log("Final average heights by type:");
        return { heights };
      } catch (error) {
        console.error("Something went wrong:", error);
      }
  }
