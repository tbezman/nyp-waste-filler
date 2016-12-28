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
