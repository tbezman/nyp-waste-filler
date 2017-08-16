import fs from 'fs';

const G = require('generatorics');

export class VialService {
    constructor() {
        this.vials = JSON.parse(fs.readFileSync(appRoot + '/vials.json', 'utf-8'));
        this.vialCache = {};
    }

    static getInstance() {
        if (!VialService.instance) {
            VialService.instance = new VialService()
        }

        return VialService.instance;
    }

    allPermuationsOfVialSizes(billed, config) {
        let vialSizes = config.vial_size.split(',').map(vial => parseFloat(vial));
        let verbose = [];
        vialSizes.forEach(vialSize => {
            let maxAmount = Math.ceil(parseFloat(billed) / vialSize);
            for (var i = 0; i < maxAmount; i++)
                verbose.push(vialSize);
        });

        let smallest = null;
        let smallestLength = 0;
        let smallestSum = 0;
        for (let subset of G.powerSet(verbose)) {
            let sum = subset.reduce((carry, next) => next + carry, 0);
            let length = subset.length;

            if (sum >= billed) {
                if (!smallest || sum < smallestSum || (sum <= smallestSum && length < smallestLength)) {
                    smallest = subset;
                    smallestLength = length;
                    smallestSum = sum;
                }


            }
        }

        return [{
            waste: billed - smallestSum,
            config: smallest
        }];
    }

    bestConfigForVial(vial, billed) {
        let key = vial.vial_size + ':' + billed;

        if (this.vialCache.hasOwnProperty(key)) {
            return this.vialCache[key];
        }

        let config = this.allPermuationsOfVialSizes(billed, vial)[0];


        this.vialCache[key] = config;

        return config;
    }

    vialForDrug(drug) {
        if (global.drugMap) {
            var foundDrug = null;
            global.drugMap.filter(mapped => mapped.mapped)
                .forEach(mappedDrug => {
                    if (mappedDrug.drug == drug) foundDrug = mappedDrug.mapped;
                })
            if (foundDrug) {
                return foundDrug;
            }
        }

        drug = drug.toLowerCase();

        for (var key in this.vials) {
            let vial = this.vials[key];
            let vialWords = vial.drug.toLowerCase().split(' ');
            var good = true;

            for (var vialKey in vialWords) {
                let vialWord = vialWords[vialKey];

                if (drug.indexOf(vialWord) < 0) good = false;
            }

            if (good) return vial;

        }
    }
}
