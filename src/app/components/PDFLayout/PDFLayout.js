import {
    PDFService
} from '../../../back/PDFService';

class PDFLayoutController {
    constructor($stateParams, StorageService, DB_FIELD_MAP, $scope, $state) {
        this.pdfService = new PDFService();
        this.step = 0;
        this.$scope = $scope;
        this.$state = $state;

        this.layout = {};

        if ($stateParams.files) {
            this.pdfService.files = $stateParams.files;
        }

        StorageService.watch(this.pdfService, 'pdf-layout', () => {
            return {
                files: this.pdfService.files,
                layout: this.layout
            }
        }, data => {
            if (this.pdfService.files.length < 1) {
                this.pdfService.files = data.files;
            }

            this.layout = data.layout || {};
        });

        this.dbColumns = DRAWABLE_MAP;
        console.log(this.dbColumns);
    }

    isSelected(db) {
        return this.step == Object.keys(this.dbColumns).indexOf(db);
    }

    select(db) {
        this.step = Object.keys(this.dbColumns).indexOf(db);
    }

    addCoordForColumn(stepKey, x, y) {
        if(!this.layout.hasOwnProperty(stepKey)) {
            this.layout[stepKey] = [];
        }

        this.layout[stepKey].push({x: x, y: y});
    }

    textDelegate(x, y) {
        let stepKey = Object.keys(this.dbColumns)[this.step];
        let nice = this.dbColumns[stepKey];

        this.addCoordForColumn(stepKey, x, y);

        this.$scope.$apply();

        return nice;
    }

    setupCanvasListeners(renderContext) {
        let context =renderContext.canvasContext;
        let viewport = renderContext.viewport;

        context.font = "20px Roboto";

        canvas.onclick = event => {
            let x = event.offsetX;
            let y = event.offsetY;

            let key = Object.keys(DB_FIELD_MAP)[this.step];

            context.fillText(DB_FIELD_MAP[key], x, y);

            if(!this.layout.hasOwnProperty(key)) {
                this.layout[key] = [];
            }

            this.layout[key].push({x: x / viewport.width, y: y / viewport.height});
        }
    }

    onRender(renderContext) {
        this.setupCanvasListeners(renderContext);

        for (var key in this.layout) {
            let positions = this.layout[key];

            positions.forEach(position => {
                renderContext.canvasContext.fillText(DB_FIELD_MAP[key], position.x * renderContext.viewport.width, position.y * renderContext.viewport.height);
            })
        }
    }

    next() {
        this.$state.go('pdf-filler', {layout: this.layout, files: this.pdfService.files});
    }

    $onInit() {
        this.currentFile = this.pdfService.files[0];
        this.page = 1;

        this.pdfService.getDocument(this.currentFile).then(pdf => {
                pdf.getPage(this.page).then(page => {
                    this.pdfService.renderToElement(page, '#canvas').then((renderContext) => { this.onRender(renderContext)});
                })
            })
    }
}

import layout from './PDFLayout.html';

export const PDFLayoutComponent = {
    template: layout,

    controller: PDFLayoutController,
    controllerAs: 'layout'
}
