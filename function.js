/* FILES
 *    Variables needed for files reading
 */
const readdirp = require('readdirp'); // Can read file recusrively into a folder
//const fs = require('fs'); // Is beeing replaced by greaceful-fs on 09.11.2018
const fs = require('graceful-fs');
var ipc = require('electron').ipcMain;
const storage = require('electron-json-storage');
const LINQ = require('node-linq').LINQ;

var files = [];
let FOLDER_TO_WATCH_AND_TO_INDEX = null;
/* !!END FILES!!*/

function search(file, parametres){
    
    let nameRegex = new RegExp(parametres.regex,"i");

    if(fileContentIsIndexableForExtension(file.Name)) {
        
        if(file.Name.match(nameRegex)) {
            return true;
        }else{
            /*let fileExtensionRegex = new RegExp('.*\\.(\\w+)', 'i');
            let extension = file.Name.match(fileExtensionRegex);
            switch(extension){
                    let dataBuffer = fs.readFileSync(file.Path);
                    let text
                    pdf(dataBuffer).then(function(data) {
                        text = data.text
                    });
                    if(text.match(parametres.userString,"g")) {
                        return true;
                    }else {
                        return false;
                    }
                break;
                default:
                    var line = fs.readFileSync(file.Path, "utf8");

                    if(line.match(parametres.userString,"g")) {
                        return true;
                    }else {
                        return false;
                    }
            }*/
        }
    }
    else{
        if(file.Name.match(nameRegex)) {
            return true;
        }else{
            return false;
        }

    }
}


ipc.on('Search', function(event, data){

    files = [];
    reg = "";
    data.word.forEach(word => {
        reg += "(?=.*"+word+")";
    });

    searchInFile = data.searchInFile;

    //fs.appendFileSync("./out.txt", reg );

    readdirp( {root: FOLDER_TO_WATCH_AND_TO_INDEX, directoryFilter: ['!.git', '!*modules' ] })
        .on('data', function (entry) {
            
            let actualFilePath = entry.fullPath;
            let actualFileName = entry.name;
        
            files.push({
                Name : actualFileName,
                Path: actualFilePath.toString(),
            });
           
        })
        .on('err', function(error){
            console.log("error: " + error);
        })
        .on('end', function(msg){

            files.forEach(file => {
                let statsFile = fs.statSync(file.Path);
                file.meta = statsFile;
            });
            
            let dv = new LINQ(files)
                .Where(function(file) { return search(file,{"userString":data, "regex":reg});
                });

            // .OrderBy(function(file) { return file;})
            // .ToArray();
            event.sender.send('returnSearch', dv);
        });

});
/* !!END FUNCTIONS!!*/

ipc.on('getPath', function(event, string){

    storage.get('path', function(error, data) {
        if (error) throw error;
        FOLDER_TO_WATCH_AND_TO_INDEX = data;
        event.sender.send('databasePath', data)
    });
    

});

ipc.on('setPath', function(event, string){
    storage.set('path', string , function(error) {
        if (error) throw error;
        event.sender.send('sendPath', string);
    });

    FOLDER_TO_WATCH_AND_TO_INDEX = string;

});

function fileContentIsIndexableForExtension(fileNameWithExtension){
    if(fileNameWithExtension.length === 0){
        return false;
    }

    let fileExtensionRegex = new RegExp('.*\\.(\\w+)', 'i');

    let extension = fileNameWithExtension.match(fileExtensionRegex);


    if(extension == null){
        return false;
    }

    extension = extension[1];

    if(fileNameWithExtensionIsInList(extension)){
        return true;
    }else{
        return false;
    }
}

function fileNameWithExtensionIsInList(extension){
    //var acceptedExtensions = ["php", "md", "txt", "vsdx", "css", "html", "rtf", "js", "xml", "json", "log", "ipt", "odt", "wks", "wpd", "sql"];
    var acceptedExtensions = ["docx", "doc", "md", "txt", "vsdx", "rtf", "xml", "ipt", "odt","pages"];

    if(acceptedExtensions.indexOf(extension) >= 0){
        return true;
    }else{
        return false;
    }

}