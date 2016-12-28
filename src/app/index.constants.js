let angular = require('angular');

angular.module('app.constants', [])
    .constant("DB_FIELD_MAP", {
			'account_number': 'Account Number',
			'patient_number': 'Patient Number',
			'charge_code': 'Charge Code',
			'units': 'Units',
			'rate': 'Rate',
			'date': 'Date',
			'time': 'Time'
    });
