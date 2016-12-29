import Sequelize from 'sequelize';
import {VialService} from '../VialService';

export const db = () => {
    let sequelize = new Sequelize('db', 'username', 'password', {
        dialect: 'sqlite',

        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },

        // SQLite only
        storage: 'db.sqlite'
    });

    global.WasteLog = sequelize.define('waste_log', {
        account_number: {
            type: Sequelize.STRING,
        },
        charge_code: {
            type: Sequelize.STRING
        },
        charge_code_descriptor: {
            type: Sequelize.STRING
        },
        units: {
            type: Sequelize.DOUBLE
        },
        rate: {
            type: Sequelize.DOUBLE
        },
        when: {
            type: Sequelize.DATE
        }
    }, {
        instance_methods: {
            vial() {
                return VialService.getInstance().vialForDrug(this.charge_code_descriptor);
            },
            bestConfig() {
                return VialService.getInstance().bestConfigForVial(this.vial());
            },
            wasted_units() {
                return this.bestConfig().waste / this.vial().billable_units;
            },
            charge() {
                return this.charge_code + ' ' + this.wasted_units() + '@' + this.rate;
            }
        }
    });

    global.PDFLog = sequelize.define('pdf_log', {
        file: {
            type: Sequelize.STRING
        },
        page: {
            type: Sequelize.INTEGER
        }
    })

    PDFLog.belongsTo(WasteLog);

    sequelize.sync({
            foce: true
        })
        .then(() => {
            console.log('SANC');
        })

    return sequelize;
}
