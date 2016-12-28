import Sequelize from 'sequelize';

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
