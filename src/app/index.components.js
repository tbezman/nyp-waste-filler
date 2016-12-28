import angular from 'angular';

import {HomeComponent} from './components/Home/Home';
import {WasteUploadComponent} from './components/WasteUpload/WasteUpload';
import {PDFUploadComponent} from './components/PDFUpload/PDFUpload';
import {WorkFlowComponent} from './components/WorkFlow/WorkFlow';
import {PDFLayoutComponent} from './components/PDFLayout/PDFLayout';

angular.module('app.components', [])
    .component('home', HomeComponent)
    .component('wasteUpload', WasteUploadComponent)
    .component('pdfUpload', PDFUploadComponent)
    .component('workFlow', WorkFlowComponent)
    .component('pdfLayout', PDFLayoutComponent);
