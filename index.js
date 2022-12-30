// Módulos:
const https = require('https');

const params = require('./files/params.js'); // Parámetros.
const digitalSignature = require('./files/digitalSignature.js'); // Generación de firma digital.

retryPattern(); // <--- Se realiza el envío del primer paquete.

setInterval(() => retryPattern(), 60000); // <--- Posteriormente, los paquetes siguientes se envían cada 60 segundos.

function retryPattern(time = 10000) {

    // Contenido del reporte a enviar:
    // Para este ejemplo, los datos del paquete se generan aleatoriamente dentro de la misma función de envío.
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

    // Datos de conexión.
    var requestOptions = {
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

    return new Promise((resolve, reject) => {
        const request = https.request(requestOptions, (response) => {
            //console.log(`Código de estado de la respuesta: ${response.statusCode}`);
            //console.log(`Cabeceras de la respuesta: ${JSON.stringify(response.headers)}`);
            response.setEncoding('utf8');

            // En caso de obtener una respuesta desde el servidor 429 o igual o mayor a 500 se hace uso del patrón retry.
            // Se reintenta cada 10 segundos el envío del paquete hasta obtener una respuesta diferente a 429 o mayor a 500.
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
