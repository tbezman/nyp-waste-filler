import {
    ExcelService
} from '../../../back/ExcelService';

class WasteUploadController {
    constructor($scope, StorageService, DB_FIELD_MAP, $state) {
		this.$state = $state;

        StorageService.watch(this, 'waste_upload', () => {
            return {
                columns: this.columns,
                excelFilePath: this.excelService ? this.excelService.filePath : null,
            }
        }, (data) => {
            console.log('putting data');
            this.columns = data.columns;
            this.excelService = new ExcelService();
            this.excelService.filePath = data.excelFilePath;
            this.excelService.readData().then(() => {
                this.onExcelReady()
            });
        });

        this.$scope = $scope;

        this.dbColumns = DB_FIELD_MAP;
    }

    selectFiles() {
        document.querySelector('#fakeInput').click();
    }

    onExcelReady() {
        console.log('Excel ready');
        this.excelReady = true;

        this.$scope.$apply(() => {
            this.fileColumns = this.excelService.getColumns();
        });
    }

    isReady() {
        if (!this.columns || !this.fileColumns) return false;

        return this.excelReady && (Object.keys(this.columns).length == Object.keys(this.dbColumns).length);
    }

    onFileLoad(event) {
        this.excelService = new ExcelService(event.target.result);

        this.excelService.saveData()
            .then(() => {
                this.onExcelReady();
            });
    }

    next() {
        this.excelService.process(this.columns).then(() => {
            this.$state.go('pdf-upload');
        });
    }

    $onInit() {
        this.fileReader = new FileReader();

        this.fileReader.onload = (event) => {
            this.onFileLoad(event)
        };

        angular.element(document.querySelector('#fakeInput')).bind('change', event => {
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
