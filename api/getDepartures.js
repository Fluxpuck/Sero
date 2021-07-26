//require modules
const fetch = require("node-fetch");
require("dotenv").config();

//require Utilities
const functions = require('../utils/functions')

/*------------------------------*/

/**
  * get NS departure information from the NS API
  * @param {String} stationcodeFrom Stationcode object
  */
exports.getDepartures = async (stationcodeFrom, maxJourneys) => {

    //construct endpoint
    const endpoint = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?maxJourneys=${(!maxJourneys) ? 10 : maxJourneys}&lang=nl&station=${stationcodeFrom}`

    //fetch and filter endpoint data
    return fetch(endpoint, { //add api key to header
        headers: { 'Ocp-Apim-Subscription-Key': process.env.NSPORTALKEY }
    }).then(function (response) {
        return response.json();
    }).then(function (NS_departures) {

        //construct the api payload
        const returnDepartures = NS_departures.payload.departures,
            departureInformation_Array = [], apiDepartures_results = new Map()

        /*  Go through all the departures and find the all the information
            regarding departure, train and route  */
        returnDepartures.forEach(departure => {

            //depart information
            let direction = departure.direction
            let dTime = new Date(departure.plannedDateTime)
            let departTime = functions.time(dTime)
            let daTime = new Date(departure.actualDateTime)
            let actualTime = functions.time(daTime)
            let track = (departure.actualTrack) ? departure.actualTrack : departure.plannedTrack

            //train status
            let departStatus
            switch (departure.departureStatus) {
                case 'INCOMING':
                    departStatus = 'Inkomend'
                    break;
                case 'ON_STATION':
                    departStatus = 'Op station'
                    break;
            }

            //train information
            let train = (departure.name).replace(/[0-9]/g, '');
            let trainType = departure.trainCategory
            let trainName = departure.product.longCategoryName
            let trainCode = departure.product.number

            //route information            
            let cancelled = departure.cancelled
            let routeStations = departure.routeStations
            let messages = departure.messages

            //extra information
            let timeFromNow = Math.floor((((daTime - new Date()) % 86400000) % 3600000) / 60000)
            let delay = Math.floor((((daTime - dTime) % 86400000) % 3600000) / 60000)

            departureInformation_Array.push({
                //depart information
                direction: direction,
                departtime: departTime,
                actualtime: actualTime,
                departStatus: departStatus,
                departTrack: track,
                //train information
                train: train,
                traintype: trainType,
                trainname: trainName,
                traincode: trainCode,
                //route information 
                cancelled: cancelled,
                routestations: routeStations,
                messages: messages,
                //extra information
                timeFromNow: timeFromNow,
                delay: delay
            })

        });

        //put everything in a Map
        apiDepartures_results.set(stationcodeFrom, {
            departures: departureInformation_Array
        })

        //return station detauls
        return apiDepartures_results
    });
};