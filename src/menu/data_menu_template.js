import {ImportService} from '../back/ImportService';
import {ExportService} from '../back/ExportService';
import {dialog} from 'electron';
let ipcRenderer = require('electron').ipcRenderer;

export const dataMenuTemplate = {
	label: 'Data',
	submenu: [
		{
			label: 'Import Backup',
			accelerator: 'CmdOrCtrl+E',
			click: () => {
				let importService = new ImportService();

				importService.import();
			}
		},
		{
			label: 'Clear Data & Backup',
			accelerator: 'CmdOrCtrl+D',
			click: () => {
				mainWindow.webContents.send('clear-and-backup');
			}
		},
		{
			label: 'Clear Data',
			click: () => {
				dialog.showMessageBox(null, {
					title: "Confirm",
					type: 'question',
					message: 'Are you sure you want to delete your data?',
					buttons: ['Yes', 'No']
				}, response => {
					if (response == 0) {
						mainWindow.webContents.send('clear');
					}
				});
			}
		}
	]
};