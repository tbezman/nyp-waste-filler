// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';
import './app/index.modules.js';
import fs from 'fs';
import {ExportService} from './back/ExportService';
let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('clear-and-backup', () => {
	let exportService = new ExportService();
	exportService.backup().then(() => {
		exportService.files().then(files => {
			files.forEach(file => {
				fs.unlinkSync(file);
			});	

			location.href = "/";
			location.reload();
		})	
	});
})

ipcRenderer.on('clear', () => {
	var tableNames = Object.values(sequelize.models).map(it => it.tableName).forEach(it => {
  		sequelize.query('DELETE FROM ' + it);		
	});


	let exportService = new ExportService();
	exportService.files().then(files => {
		files.forEach(file => {
			try {
			fs.unlinkSync(file);
			}catch (e) {
				console.log(e);
			}
		});	

		app.relaunch();
		app.exit();
	})	
});

ipcRenderer.on('reset-window', () => {
	location.href = "/";
	location.reload();
});

ipcRenderer.on('sequelize-disconnect', () => {
	sequelize.close();
});

var path = require('path');

global.saveFile = function(path, name) {
    let a = document.createElement('a');
    a.href = path;
    a.download = name;
    a.click();
};

global.guid = function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}

console.log('Loaded environment variables:', env);

var app = remote.app;

global.appRoot = path.resolve(app.getPath('appData') + '/nyp-waste-filler');

import {db} from './back/db/db';
global.sequelize = db();
