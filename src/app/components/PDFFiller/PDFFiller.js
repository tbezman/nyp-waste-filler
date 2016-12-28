import {
    PDFService
} from '../../../back/PDFService';

import moment from 'moment';

class PDFFillerController {
    constructor($stateParams, StorageService, $scope) {
        this.$scope = $scope;

        this.pdfService = new PDFService();
        this.layout = $stateParams.layout;
        this.pages = [];
        this.hasSetPage = false;

        if ($stateParams.files) {
            this.pdfService.files = $stateParams.files;
        }

        StorageService.watch(this, 'pdf-filler', () => {
            return {
                files: this.pdfService.files,
                layout: this.layout
            }
        }, data => {
            if (!$stateParams.files) {
                this.pdfService.files = data.files;
            }

            this.layout = data.layout || {};

            this.$onInit();
        })
    }

    setPage(file, page) {
        this.hasSetPage = true;

        this.filePage = page;
        this.file = file;

        this.pdfService.getDocument(file).then(pdf => {
            pdf.getPage(page).then(page => {
                this.pdfService.renderToElement(page, '#canvas');
            });
        })
    }

    select(result) {
        PDFLog.destroy({
            where: {
                'wasteLogID': result.id
            }
        }).then(() => {
            PDFLog.build({
                file: this.file,
                page: this.filePage,
                wasteLogID: result.dataValues.id
            }).save();

            this.next();

            this.$scope.$apply();
        })
    }

    next() {
        if(this.page == this.pages.length - 1) {
            this.page = 0;
        } else this.page++;

        this.updatePage();
    }

    previous() {
        if(this.page == 0) {
            this.page = this.pages.length - 1;
        } else this.page--;

        this.updatePage();
    }

    currentPage() {
        return this.pages[this.pages.length % Math.abs(this.page)];
    }

    updatePage() {
        let page = this.currentPage();
        this.setPage(page.file, page.page);
    }

    search() {
        let wheres = [{
            'charge_code_descriptor': {
                $like: '%' + (this.searchDrug || '') + '%'
            }
        }];

        WasteLog.findAll({
            where: sequelize.and(wheres),
            order: [
                ['charge_code_descriptor', 'ASC', 'when', 'ASC']
            ]
        }).then(logs => {
            this.results = logs.filter(log => {
                if (!this.searchDate) return true;

                return moment(this.searchDate).diff(moment(log.dataValues.when), 'days') == 0;
            });
        });
    }

    $onInit() {
        this.hasSetPage = false;
        this.page = 0;

        console.log(this.pdfService.files);
        this.pdfService.files.forEach(file => {
            PDFJS.getDocument(file).then(pdf => {
                for (var i = 1; i <= pdf.numPages; i++) {
                    this.pages.push({
                        file: file,
                        page: i
                    });

                    if (!this.hasSetPage) {
                        this.setPage(file, 1);
                    }
                }
            });
        })
    }
}

import filler from './PDFFiller.html';

export const PDFFillerComponent = {
    template: filler,

    controller: PDFFillerController,
    controllerAs: 'filler',
}
