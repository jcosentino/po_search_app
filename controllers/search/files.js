const fs = require('fs');

const retrieveFilesArray = (path) => {
	return new Promise((resolve, reject) => {
		fs.readdir(path, (err, files) => {
			if(!fs.lstatSync(path).isDirectory()){resolve([]);}
			if(err){
				reject(error);
			} else{
				resolve(files);
			}
		});
	});
};

module.exports.retrieveFilesArray = retrieveFilesArray;