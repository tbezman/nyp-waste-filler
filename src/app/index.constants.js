let angular = require('angular');

global.DB_FIELD_MAP = {
    'patient_number': 'MRN',
    'account_number': 'Account Number',
    'charge_code': 'Charge Code',
    'charge_code_descriptor': 'Charge Code Descriptor',
    'units': 'Units',
    'rate': 'Rate',
    'date': 'Date',
    'time': 'Time'
};

global.DRAWABLE_MAP = Object.assign(DB_FIELD_MAP, {
    'charge': "Charge",
    'vial_config': 'Vial Config'
});

global.PREFIX_MAP = {
    'patient_number': 'MRN: ',
    'account_number': 'ACCT: ',
    'vial_config': 'Vial Config: '
}

angular.module('app.constants', [])
    .constant("DB_FIELD_MAP", DB_FIELD_MAP);
