// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';
import './app/index.modules.js';
import fs from 'fs';

var path = require('path');

global.saveFile = function(path, name) {
    let a = document.createElement('a');
    a.href = path;
    a.download = name;
    a.click();
}

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

if(!fs.existsSync(appRoot)) {
	fs.mkdirSync(appRoot);
}

if(!fs.existsSync(appRoot + '/files')) {
	fs.mkdirSync(appRoot + '/files');
}

if(!fs.existsSync(appRoot + '/vials.json')) {
	let defaultVials = [{"drug":"Ado-Trastuzumab","vial_size":"100,160","billable_units":1,"unit":"mg","$$hashKey":"object:7"},{"drug":"Bevacizumab","vial_size":"100,400","billable_units":10,"unit":"mg","$$hashKey":"object:8"},{"drug":"Azactidine","vial_size":"100","billable_units":1,"unit":"mg","$$hashKey":"object:9"},{"drug":"Belimumab","vial_size":"120,400","billable_units":10,"unit":"mg","$$hashKey":"object:10"},{"drug":"Bendamustine","vial_size":"25,100","billable_units":1,"unit":"mg","$$hashKey":"object:11"},{"drug":"Brentuximab","vial_size":"50","billable_units":1,"unit":"mg","$$hashKey":"object:12"},{"drug":"Carfilzomib","vial_size":"60,30","billable_units":1,"unit":"mg","$$hashKey":"object:13"},{"drug":"Cetuximab","vial_size":"100,200","billable_units":10,"unit":"mg","$$hashKey":"object:14"},{"drug":"Decitabine","vial_size":"50","billable_units":1,"unit":"mg","$$hashKey":"object:15"},{"drug":"Ipilimumab","vial_size":"50,200","billable_units":1,"unit":"mg","$$hashKey":"object:16"},{"drug":"Nelarabine","vial_size":"250","billable_units":50,"unit":"mg","$$hashKey":"object:17"},{"drug":"Nivolumab","vial_size":"100,40","billable_units":1,"unit":"mg","$$hashKey":"object:18"},{"drug":"Paclitaxel abraxane","vial_size":"100","billable_units":1,"unit":"mg","$$hashKey":"object:19"},{"drug":"Pembrolizumab","vial_size":"50","billable_units":1,"unit":"mg","$$hashKey":"object:20"},{"drug":"Pemetrexed","vial_size":"100,500","billable_units":10,"unit":"mg","$$hashKey":"object:21"},{"drug":"Pertuzumab","vial_size":"420","billable_units":1,"unit":"mg","$$hashKey":"object:22"},{"drug":"Plerixafor","vial_size":"24","billable_units":1,"unit":"mg","$$hashKey":"object:23"},{"drug":"Ramucirumab","vial_size":"100,500","billable_units":5,"unit":"mg","$$hashKey":"object:24"},{"drug":"Romidepsin","vial_size":"10","billable_units":1,"unit":"mg","$$hashKey":"object:25"},{"drug":"Romiplostim","vial_size":"250,500","billable_units":10,"unit":"mcgs","$$hashKey":"object:26"},{"drug":"Tocilizumab","vial_size":"80,200,400","billable_units":1,"unit":"mg","$$hashKey":"object:27"},{"drug":"Daratumumab","vial_size":"100,400","billable_units":10,"unit":"mg","$$hashKey":"object:28"},{"drug":"trabectedin","vial_size":"1","billable_units":1,"unit":"mg","$$hashKey":"object:29"},{"$$hashKey":"object:264","drug":"paclitaxel","vial_size":"100","billable_units":"1","unit":"mg"},{"$$hashKey":"object:274","drug":"doxorubicin liposome","vial_size":"20,50","billable_units":"10","unit":"mg"},{"$$hashKey":"object:285","drug":"doxorubicin hcl","vial_size":"20,50","billable_units":"10","unit":"mg"},{"$$hashKey":"object:296","drug":"doxorubicin inj","vial_size":"20,50","billable_units":"10","unit":"mg"},{"$$hashKey":"object:304","drug":"bortezomib","vial_size":"3.5","billable_units":".1","unit":"mg"},{"$$hashKey":"object:1783","drug":"vincristine","billable_units":"1","unit":"mg","vial_size":"5"},{"$$hashKey":"object:1794","drug":"azacitadine","billable_units":"1","unit":"mg","vial_size":"100"},{"$$hashKey":"object:996","drug":"Trastuzumab","vial_size":"440","unit":"mg","billable_units":"10"}];

	fs.writeFileSync(appRoot + '/vials.json', JSON.stringify(defaultVials), 'utf-8');
}

if(!fs.existsSync(appRoot + '/db.sqlite')) {
	fs.writeFileSync(appRoot + '/db.sqlite', '', 'utf-8');
}

import {db} from './back/db/db';
global.sequelize = db();
