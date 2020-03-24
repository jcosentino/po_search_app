const fs = require('fs');
const pdf = require('pdf-parse');
const filesJS = require('./files');
const search = require('./search');
const path = require('path');
const PO_ROOT_FOLDER = require('../globals/paths').PO_ROOT_FOLDER;
const PO_FILE_DIR = require('../globals/paths').PO_FILE_DIR;
const poJsonFile = PO_ROOT_FOLDER + 'purchaseOrderProperties.json';
const purchaseOrderPropertiesList = require(poJsonFile);
const poPdfTextFile = PO_ROOT_FOLDER + 'purchaseOrderPdfText.json';
const poPdfTextJsonFile = require(poPdfTextFile);
const validPonumberListFile = PO_ROOT_FOLDER + 'validPonumberList.json';
const validPonumberList = require(validPonumberListFile);

search.checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'purchaseOrderProperties.json', JSON.stringify([]));
search.checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'purchaseOrderPdfText.json', JSON.stringify({}));
search.checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'validPonumberList.json', JSON.stringify({}));

const checkFileCount = async(dir) => {
	const files = await search.getFiles(PO_FILE_DIR);
	let countPdf = 0;
	for(let file of files){
		if(file.split('.pdf').length > 1){countPdf++;}
	}
	return countPdf;
}

const createJsonFile = async(pdfObjList) => {
	const parseJson = await search.getPdfObjList();
	if(fs.existsSync(poJsonFile + '.backup')){
	 	fs.unlinkSync(poJsonFile + '.backup')
		console.log('Successfully deleted the backup file');
		fs.renameSync(poJsonFile, poJsonFile + '.backup');
		console.log('Successfully created the backup file');
		fs.writeFileSync(poJsonFile, JSON.stringify(parseJson));
	} else{
		fs.copyFileSync(poJsonFile, poJsonFile + '.backup');
		fs.unlinkSync(poJsonFile);
		fs.writeFileSync(poJsonFile, JSON.stringify(parseJson));
	}
};

const chooseToRunUpdate = async() => {
	console.log('The PO index is going to be refeshed.');
	const pdfObjList = await search.getPdfObjList();
	await createJsonFile(pdfObjList);
	console.log('Index has been refeshed!');
}

const generateTextList = async() => {
	let obj = {};
	for(let o of Object.keys(validPonumberList)){
		const file = o + '.pdf';
 		const data = fs.readFileSync(PO_FILE_DIR + file);
		const stringifiedData = (await pdf(data)).text;
		obj[o] = stringifiedData;
		console.log(`${file} was pushed!`);
	}
	if(fs.existsSync(poPdfTextFile + '.backup')){
	 	fs.unlinkSync(poPdfTextFile + '.backup')
		console.log('Successfully deleted the backup file');
		fs.renameSync(poPdfTextFile, poPdfTextFile + '.backup');
		console.log('Successfully created the backup file');
		fs.writeFileSync(poPdfTextFile, JSON.stringify(obj));
	} else{
		fs.copyFileSync(poPdfTextFile, poPdfTextFile + '.backup');
		fs.unlinkSync(poPdfTextFile);
		fs.writeFileSync(poPdfTextFile, JSON.stringify(obj));
	}
}

//Container for valid PO number values
const generateValidPonumberList = async() => {
	const parseJson = await search.getPdfObjList();
	let obj = {};
	for(let item of parseJson){
		const poN = item.poN
		console.log(poN)
		obj[item.poN] = 'valid';
	}
	if(fs.existsSync(validPonumberListFile + '.backup')){
	 	fs.unlinkSync(validPonumberListFile + '.backup')
		console.log('Successfully deleted the backup file');
		fs.renameSync(validPonumberListFile, validPonumberListFile + '.backup');
		console.log('Successfully created the backup file');
		fs.writeFileSync(validPonumberListFile, JSON.stringify(obj));
	} else{
		fs.copyFileSync(validPonumberListFile, validPonumberListFile + '.backup');
		fs.unlinkSync(validPonumberListFile);
		fs.writeFileSync(validPonumberListFile, JSON.stringify(obj));
	}
}

const softUpdate = async() => {
	const fileTotal = await checkFileCount();
	console.log(`There are ${fileTotal} ePOs.`);
	const currentCount = Object.keys(validPonumberList).length;
	if(currentCount < fileTotal){
		console.log('The index will be updated.');
		
		const files = await search.getFiles(PO_FILE_DIR);
		for(file of files){
			const fileSplit = file.split('.pdf');
			if(fileSplit.length > 1){
				const poN = fileSplit[0];
				if(validPonumberList[poN] !== 'valid'){
					//Assign the PO Number to valid list
					validPonumberList[poN] = 'valid';
					fs.copyFileSync(validPonumberListFile, validPonumberListFile + '.backup');
					fs.writeFileSync(validPonumberListFile, JSON.stringify(validPonumberList));
					//Send text to the PO Text JSON
					const textData = fs.readFileSync(PO_FILE_DIR + file);
					const stringifiedData = (await pdf(textData)).text;
					poPdfTextJsonFile[poN] = stringifiedData;
					fs.copyFileSync(poPdfTextFile, poPdfTextFile + '.backup');
					fs.writeFileSync(poPdfTextFile, JSON.stringify(poPdfTextJsonFile));
					//Send Vendor object to vendor list JSON
					const vendorListObj = await search.getPdfObj(file);
					fs.copyFileSync(poJsonFile, poJsonFile + '.backup');
					purchaseOrderPropertiesList.push(vendorListObj);
					fs.writeFileSync(poJsonFile, JSON.stringify(purchaseOrderPropertiesList));

					console.log(`New PO: ${file}`);
				}
			}
		}
		console.log('The index was updated!');
	} else{
		console.log('The index does not need to be updated!');
	}
}

const forceFullUpdate = async() => {
	await chooseToRunUpdate();
	await generateTextList();
	await generateValidPonumberList();
}

module.exports.checkFileCount = checkFileCount;
module.exports.createJsonFile = createJsonFile;
module.exports.chooseToRunUpdate = chooseToRunUpdate;
module.exports.generateTextList = generateTextList;
module.exports.generateValidPonumberList = generateValidPonumberList;
module.exports.softUpdate = softUpdate;
module.exports.forceFullUpdate = forceFullUpdate;