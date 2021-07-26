//require modules
const fetch = require("node-fetch");
require("dotenv").config();

/*------------------------------*/

/**
  * get NS train station codes from the NS API
  * @param {Array} inputPlaces Array with trainstation names
  */
exports.getStations = async (inputPlaces) => {

    //construct endpoint
    const endpoint = "https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/stations"

    //fetch and filter endpoint data
    return fetch(endpoint, { //add api key to header
        headers: { 'Ocp-Apim-Subscription-Key': process.env.NSPORTALKEY }
    }).then(function (response) {
        return response.json();
    }).then(function (NS_stations) {

        //construct the api payload
        const returnPlaces = NS_stations.payload,
            apiStation_results = new Map()

        /*  Go through all the input places and find the stations information
            based on long, middle and short name or go through all the synonyms names  */
        inputPlaces.forEach(place => {

            //search for long, middle and short station names
            function checkNames(station, p) {
                if (station.namen.lang == p ||
                    station.namen.middel == p ||
                    station.namen.kort == p) {
                    return station
                }
            }
            //check if the station names matches input
            let found = returnPlaces.filter(station =>
                checkNames(station, place))

            //if not found through names, search through synonyms    
            if (found.length <= 0) {
                //search synonym station names
                function checkSynonyms(station, p) {
                    if (station.synoniemen.includes(p)) return station
                }
                //check if the station synonyms matches input
                found = returnPlaces.filter(station =>
                    checkSynonyms(station, place))
            }

            //put everything in a Map
            apiStation_results.set(place, {
                station: found[0]
            })
        });

        //return station detauls
        return apiStation_results
    });
};