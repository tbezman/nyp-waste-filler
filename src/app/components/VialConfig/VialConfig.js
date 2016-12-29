import fs from 'fs';

class VialConfigController {
        constructor() {

        this.vials = JSON.parse(fs.readFileSync(appRoot + '/vials.json', 'utf-8'));
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

    $onInit() {
        this.hello = "world";
    }
}

import vial from './VialConfig.html';

export const VialConfigComponent = {
    template: vial,

    controller: VialConfigController,
    controllerAs: 'config'
}
