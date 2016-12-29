import fs from 'fs';

class VialConfigController {
    constructor() {
        this.vials = JSON.parse(fs.readFileSync(appRoot + '/vials.json', 'utf-8'));
        this.vialCache = {};
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
        })

        let wastes = [];

        let combinations = this.combinations(verbose).filter(combination => {
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

        console.log(vial);
        console.log(key);

        if (this.vialCache.hasOwnProperty(key)) {
            return this.vialCache[key];
        }

        let config = this.allPermuationsOfVialSizes(billed, vial)[0];

        this.vialCache[key] = config;

        return config;
    }

    matchingVialForDrug(drug) {
        let drugName = drug.split(' ')[0];

        this.vials.forEach(vial => {
            if (vial.drug == drugName) {
                return vial;
            }
        });

        return null;
    }

    add() {
        this.vials.push({});
    }

    delete(vial) {
        this.vials.splice(this.vials.indexOf(vial), 1);
    }

    save() {
        fs.writeFileSync(appRoot + '/vials.json', JSON.stringify(this.vials));
    }

}

import vial from './VialConfig.html';

export const VialConfigComponent = {
    template: vial,

    controller: VialConfigController,
    controllerAs: 'config'
}
