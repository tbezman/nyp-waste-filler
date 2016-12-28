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
		charge_code: {
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

	sequelize.sync()
		.then(() => {
			console.log('SANC');
		})
}
