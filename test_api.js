const url = "http://localhost:3000/api/roast";

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ url: "https://github.com/expressjs/express" })
})
    .then(res => res.json())
    .then(data => {
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error("Error:", err);
    });
