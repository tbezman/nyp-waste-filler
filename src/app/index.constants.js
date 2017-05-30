let angular = require('angular');

global.DB_FIELD_MAP = {
    'patient_number': 'Patient Number',
    'mrn': 'MRN',
    'account_number': 'Account Number',
    'charge_code': 'Charge Code',
    'charge_code_descriptor': 'Charge Code Descriptor',
    'units': 'Units',
    'rate': 'Rate',
    'date': 'Date',
    'time': 'Time'
};

global.CAMPUS_FILE_LOCATION = '/files/campus.json';
global.CAMPUSES = ['east', 'west'];

global.CAMPUS_IGNORE_FIELDS = {
    'east': [],
    'west': ['patient_number']
};

global.DRAWABLE_MAP = Object.assign(angular.copy(DB_FIELD_MAP), {
    'charge': "Charge",
    'vial_config': 'Vial Config',
    'entered_waste': 'Entered Waste'
});

global.PREFIX_MAP = {
    'mrn': 'MRN: ',
    'account_number': 'ACCT: ',
    'vial_config': 'Vial Config: '
};

angular.module('app.constants', [])
    .constant("DB_FIELD_MAP", DB_FIELD_MAP);
