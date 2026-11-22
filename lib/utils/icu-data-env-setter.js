'use strict';

const fs = require('fs');
const path = require('path');

// See https://github.com/CartoDB/support/issues/984
// CartoCSS properties text-wrap-width/text-wrap-character not working
function setICUEnvVariable () {
    if (process.env.ICU_DATA !== undefined) {
        return;
    }

    const roots = [
        path.join(__dirname, '../..', 'node_modules/mapnik/lib/binding'),
        path.join(__dirname, '../../..', 'node_modules/mapnik/lib/binding'),
        '/node_modules/mapnik/lib/binding'
    ];

    roots.some(function (root) {
        let bindings;
        try {
            bindings = fs.readdirSync(root);
        } catch (err) {
            return false;
        }

        return bindings.some(function (binding) {
            const icu = path.join(root, binding, 'share/mapnik/icu');
            if (!fs.existsSync(icu)) {
                return false;
            }
            process.env.ICU_DATA = icu.endsWith(path.sep) ? icu : icu + path.sep;
            return true;
        });
    });
}

module.exports = setICUEnvVariable;
