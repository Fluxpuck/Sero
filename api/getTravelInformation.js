//require modules
const fetch = require("node-fetch");
require("dotenv").config();

//require Utilities
const { time } = require('../utils/functions')

/*------------------------------*/

/**
  * get detailed NS train trip information from stationFrom to stationTo from the NS API
  * @param {String} stationcodeFrom Start station code
  * @param {String} stationcodeTo Destination station code
  */
exports.getTravelInformation = async (stationcodeFrom, stationcodeTo) => {

    //construct endpoint
    const endpoint = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/trips?previousAdvices=0&nextAdvices=5&travelClass=2&originTransit=false&excludeReservationRequired=true&originWalk=false&originBike=false&originCar=false&travelAssistanceTransferTime=0&searchForAccessibleTrip=false&destinationTransit=false&destinationWalk=false&destinationBike=false&destinationCar=false&excludeHighSpeedTrains=false&excludeReservationRequired=false&passing=false&fromStation=${stationcodeFrom}&toStation=${stationcodeTo}`

    //fetch and filter endpoint data
    return fetch(endpoint, { //add api key to header
        headers: { 'Ocp-Apim-Subscription-Key': process.env.NSPORTALKEY }
    }).then(function (response) {
        return response.json();
    }).then(function (NS_travel_information) {

        //construct the api payload
        const returnTravels = NS_travel_information.trips,
            getTravelInformation_results = new Map()

        //if no valid trip could be found, please return error message
        if (returnTravels == undefined) return NS_travel_information

        /*  Go through all the provided trips, filter all the information
            and divide them into seperate Maps  */
        returnTravels.forEach(trip => {

            //set trip information
            let idx = trip.idx
            let transfers = trip.transfers
            let tripDuration = (trip.actualDurationInMinutes) ? trip.actualDurationInMinutes : trip.plannedDurationInMinutes
            let duractionDelay = (trip.actualDurationInMinutes - trip.plannedDurationInMinutes)
            let shareURL = trip.shareUrl.uri

            //setup an empty array for leg information
            let legInformation_Array = []

            //loop through all legs
            for (i in trip.legs) {
                let leg = trip.legs[i]

                //define train information
                let trainType = (leg.name).replace(/[0-9]/g, '');
                let trainDirection = leg.direction
                let trainName = `${trainType} ${trainDirection}`

                //define origin (vertrek) information
                let departStation = leg.origin.name
                let departTrack = (leg.origin.actualTrack) ? leg.origin.actualTrack : leg.origin.plannedTrack
                let depart_t_Time = (leg.origin.actualDateTime) ? new Date(leg.origin.actualDateTime) : new Date(leg.origin.plannedDateTime)
                let departTime = time(depart_t_Time)

                //define destination (aankomst) information
                let arriveStation = leg.destination.name
                let arriveTrack = (leg.destination.actualTrack) ? leg.destination.actualTrack : leg.destination.plannedTrack
                let arrive_p_Time = new Date(leg.destination.plannedDateTime)
                let arrive_a_Time = (leg.destination.actualDateTime) ? new Date(leg.destination.actualDateTime) : new Date(leg.destination.plannedDateTime)
                let arriveTime = time(arrive_p_Time)

                //define extra information
                let delay = Math.floor((((arrive_a_Time - arrive_p_Time) % 86400000) % 3600000) / 60000)
                let trainstops = leg.stops.length
                let crowdForecast = leg.crowdForecast
                let punctuality = leg.punctuality

                //check if trainDirection is defined
                if (typeof trainDirection == 'undefined' || !trainDirection.length) { trainDirection = "onbekend" }

                //check if crowdforcast is defined and translate
                if (typeof crowdForecast == 'undefined' || !crowdForecast.length) { crowdForecast = "onbekend" }
                if (crowdForecast === "LOW") crowdForecast = "rustig"
                if (crowdForecast === "MEDIUM") crowdForecast = "normaal"
                if (crowdForecast === "HIGH") crowdForecast = "druk"

                //push all information into Array
                legInformation_Array.push({
                    //train Information
                    trainType: trainType,
                    trainDirection: trainDirection,
                    trainName: trainName,
                    //origin Information
                    departStation: departStation,
                    departTrack: departTrack,
                    departTime: departTime,
                    //destination Information
                    arriveStation: arriveStation,
                    arriveTrack: arriveTrack,
                    arriveTime: arriveTime,
                    //extra Information
                    delay: delay,
                    trainstops: trainstops,
                    crowdForecast: crowdForecast,
                    punctuality: punctuality
                })
            }

            //put everything in a Map
            getTravelInformation_results.set(idx, {
                transfers: transfers,
                tripDuration: tripDuration,
                duractionDelay: duractionDelay,
                crossovers: legInformation_Array,
                shareURL: shareURL
            })

        });

        //return station detauls
        return new Map([...getTravelInformation_results].sort());

    });
};