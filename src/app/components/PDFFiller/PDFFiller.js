import {
    PDFService
} from '../../../back/PDFService';

import {VialService} from '../../../back/VialService';

import moment from 'moment';

class PDFFillerController {
    constructor($stateParams, StorageService, $scope, $state, SpinnerService) {
        this.$scope = $scope;
        this.$state = $state;
        this.SpinnerService = SpinnerService;

        this.filterDone = false;

        this.pdfService = new PDFService();
        this.layout = $stateParams.layout;
        this.pages = [];
        this.allPages = [];
        this.hasSetPage = false;

        this.vialService = new VialService();

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

            if (!$stateParams.layout) {
                this.layout = data.layout || {};
            }
        })
    }

    setAsProblem() {
        let page = this.currentPage();

        PDFLog.find({
            where: {
                'file': page.file,
                'page': page.page
            }
        }).then(log => {
            if (log) {
                return log.updateAttributes({
                    problematic: !!!log.problematic
                });
            } else {
                return PDFLog.build({
                    file: page.file,
                    page: page.page,
                    problematic: true
                }).save();
            }

        }).then(log => {
            page.problematic = log.problematic;
        });

        this.next();
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

    updateWastedAmount() {
        let page = this.currentPage();

        PDFLog.find({
            where: {
                'file': page.file,
                'page': page.page
            },
            include: [WasteLog]
        }).then(pdf => {
            let log = pdf.waste_log;

            log.updateAttributes({
                wasted_amount: page.wasted_amount
            })
        });

        this.next();
    }

    select(result, only) {
        let page = this.currentPage();

        PDFLog.destroy({
            where: {
                'file': page.file,
                'page': page.page
            }
        }).then(() => {
            PDFLog.build({
                file: page.file,
                page: page.page,
                only_patient: only,
                wasteLogId: result.dataValues.id
            }).save();

            page.done = true;
            page.waste_log = result;
            page.wasted_amount = page.waste_log.wasted_amount;
            page.matchingVial = this.vialService.vialForDrug(result.charge_code_descriptor);

            console.log(page.matchingVial);

            this.$scope.$apply();
        })
    }

    nextIncomplete() {
        let newPage = this.page;

        for (var i = this.page + 1; i < this.pages.length; i++) {
            this.page = i;

            let page = this.currentPage();

            if (!page.done) {
                newPage = i;
                break;
            }
        }

        this.page = newPage;
        this.updatePage();
    }

    next() {
        if (this.page == this.pages.length - 1) {
            this.page = 0;
        } else this.page++;

        this.updatePage();
    }

    previous() {
        if (this.page == 0) {
            this.page = this.pages.length - 1;
        } else this.page--;

        this.updatePage();
    }

    currentPage() {
        return this.pages[this.page];
    }

    updatePage() {
        let page = this.currentPage();
        this.setPage(page.file, page.page);
    }

    updateFilters() {
        this.pages = this.allPages.filter(page => {
            if (this.filterDone) {
                return !page.done;
            }

            return true;
        });

        this.updatePage();
    }

    toggleDone() {
        this.filterDone = !this.filterDone;

        this.updateFilters();
    }

    search() {
        let wheres = [];
        this.SpinnerService.show();

        if (this.searchDrug) {
            wheres.push({
                'charge_code_descriptor': {
                    $like: '%' + (this.searchDrug || '') + '%'
                }
            });
        }

        WasteLog.findAll({
            where: sequelize.and(wheres),
            order: [
                ['when', 'ASC'],
                ['charge_code_descriptor', 'ASC']
            ]
        }).then(logs => {
            this.results = logs.filter(log => {
                if (!this.searchDate) return true;

                return moment(this.searchDate).startOf('day').isSame(moment(log.dataValues.when).startOf('day'));
            });

            this.SpinnerService.hide();
        });
    }

    nextPage() {
        console.log(this.layout);
        this.$state.go('done', {
            layout: this.layout
        });
    }

    $onInit() {
        this.hasSetPage = false;
        this.page = 0;

        this.pages = this.allPages;

        this.SpinnerService.show();

        PDFLog.findAll({include: [WasteLog]})
            .then(logs => {
                this.pdfService.files.forEach(file => {
                    PDFJS.getDocument(file).then(pdf => {
                        for (var i = 1; i <= pdf.numPages; i++) {
                            let page = {
                                file: file,
                                page: i
                            };

                            logs.forEach(log => {
                                if (log.file == file && log.page == i) {
                                    page.done = true;
                                    page.waste_log = log.waste_log;
                                    page.problematic = log.problematic;

                                    if (log.waste_log) {
                                        page.wasted_amount = log.waste_log.wasted_amount;
                                        page.matchingVial = this.vialService.vialForDrug(log.waste_log.charge_code_descriptor);
                                    }
                                }
                            });

                            this.allPages.push(page);


                            if (!this.hasSetPage) {
                                this.setPage(file, 1);
                                this.SpinnerService.hide();
                            }
                        }
                    });
                })
            });
    }
}

import filler from './PDFFiller.html';

export const PDFFillerComponent = {
    template: filler,

    controller: PDFFillerController,
    controllerAs: 'filler',
}
