import fs from 'fs';

export class CampusService {
	constructor() {
		this.campuses = CAMPUSES;

		this.read().then();
	}

	get campus() {
		if(!this.data) return 'east';

		return this.data.campus;
	}

	set campus(newCampus) {
		this.data.campus = newCampus;

		this.write().then(() => {
			console.log('wrote');
		});
	}

	write() {
		return new Promise((resolve, reject) => {
			console.log('writing');
			fs.writeFile(appRoot + CAMPUS_FILE_LOCATION, JSON.stringify(this.data), 'utf-8', (err) => {
				if(err) reject(err);

				resolve();
			});
		});
	}

	read() {
		return new Promise((resolve, reject) => {
			fs.readFile(appRoot + CAMPUS_FILE_LOCATION, (err, data) => {
				if(err) reject(err);

				data = JSON.parse(data);
				this.data = data;
				resolve(data);
			});
		})
	}
}