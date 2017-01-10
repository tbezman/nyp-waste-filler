import fs from 'fs';

export class VialService {
    constructor() {
        this.vials = JSON.parse(fs.readFileSync(appRoot + '/vials.json', 'utf-8'));
        this.vialCache = {};
    }

    static getInstance() {
        if(!VialService.instance) {
            VialService.instance = new VialService()
        }

        return VialService.instance;
    }

    k_combinations(set, k) {
        var i, j, combs, head, tailcombs;

        if (k > set.length || k <= 0) {
            return [];
        }

        if (k == set.length) {
            return [set];
        }

        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }

        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            // head is a list that includes only our current element.
            head = set.slice(i, i + 1);
            // We take smaller combinations from the subsequent elements
            tailcombs = this.k_combinations(set.slice(i + 1), k - 1);
            // For each (k-1)-combination we join it with the current
            // and store it to the set of k-combinations.
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
        return combs;
    }

    combinations(set) {
        var k, i, combs, k_combs;
        combs = [];

        for (k = 1; k <= set.length; k++) {
            k_combs = this.k_combinations(set, k);
            for (i = 0; i < k_combs.length; i++) {
                combs.push(k_combs[i]);
            }
        }
        return combs;
    }

    allPermuationsOfVialSizes(billed, config) {
        let vialSizes = config.vial_size.split(',').map(vial => parseFloat(vial));
        let verbose = [];
        vialSizes.forEach(vialSize => {
            let maxAmount = Math.ceil(parseFloat(billed) / vialSize);
            for (var i = 0; i < maxAmount; i++)
                verbose.push(vialSize);
        });

        var allCombos = null;

        if(vialSizes.length == 1) {
            allCombos = [verbose];
        } else allCombos = this.combinations(verbose);

        let wastes = [];

        let combinations = allCombos.filter(combination => {
            let sum = combination.reduce((a, b) => a + b, 0);

            if (sum >= billed)
                wastes.push({
                    waste: sum - billed,
                    config: combination
                });

            return sum >= billed;
        });

        let sorted = wastes.sort((a, b) => {
            return a.waste - b.waste;
        });

        return sorted;
    }

    bestConfigForVial(vial, billed) {
        let key = vial.vial_size + ':' + billed;

        console.log(key, billed);

        if (this.vialCache.hasOwnProperty(key)) {
            return this.vialCache[key];
        }

        let config = this.allPermuationsOfVialSizes(billed, vial)[0];


        this.vialCache[key] = config;

        return config;
    }

    vialForDrug(drug) {
        if(global.drugMap) {
            var foundDrug = null;
            global.drugMap.filter(mapped => mapped.mapped)
                .forEach(mappedDrug => {
                    if(mappedDrug.drug == drug) foundDrug = mappedDrug.mapped;
                })
            if(foundDrug) {
                return foundDrug;
            }
        }

        drug = drug.toLowerCase();

        for(var key in this.vials) {
            let vial = this.vials[key];
            let vialWords = vial.drug.toLowerCase().split(' ');
            var good = true;

            for(var vialKey in vialWords) {
                let vialWord = vialWords[vialKey];

                if(drug.indexOf(vialWord) < 0) good = false;
            }

            if (good) return vial;

        }
    }
}
