// utils/trefleService.js

const TREFLE_API_KEY = process.env.TREFLE_API_KEY;
const BASE_URL = "https://trefle.io/api/v1";

// search by scientific name
async function searchByScientificName(scientificName) {
  try {
    // build URL with query parameters
    const encodedName = encodeURIComponent(scientificName);
    const url = `${BASE_URL}/plants/search?token=${TREFLE_API_KEY}&q=${encodedName}`; // make fetch request

    const response = await fetch(url);

    // check if response is ok
    if (!response.ok) {
      console.error(`Trefle API error: ${response.status}`);
      return []; // return empty array if api fails
    }

    // parse json
    const data = await response.json();

    // return results array (trefle returns results in data.data)
    return data.data || [];
  } catch (error) {
    // handle errors (network issues, etc.)
    console.error("Error fetching from Trefle API:", error);
    return [];
  }
}

// search by common name
async function searchByCommonName(commonName) {
  try {
    // build URL with query parameters
    const encodedName = encodeURIComponent(commonName);
    const url = `${BASE_URL}/plants/search?token=${TREFLE_API_KEY}&q=${encodedName}`; // make fetch request

    const response = await fetch(url);

    // check if response is ok
    if (!response.ok) {
      console.error(`Trefle API error: ${response.status}`);
      return []; // return empty array if api fails
    }

    // parse json
    const data = await response.json();

    // return results array (trefle returns results in data.data)
    return data.data || [];
  } catch (error) {
    // handle errors (network issues, etc.)
    console.error("Error fetching from Trefle API:", error);
    return [];
  }
}

// main search function (tries scientific first, then common)
async function searchPlant(scientificName, commonName) {
  // try scientific name first
  let results = await searchByScientificName(scientificName);

  // if no results, try common name
  if (results.length === 0) {
    results = await searchByCommonName(commonName);
  }

  // return results (could be empty array, single result, or multiple)
  return results;
}

module.exports = {
  searchPlant,
};
