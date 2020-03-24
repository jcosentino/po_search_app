const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const search = require('../search/search');
const fs = require('fs');
const path = require('path');
const buildSearchIndex = require('../search/buildSearchIndex');
const PO_ROOT_FOLDER = require('../globals/paths').PO_ROOT_FOLDER;
const poVendorList = require(PO_ROOT_FOLDER + 'purchaseOrderProperties.json');
let globalPoVendorList = {};

app.set('views', path.join(__dirname, '../../views')); //second param is the folder 'views'
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/purchases', express.static(require('../globals/paths').PO_FILE_DIR));

app.get('/', async(req, res) => {
	globalPoVendorList = poVendorList;
	res.render('index', {poVendorList: poVendorList});
});

app.get('/sortPon', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('poN')});
});

app.get('/sortPoStatus', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('poStatus')});
});

app.get('/sortVendorName', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('vendorName')});
});

app.get('/sortRequestedBy', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('requestedBy')});
});

app.get('/sortCostCenterNumber', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('costCenterNumber')});
});

app.get('/sortCreatedDate', async(req, res) => {
	globalPoVendorList = search.sortedPosByColumn('poN');
	res.render('index', {poVendorList: search.sortedPosByColumn('createdDate')});
});

app.get('*', (req, res) => {
	res.render('404');
});

//post for file search
app.post('/findPO', async(req, res) => {
	const poNumber = req.body.po_number;
	const poImg = await search.findApprover(poNumber);
	const poPdf = '/purchases/' + (await search.findPoPdf(poNumber));
	//For debugging:
	console.log('PO#:\t\t' + poNumber);
	console.log('IMG:\t\t' + poImg);
	console.log('PDF:\t\t' + poPdf);
	console.log('Vendor Info length:\t\t' + poVendorList.length);
	//end debugging

	res.render('index', {poImg: poImg, poPdf: poPdf, poVendorList: globalPoVendorList});
});

app.post('/findPonWithText', async(req, res) => {
	const textMatchedArray = search.findPosWithTextInPon(req.body.po_search_box);
	if(textMatchedArray.length === 0){
		res.render('index', {poVendorList: poVendorList});
	} else{
		globalPoVendorList = textMatchedArray;
		res.render('index', {poVendorList: textMatchedArray});
	}
});

app.post('/findPoFileWithText', async(req, res) => {
	const textMatchedArray = await search.searchPdfPosForText(req.body.po_search_box);
	if(textMatchedArray === undefined || textMatchedArray.length === 0){
		globalPoVendorList = poVendorList;
		res.render('index', {poVendorList: poVendorList});
	} else{
		const textMatchedVendorList = await search.getPoVendorsOfFoundItems(textMatchedArray);
		globalPoVendorList = textMatchedVendorList;
		res.render('index', {poVendorList: textMatchedVendorList});
	}
});

app.post('/buildSearchIndex', async(req, res) => {
	await buildSearchIndex.forceFullUpdate();
});

module.exports = app;