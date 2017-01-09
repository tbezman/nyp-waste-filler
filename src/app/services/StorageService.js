import fs from 'fs';

export class StorageService {
    constructor($rootScope, $interval) {
        this.$rootScope = $rootScope;
        this.filePath = appRoot + '/files/storage.json';
        this.$interval = $interval;

        this.checkStorageFile();
        this.readStorageFile();

        this.watchers = [];

        this.startWatching();
    }

    checkStorageFile() {
        if(!fs.existsSync(this.filePath)) {
            fs.appendFileSync(this.filePath, '{}', 'utf-8');
        }
    }

    readStorageFile() {
        this.data = JSON.parse(fs.readFileSync(this.filePath));
    }

    startWatching() {
        this.$interval(() => {
            this.updateAll();
        }, 2000);
    }

    updateAll() {
        this.watchers.forEach(watcher => {
            this.update(watcher);
        });

        this.storeData();
    }

    update(watcher) {
        this.data[watcher.label] = watcher.getData();
    }

    storeData() {
        fs.writeFile(appRoot + '/files/storage.json', JSON.stringify(this.data), (err, data) => {
            if (err) console.error(err);
        });
    }

    watch(obj, label, getData, putData) {
        this.watchers.push({obj: obj, label: label, getData: getData, putData: putData});

        if (this.data[label]) {
            putData(this.data[label]);
        }
    }
}
