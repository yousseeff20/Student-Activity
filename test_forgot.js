import fs from 'fs';

const testForgot = async () => {
    try {
        const response = await fetch("https://samanage-api-ekdbfue6gqh7dhd8.westeurope-01.azurewebsites.net/api/Account/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: "kareeem22saad@gmail.com" })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text.substring(0, 200));
    } catch (e) {
        console.error(e);
    }
}

testForgot();
