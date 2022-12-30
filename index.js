// Módulos:
const https = require('https');

const params = require('./files/params.js'); // Parámetros.
const digitalSignature = require('./files/digitalSignature.js'); // Generación de firma digital.

// Contenido del reporte a enviar:
var values = {
    "loginCode":"98173", // Constante.
    "reportDate":new Date(),
    "reportType":"2",
    "latitude":Math.floor(Math.random() * -100) + -1,
    "longitude":Math.floor(Math.random() * -100) + -1,
    "gpsDop":1.0,
    "gpsSatellites":3,
    "heading":335,
    "speed":Math.floor(Math.random() * 100) + -1,
    "speedLabel":"GPS",
    "text":"Jonas Olave", // Constante.
    "textLabel":"TAG" // Constante.
};
var jsonValues = JSON.stringify(values); // Conversión a JSON string.

console.log(jsonValues);

// Datos de conexión.
const requestOptions = {
    hostname: params.hostname,
    port: 443,
    path: '/frame',
    method: 'PUT',
    headers: {
        'content-Type': 'application/json; charset=UTF-8',
        'authorization': 'SWSAuth application="'+params.application+'", signature="'+digitalSignature.hashBase64+'", timestamp="'+digitalSignature.timestamp+'"',
        'Content-Length': Buffer.byteLength(jsonValues)
    }
}

retryPattern(requestOptions);

function retryPattern(requestOptions, time = 10000) {

    return new Promise((resolve, reject) => {
        const request = https.request(requestOptions, (response) => {
            //console.log(`Código de estado de la respuesta: ${response.statusCode}`);
            //console.log(`Cabeceras de la respuesta: ${JSON.stringify(response.headers)}`);
            response.setEncoding('utf8');

            if (response.statusCode == 429 || response.statusCode >= 500) {
                setTimeout(() => {
                    return retryPattern(requestOptions);
                }, time);
            } else {
                response.on('data', (respuesta) => {
                    console.log(respuesta);
                });
            }
        });

        request.on('error', (error) => {
            console.log(`Respuesta (error): ${error.message}`);
        });

        request.write(jsonValues);

        request.end();
    })
    .catch((error) => {
        console.log(`Respuesta (error): ${error.message}`);
    });
}
