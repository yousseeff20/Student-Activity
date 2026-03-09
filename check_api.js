import fs from 'fs';

const fetchEvents = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.text();
        console.log(`URL: ${url}`);
        console.log("Status:", response.status);
        console.log("Body:", data.substring(0, 200));
        console.log("---");
    } catch (e) {
        console.error(e);
    }
}

const run = async () => {
    await fetchEvents("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/api/Events?page=1&pageSize=10");
    await fetchEvents("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/api/Public/events?page=1&pageSize=10");
    await fetchEvents("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/api/Events/public");
}

run();
