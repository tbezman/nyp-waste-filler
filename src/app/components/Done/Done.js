class DoneController {
    constructor() {
        PDFLog.findAll({})
            .then(logs => {
                this.pdfLogs = logs;
                console.log(this.pdfLogs);
            })
    }
}

import done from './Done.html';

export const DoneComponent = {
    template: done,

    controller: DoneController,
    controllerAs: 'done'
}
