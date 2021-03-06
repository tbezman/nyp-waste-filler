import {
    ExcelService
} from '../../../back/ExcelService';

class WasteUploadController {
    constructor($scope, StorageService, DB_FIELD_MAP, $state, SpinnerService, CampusService) {
        this.$state = $state;
        this.SpinnerService = SpinnerService;
        this.CampusService = CampusService;

        StorageService.watch(this, 'waste_upload', () => {
            return {
                fileColumns: this.fileColumns,
                columns: this.columns,
                excelFilePath: this.excelService ? this.excelService.filePath : null,
            }
        }, (data) => {
            this.hasInsertedIntoDB = true;
            this.fileColumns = data.fileColumns;
            this.columns = data.columns;
            this.excelService = new ExcelService();
            this.excelService.filePath = data.excelFilePath;
            this.excelReady = true;
        });

        this.$scope = $scope;

        this.dbColumns = {};
        let fields = CAMPUS_IGNORE_FIELDS[this.CampusService.campus];
        for(var key in DB_FIELD_MAP) {
            if(fields.indexOf(key) == -1) this.dbColumns[key] = DB_FIELD_MAP[key];
        }
    }

    selectFiles() {
        document.querySelector('#fakeInput').click();
    }

    onExcelReady() {
        this.excelReady = true;

        this.$scope.$apply(() => {
            this.fileColumns = this.excelService.getColumns();
        });
    }

    isReady() {
        if (!this.columns || !this.fileColumns) return false;

        return this.excelReady && (Object.keys(this.columns).length >= Object.keys(this.dbColumns).length);
    }

    onFileLoad(event) {
        this.hasInsertedIntoDB = false;
        this.excelService = new ExcelService(event.target.result);

        this.excelService.saveData()
            .then(() => {
                this.onExcelReady();
                this.SpinnerService.hide();
            });
    }

    next() {
        //If we already inserted, we don't need to put the records in again
        if (this.hasInsertedIntoDB) {
            this.$state.go('pdf-upload');
            return;
        }

        //Otherwise process
        this.excelService.process(this.columns).then(() => {
            delete this.excelService.workbook;
            this.$state.go('pdf-upload');
        });
    }

    $onInit() {
        this.fileReader = new FileReader();

        this.fileReader.onload = (event) => {
            this.onFileLoad(event)
        };

        angular.element(document.querySelector('#fakeInput')).bind('change', event => {
            this.SpinnerService.show();

            this.fileReader.readAsDataURL(event.target.files[0]);
        });
    }
}

import waste from './WasteUpload.html';

export const WasteUploadComponent = {
    template: waste,

    controller: WasteUploadController,
    controllerAs: 'waste'
}
