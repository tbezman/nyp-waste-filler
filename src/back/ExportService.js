import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';

export class ExportService {
	constructor() {
		this.defaultFiles = [appRoot + '/db.sqlite', appRoot + '/files/storage.json'];		
	}

	files() {
		return new Promise((resolve, reject) => {
			PDFLog.findAll()
				.then(logs => {
					let files = [];

					logs.forEach(log => {
						if(files.indexOf(log.file) == -1) {
							files.push(log.file);
						}
					})

					return files;
				})
				.then(files => {
					resolve(this.defaultFiles.concat(files));
				});
		});
	}

	createZipOfFiles(files) {
		let zip = new JSZip();

		files.forEach(file => {
			let name = path.basename(file);
			console.log(name);
			zip.file(name, fs.createReadStream(file));
		});

		let filePath = appRoot + '/files/backup-' + guid() + '.zip';

		zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
			.pipe(fs.createWriteStream(filePath))
			.on('finish', () => {
				saveFile(filePath, 'nyp-backup.zip');	
			});

	}

	backup() {
		this.files()
			.then(files => {
				this.createZipOfFiles(files);
			});
	}
}