const fs = require('fs');
const filesJS = require('./files');
const pdf = require('pdf-parse');

const checkExistenceOfJsonFile = (path, file, data) => {
	if(!fs.existsSync(path + file)){
		console.log(`${path}${file} does not exist!`);
		fs.writeFileSync(path + file, data);
	}
}
checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'purchaseOrderProperties.json', JSON.stringify([]));
checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'purchaseOrderPdfText.json', JSON.stringify({}));
checkExistenceOfJsonFile(require('../globals/paths').PO_ROOT_FOLDER, 'validPonumberList.json', JSON.stringify({}));

const PO_ROOT_FOLDER = require('../globals/paths').PO_ROOT_FOLDER;
const PO_FILE_DIR = require('../globals/paths').PO_FILE_DIR;
const poVendorList = require(PO_ROOT_FOLDER + 'purchaseOrderProperties.json');
const poPdfTextList = require(PO_ROOT_FOLDER + 'purchaseOrderPdfText.json');

const getFiles = async(path) => {
	if(path.length === 0){
		console.log(`${path} is empty!`);
		return [];
	}
	return (await filesJS.retrieveFilesArray(path));
};

const checkForWhitespace = (arr, beginIndex) => {
	for(let c = beginIndex; c < arr.length; c++){
		if(arr[c].trim().length > 0){
			return c;
		}
	}
	return beginIndex;
}

const getPdfObj = async(pdf_file) => {
	if(!fs.existsSync(PO_FILE_DIR)){
		console.log('The PO cloud folder does not exist!');
		return undefined;
	}
	if(!fs.existsSync(PO_FILE_DIR + pdf_file)){
		return undefined;
	}
	const data = fs.readFileSync(PO_FILE_DIR + pdf_file);
	const stringifiedData = (await pdf(data)).text;
	const poN = pdf_file.split('.pdf')[0];
	let poStatus = '';
	try{
		poStatus = stringifiedData.split('PO Status').length > 1
				 ? stringifiedData.split('PO Status')[1].split('Approved By')
				 : stringifiedData.split('Status')[1].split('\n');
		poStatus = poStatus[checkForWhitespace(poStatus, 0)].split('\n')[0].trim();
		if(poStatus.charAt(0) === ':'){poStatus = poStatus.substring(1).trim()} //Need to remove :
	} catch(e){
		if(e){console.log(pdf_file + ' PO Status could not be parsed!')}
	}
	let vendorName = '';
	try{
		vendorName = stringifiedData.split(/Vendor Details/gi)[1].split(/(\r\n|\n|\r)/gm);
		vendorName = vendorName[checkForWhitespace(vendorName, 2)].split('\n')[0].trim();
		if(vendorName.charAt(0) === ':'){vendorName = vendorName.substring(1).trim()} //Need to remove :
	} catch(e){
		if(e){console.log(pdf_file + ' vendor name could not be parsed!')}
	}
	let requestedBy = '';
	try{
		requestedBy = stringifiedData.split(/Requested by/gi)[1].split('\n');
		requestedBy = requestedBy[checkForWhitespace(requestedBy, 0)].split('\n')[0].trim();
		if(requestedBy.charAt(0) === ':'){requestedBy = requestedBy.substring(1).trim()} //Need to remove :
	} catch(e){
		if(e){console.log(pdf_file + ' requested by could not be parsed!')}
	}
	let costCenterNumber = '';
	try{
		costCenterNumber = stringifiedData.split(/Cost Center/gi)[1].split('\n');
		costCenterNumber = costCenterNumber[checkForWhitespace(costCenterNumber, 0)].split('\n')[0].trim();
		if(costCenterNumber.charAt(0) === ':'){costCenterNumber = costCenterNumber.substring(1).trim()} //Need to remove :
		costCenterNumber = costCenterNumber.split('GL Code')[0]; //Cost center number preceeds different values between the cloud and the opnrem POs
	} catch(e){
		if(e){console.log(pdf_file + ' cost center name could not be parsed!')}
	}
	let createdDate = '';
	try{
		createdDate = stringifiedData.split(/Created Date/gi)[1].split('Required By')[0];
		while(createdDate.charAt(0) === ':' || createdDate.charAt(0) === ' '){createdDate = createdDate.substring(1).trim()}
		createdDate = createdDate.split('Owner')[0];
		createdDate = createdDate.split('Requested')[0];
	} catch(e){
		if(e){console.log(pdf_file + ' created date could not be parsed!')}
	}

	const pdfObj = {
		'poN': poN,
		'poStatus': poStatus,
		'vendorName': vendorName,
		'requestedBy': requestedBy,
		'costCenterNumber': costCenterNumber,
		'createdDate': createdDate,
		'pathName': (PO_FILE_DIR + pdf_file),
		'fileName': pdf_file
	}
	return pdfObj;
}

const searchForItem = async(searchItem) => {
	if(!fs.existsSync(PO_FILE_DIR)){
		console.log('The PO folder and/or the Approvers folder does not exist!');
		return {
		'poPdf' : undefined,
		'poImg' : undefined
		}
	}
	let poPdf = fs.existsSync(PO_FILE_DIR + searchItem + '.pdf')
				?  `${searchItem}.pdf` : undefined;
	let poImg = fs.existsSync(PO_FILE_DIR + searchItem + '.png')
				?  `${searchItem}.png` : undefined;
	return {
		'poPdf' : poPdf,
		'poImg' : poImg
	}
}

const findApprover = (searchItem) => {
	return (async(searchItem) => {
		const compareItem = (await searchForItem(searchItem)).poImg;
		return compareItem === undefined ? 'undefined' : compareItem;
	})(searchItem);
};

const findPoPdf = (searchItem) => {
	return (async(searchItem) => {
		const compareItem = (await searchForItem(searchItem)).poPdf;
		return compareItem === undefined ? 'undefined' : compareItem;
	})(searchItem);
};

const getPdfObjList = async() => {
	const files = await getFiles(PO_FILE_DIR);
	let f = [];
	for(let file of files){
		console.log(`Checking ${file}...`);
		if(file.split('.pdf').length > 1){
			f.push(await getPdfObj(file));
			console.log(`${file} was pushed!`);
		} else{
			console.log(`${file} was skipped!`);
		}
	}
	return f;
}

const heapSort = (arr, col) => {
  for(let i = Math.floor(arr.length/2) - 1; i >= 0; i--){
    heapify(arr, arr.length, i, col);
  }
  for(let i = arr.length-1; i >= 0; i--){
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0, col);
  }
  return arr;
};

const heapify = (arr, n, i, col) => {
  let largest = i;
  const l = 2*i + 1;
  const r = 2*i + 2;
  if(l < n && arr[largest][col] < arr[l][col]){ largest = l; }
  if(r < n && arr[largest][col] < arr[r][col]){ largest = r; }
  if(largest != i){
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest, col);
  }
};

const sortedPosByColumn = (col) => {
	return heapSort(poVendorList, col);
}

const findPosWithTextInPon = (searchText) => {
	let found = [];
	for(let item of poVendorList){
		const re = new RegExp(searchText, 'gi');
    	const res = item['poN'].match(re);
    	if(res != null){
    		found.push(item);
    	}
	}
	return found;
}

const searchPdfPosForText = async(searchText) => {
	let foundItems = [];
	for(let key of Object.keys(poPdfTextList)){
		const searchField = poPdfTextList[key];
		const re = new RegExp(searchText, 'gi');
    	const res = searchField.match(re);
    	if(res != null){
    		foundItems.push(key);
    	}
	}
	return foundItems;
}

const getPoVendorsOfFoundItems = async(list) => {
	let objList = [];
	for(let item of list){
		objList.push(await getPdfObj(item + '.pdf'));
	}
	return objList;
}

module.exports.getFiles = getFiles;
module.exports.findApprover = findApprover;
module.exports.findPoPdf = findPoPdf;
module.exports.getPdfObj = getPdfObj;
module.exports.getPdfObjList = getPdfObjList;
module.exports.sortedPosByColumn = sortedPosByColumn;
module.exports.findPosWithTextInPon = findPosWithTextInPon;
module.exports.searchPdfPosForText = searchPdfPosForText;
module.exports.getPoVendorsOfFoundItems = getPoVendorsOfFoundItems;
module.exports.checkExistenceOfJsonFile = checkExistenceOfJsonFile;