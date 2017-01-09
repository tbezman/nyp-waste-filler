import fs from 'fs';
import hummus from 'hummus';
require('pdfjs-dist/build/pdf');
require('pdfjs-dist/web/pdf_viewer'); // Only if you need `PDFJS.PDFViewer`
// Webpack returns a string to the url because we configured the url-loader.
PDFJS.workerSrc = '../node_modules/pdfjs-dist/build/pdf.worker.js';

export class PDFService {
    constructor(DB_FIELD_MAP) {
        this.files = [];
        this.DB_FIELD_MAP = DB_FIELD_MAP;
    }

    getDocument(file) {
        return PDFJS.getDocument(file);
    }


    renderToElement(page, selector, textDelegate, initLayout) {
        let element = typeof(selector) == 'string' ? document.querySelector(selector) : selector;
        let context = element.getContext('2d');
        let viewport = page.getViewport(1);
        let scaledViewport = page.getViewport(element.width / viewport.width);

        context.width = viewport.width;
        context.height = viewport.height;
        let renderContext = {
            canvasContext: context,
            viewport: scaledViewport
        };

        return new Promise((resolve, reject) => {
                page.render(renderContext).then(() => {
                        resolve(renderContext);
                });
        });
    }

    addFile(data) {
        return this.storeData(data);
    }

    storeData(data) {
        return new Promise((resolve, reject) => {
            let buffer = new Buffer(data.split(',')[1], 'base64');
            let path = appRoot + '/files/' + guid() + '.pdf';
            fs.writeFile(path, buffer, (err) => {
                if (!err) {
                    this.files.push(path);
                    resolve(path);
                } else {
                    reject(err);
                }
            })
        });
    }

    resetFiles() {
        this.files = [];
    }

    splitUp() {
        let writer = hummus.createWriter(appRoot + '/files/' + guid() + '.pdf');
    }
}
