import angular from 'angular';

import {HomeComponent} from './components/Home/Home';
import {WasteUploadComponent} from './components/WasteUpload/WasteUpload';
import {PDFUploadComponent} from './components/PDFUpload/PDFUpload';

angular.module('app.components', [])
	.component('home', HomeComponent)
	.component('wasteUpload', WasteUploadComponent)
	.component('pdfUpload', PDFUploadComponent);