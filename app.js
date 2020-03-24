const express = require('express');
const app = express();
const opn = require('opn');
const build = require('./controllers/search/buildSearchIndex');
const PORT = 3215;

app.use(require('./controllers/routes/routes'));

const checkForUpdates = async() => {
	await build.softUpdate();
}
checkForUpdates();

opn(`http://localhost:${PORT}`);

app.listen(PORT, () => {console.log(`App is listening on port ${PORT}!`)})