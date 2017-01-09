import {dialog} from 'electron';
import JSZip from 'jszip';
import fs from 'fs';

export class ImportService {
	constructor() {
		this.fileDestination = {
			'db.sqlite': '/',
			'storage.json': '/files/'
		}
	}

	import() {
		dialog.showOpenDialog({properties: ['openFile']}, files => {
			this.file = files[0];

			mainWindow.webContents.send('storage-stop');			
			this.unzip().then(() => {
				mainWindow.webContents.send('reset-window');
			});
		});
	}

	handleZipFiles(zip, files) {
		return new Promise((resolve, reject) => {
			var count = 0;
			let length = Object.keys(files).length;

			mainWindow.webContents.send('sequelize-disconnect');

			for(var fileName in files) {
				let file = files[fileName];
				let destination = this.fileDestination.hasOwnProperty(file.name) ? this.fileDestination[file.name] : '/files/';

				zip.file(fileName).async('nodebuffer').then(buffer => {
					console.log('wrote ' + file.name + ' to ' + destination);
					fs.writeFile(appRoot + destination + file.name, buffer, err => {
						if(err) console.error(err);
						count++;
						if(count == length) {
							resolve();
						}
					});
				});
			}
		})

	}

	unzip() {
		let zip = new JSZip();

		return new Promise((resolve, reject) => {
			fs.readFile(this.file, (err, data) => {
				if(err) console.error(err);
				zip.loadAsync(data).then(() => {
					let files = zip.files;

					this.handleZipFiles(zip, files).then(() => {
						resolve();
					});
				});
			});
		})
	}

}