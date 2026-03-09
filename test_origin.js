import fs from 'fs';

const testForgotOrigin = async (originUrl) => {
    try {
        console.log(`Testing with Origin: ${originUrl}`);
        const response = await fetch("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/api/Account/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": originUrl,
                "Referer": `${originUrl}/login`
            },
            body: JSON.stringify({ email: "kareeem22saad@gmail.com" })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text.substring(0, 200));
        console.log("---");
    } catch (e) {
        console.error(e);
    }
}

const run = async () => {
    await testForgotOrigin("http://localhost:5173");
    await testForgotOrigin("http://127.0.0.1:5173");
    await testForgotOrigin("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net");
}

run();
