//require modules
const fetch = require("node-fetch");
require("dotenv").config();

//require Utilities
const functions = require('../utils/functions')

/*------------------------------*/

/**
  * get NS disruptions from the NS API
  * @param {String} flag flag object(can either be 'verstoringen' or 'werkzaamheden')
  */
exports.getDisruptions = async (flag) => {

    //construct endpoint
    const endpoint = `https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/disruptions?type=${flag.type}&actual=${flag.actual}&lang=en`

    //fetch and filter endpoint data
    return fetch(endpoint, { //add api key to header
        headers: { 'Ocp-Apim-Subscription-Key': process.env.NSPORTALKEY }
    }).then(function (response) {
        return response.json();
    }).then(function (NS_disruptions) {

        //construct the api payload
        const returnDisruptions = NS_disruptions.payload,
            disruptionInformation_Array = [], apiDisruptions_results = new Map()

        /*  Go through all the disruptions places and find the stations information
            based on long, middle and short name or go through all the synonyms names  */
        returnDisruptions.forEach(disruption => {

            //general distruption information
            let id = disruption.id
            let type = disruption.type
            let title = disruption.titel

            const verstoring = disruption.verstoring

            //mixed information
            let oorzaak = verstoring.oorzaak
            let gevolg = verstoring.gevolg
            let meldtijd = verstoring.meldtijd
            let baanvakken = verstoring.baanvakken
            let trajecten = verstoring.trajecten
            let geldigheidslijst = verstoring.geldigheidsLijst
            let prioriteit = verstoring.prioriteit

            //disruption information
            if (type == 'verstoring' && flag.type == 'storing') {

                let vst_fase = verstoring.fase
                let vst_faseLabel = verstoring.faseLabel
                let vst_reisadviezen = verstoring.reisadviezen
                let vst_verwachting = verstoring.verwachting
                let vst_alternatiefVervoer = verstoring.alternatiefVervoer

                //put everything in an Array
                disruptionInformation_Array.push({
                    //general information
                    id: id,
                    type: type,
                    title: title,
                    //disruption information
                    oorzaak: oorzaak,
                    gevolg: gevolg,
                    reisadviezen: vst_reisadviezen,
                    verwachting: vst_verwachting,
                    alternatiefvervoer: vst_alternatiefVervoer,
                    meldtijd: meldtijd,
                    geldigheidslijst: geldigheidslijst,
                    baanvakken: baanvakken,
                    trajecten: trajecten,
                    fase: vst_fase,
                    faselabel: vst_faseLabel,
                    prioriteit: prioriteit
                })

                //put everything in a Map
                apiDisruptions_results.set(type, {
                    disruption: disruptionInformation_Array
                })
            }

            //work information
            if (type == 'werkzaamheid' && flag.type == 'werkzaamheid') {
                let wrk_periode = verstoring.periode
                let wrk_extraReistijd = verstoring.extraReistijd

                //put everything in an Array
                disruptionInformation_Array.push({
                    //general information
                    id: id,
                    type: type,
                    title: title,
                    //disruption information
                    oorzaak: oorzaak,
                    gevolg: gevolg,
                    extrareistijd: wrk_extraReistijd,
                    meldtijd: meldtijd,
                    periode: wrk_periode,
                    geldigheidslijst: geldigheidslijst,
                    baanvakken: baanvakken,
                    trajecten: trajecten,
                    prioriteit: prioriteit
                })

                //put everything in a Map
                apiDisruptions_results.set(type, {
                    disruption: disruptionInformation_Array
                })
            }
        })

        //return station detauls
        return apiDisruptions_results
    });
};