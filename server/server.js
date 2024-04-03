const express = require('express');
const app = express();

const PORT = 3000;

app.use(express.static("views"));

app.listen(PORT, "localhost", () => {
	console.log(`Server listening on ${PORT}...`)
});