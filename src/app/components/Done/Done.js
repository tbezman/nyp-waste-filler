import hummus from 'hummus';
import {PDFService} from '../../../back/PDFService';

class DoneController {
    constructor($stateParams, StorageService) {
        this.layout = $stateParams.layout;
        this.pdfService = new PDFService();
        this.readerCache = {};

        StorageService.watch(this, 'done', () => {
            return {
                layout: this.layout
            }
        }, data => {
            if (!this.layout) {
                this.layout = data.layout;
            }
        })

        PDFLog.findAll({
                include: [WasteLog]
            })
            .then(logs => {
                return this.pdfLogs = logs;
            })
            .then(logs => this.writeLogs(logs));
    }

    readerForFile(file) {
        if (!this.readerCache.hasOwnProperty(file)) {
            this.readerCache[file] = hummus.createReader(file);
        }

        return this.readerCache[file];
    }

    writeToLog(index, log, writer) {

        for (var field in this.layout) {
            let positions = this.layout[field];

            positions.forEach(position => {
                context.writeText('text', 600, 800);
            });
        }

        modifier.endContext().writePage();
    }

    writeLogs() {
        let file = appRoot + '/files/' + guid() + '.pdf';
        var writer = hummus.createWriter(file);
        let indexMap = {};

        this.pdfLogs.forEach((log, index) => {
            let page = log.page - 1;
            let reader = this.readerForFile(log.file);
            writer.createPDFCopyingContext(reader).appendPDFPageFromPDF(page);

            indexMap[index] = log;
        });
        writer.end();

        let modifiedPath = appRoot + '/files/' + guid() + '.pdf';
        writer = hummus.createWriter(modifiedPath);

        for(var index in indexMap) {
            this.writeToLog(indexMap[index], index, writer);
        }

        writer.end();
    }
}

import done from './Done.html';

export const DoneComponent = {
    template: done,

    controller: DoneController,
    controllerAs: 'done'
}
