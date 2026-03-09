import fs from 'fs';

const fetchSwagger = async () => {
    try {
        const response = await fetch("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/swagger/v1/swagger.json");
        const data = await response.text();
        fs.writeFileSync('swagger.json', data);
        console.log("Status:", response.status);
    } catch (e) {
        console.error(e);
        try {
            const response2 = await fetch("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/swagger/openapi.json");
            const data2 = await response2.text();
            fs.writeFileSync('swagger.json', data2);
            console.log("Status2:", response2.status);
        } catch (e2) { }
    }
}

fetchSwagger();
