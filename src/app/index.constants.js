let angular = require('angular');

global.DB_FIELD_MAP = {
    'account_number': 'Account Number',
    'patient_number': 'Patient Number',
    'charge_code_descriptor': 'Charge Code',
    'units': 'Units',
    'rate': 'Rate',
    'date': 'Date',
    'time': 'Time'
};

angular.module('app.constants', [])
    .constant("DB_FIELD_MAP", DB_FIELD_MAP);
