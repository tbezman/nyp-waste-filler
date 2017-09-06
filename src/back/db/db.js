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
        storage: appRoot + '/db.sqlite'
    });

    global.WasteLog = sequelize.define('waste_log', {
        account_number: {
            type: Sequelize.STRING,
        },
        patient_number: {
            type: Sequelize.STRING
        },
        mrn: {
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
        wasted_amount: {
            type: Sequelize.DOUBLE
        },
        rate: {
            type: Sequelize.DOUBLE
        },
        when: {
            type: Sequelize.DATE
        }
    }, {
        getterMethods: {
            vial: function() {
                return VialService.getInstance().vialForDrug(this.charge_code_descriptor);
            },
            bestConfig: function() {
                if(!this.vial) return null;

                return VialService.getInstance().bestConfigForVial(this.vial, this.units * this.vial.billable_units);
            },
            vial_config: function() {
                if(!this.bestConfig) return null;

                return '[' + this.bestConfig.config.join(', ') + ']';
            },
            smallest_vial_size: function () {
                let vialSizes = this.vial.vial_size.split(',').map(num => { return parseFloat(num)});
                return Math.min.apply(Math, vialSizes);
            },
            charged_waste: function() {
                if(!this.vial) return null;

                // if this.pdf.only_patient -- return this.wasted_amount;

                return Math.min(this.smallest_vial_size, this.wasted_amount, this.bestConfig.waste);
            },
            wasted_units: function() {
                if(!this.vial) return 0;

                return Math.abs(this.charged_waste / this.vial.billable_units);
            },
            entered_waste: function () {
                if(!this.wasted_amount) return "";
                // console.log('waste:' + this.wasted_amount);
                return this.wasted_amount.toString();
            },
            charge: function() {
                return this.charge_code + ' ' + this.wasted_units.toFixed(2) + '@' + this.rate;
            }
        }
    });

    global.PDFLog = sequelize.define('pdf_log', {
        file: {
            type: Sequelize.STRING
        },
        page: {
            type: Sequelize.INTEGER
        },
        only_patient: {
            type: Sequelize.BOOLEAN
        },
        problematic: {
            type: Sequelize.BOOLEAN
        }
    }, {
        classMethods: {
            readyLogs() {
                return new Promise((resolve, reject) => {
                    this.findAll({include: [WasteLog]})
                        .then(logs => {
                            resolve(logs.filter(log => !log.problematic && log.waste_log));
                        });
                });
            }
        }
    });

    PDFLog.belongsTo(WasteLog);

    sequelize.sync({
            foce: true
        })
        .then(() => {
            console.log('SANC');
        })

    return sequelize;
}
