const pvoutput = require('pvoutput');
const moment = require('moment');

const pvoutputclient = new pvoutput({
    debug: false,
    apiKey: process.env.PVOUTPUT_APIKEY,
    systemId: process.env.PVOUTPUT_SYSTEMID,
});

const table = process.env.TABLE;

const convertTimestampToMoment = function (date, time) {
    const [hour, minute] = time.split(':');
    let timestamp = moment(date).tz('Europe/Amsterdam');
    timestamp.hour(hour);
    timestamp.minute(minute);
    return timestamp;
};

const writeInflux = function(influxClient, pvoutput) {
    const timestamp = convertTimestampToMoment(pvoutput.date, pvoutput.time);
    const postFix = process.env.FIELD_POSTFIX;

    const fields = {};
    fields['energyGeneration'] = pvoutput.energyGeneration || 0;
    fields['powerGeneration'] = pvoutput.powerGeneration || 0;
    fields['temperature'] =  pvoutput.temperature || undefined;
    fields['voltage'] = pvoutput.voltage || 0;
    fields['site'] = postfix;
    fields['date'] = pvoutput.date;
    fields['time_formatted'] = pvoutput.time;

    return influxClient.write(table)
    .time(timestamp.format('X'), 's')
    .field(fields)
    .then(() => {
        console.debug(`${Date.now()} pv: write success for ${pvoutput.date}, ${pvoutput.time}, timestamp: ${timestamp.format('X')} to table: ${table}`);
        return true;
    })
    .catch(err => console.error(`${Date.now()} pv: write failed ${err.message}`));
};

const logPV = function(influx){
    return pvoutputclient.getStatus().then(function(result) {
        if (result.time) {
            return writeInflux(influx, result);
        } else {
            return false;
        }
    });
};

module.exports = logPV;
