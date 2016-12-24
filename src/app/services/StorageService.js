import fs from 'fs';

export class StorageService {
	constructor($rootScope, $interval) {
		this.$rootScope = $rootScope;
		this.data = JSON.parse(fs.readFileSync(appRoot + '/files/storage.json', 'utf8'));
		this.$interval = $interval;

		this.watchers = [];

		this.startWatching();
	}

	startWatching() {
		this.$interval(() => {
			this.watchers.forEach(watcher => {
				console.log('Updating ' + watcher.label)
				this.update(watcher);
			})

			this.storeData();
		}, 2000);
	}

	update(watcher) {
		this.data[watcher.label] = watcher.getData();
	}

	storeData() {
		fs.writeFile(appRoot + '/files/storage.json', JSON.stringify(this.data), (err, data) => {
			if(err) console.error(err);
		});
	}

	watch(obj, label, getData, putData) {
		this.watchers.push({obj: obj, label: label, getData: getData, putData: putData});

		if(this.data[label]) {
			putData(this.data[label]);
		}
	}	
}