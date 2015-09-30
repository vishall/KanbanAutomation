var fs = require('fs');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var channelPermCol = [];
    
recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/', function (err, files) {
    var jsonFileCount = 0, jsonFilesIndex = 0;
    var json;
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    channelPermCol =[];
    
    jsonFiles.forEach(function(file) {console.log(file);
        var content =  require(file);
       // console.log(file);
        var newContent = content;
        var newSearch = newContent.match(pathRegExp);
        var newPathsContainer = [];
        if(newSearch != null){
            var uniqueArray = newSearch.filter(function(elem, pos) {
                return newSearch.indexOf(elem) == pos;
            }); 
            for(var jCount =0;jCount<uniqueArray.length;jCount++){ 
               var newPathValue = '"'+uniqueArray[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]),"g");
               newPathsContainer.push(uniqueArray[jCount]);
               newContent = newContent.replace(regExpCheck,newPathValue);
               var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'),"g");
            }
            json = JSON.parse(newContent);
        }
        else{
            json = JSON.parse(newContent);
        }
        jsonFilesIndex++;
        readChannelPerm(json,file);
        if(jsonFiles.length === jsonFilesIndex){
           generateExcelFile(channelPermCol);
        }
    });
});

function readChannelPerm(deviceJSON,file){
     
    if(deviceJSON["data"]) var dataCap  = deviceJSON["data"];
    else var dataCap = " ";
   // file = file.replace("\","/\");
                       // console.log(file;)
    var deviceObj = {
                   "voice":deviceJSON["subType"],
                   "type": deviceJSON["type"],
                   "guid": deviceJSON["id"],
                   "path":file,
                   "dataCap" : dataCap,
                   "price": deviceJSON["price"],
                   "ConsumerNew": deviceJSON["channelPermissions"]["ConsumerNew"],
                   "ConsumerUpgrade": deviceJSON["channelPermissions"]["ConsumerUpgrade"],
                   "VoiceNew": deviceJSON["channelPermissions"]["VoiceNew"],
                   "VoiceUpgrade": deviceJSON["channelPermissions"]["VoiceUpgrade"]
    };
    channelPermCol.push(deviceObj);
}

function generateExcelFile(collection){
    var wb = new excelbuilder.WorkBook();
    var wbOpts = {
        jszip:{
            compression:'DEFLATE'
        }
    }
    var wb2 = new excelbuilder.WorkBook(wbOpts);
    var ws = wb.WorkSheet('New Worksheet');
    var wsOpts = {
        margins:{
            left : .75,
            right : .75,
            top : 1.0,
            bottom : 1.0,
            footer : .5,
            header : .5
        },
        printOptions:{
            centerHorizontal : true,
            centerVertical : false
        },
        view:{
            zoom : 100
        },
        outline:{
            summaryBelow : true
        }
    }
    var ws2 = wb.WorkSheet('ChannelPerm', wsOpts);
    ws.Cell(1,1).String('Type');
    ws.Cell(1,2).String('Sub Type');
    ws.Cell(1,3).String('ConsumerNew');
    ws.Cell(1,4).String('ConsumerUpgrade');
    ws.Cell(1,5).String('VoiceNew');
    ws.Cell(1,6).String('VoiceUpgrade');
    ws.Cell(1,7).String('Price');
    ws.Cell(1,8).String('Data');
    ws.Cell(1,9).String('Path');
     ws.Cell(1,9).String('ID');
    for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(collection[skuCountLength]["type"]);
        ws.Cell(row,2).String(collection[skuCountLength]["voice"]);
        ws.Cell(row,3).String(collection[skuCountLength]["ConsumerNew"]);
        ws.Cell(row,4).String(collection[skuCountLength]["ConsumerUpgrade"]);
        ws.Cell(row,5).String(collection[skuCountLength]["VoiceNew"]);
        ws.Cell(row,6).String(collection[skuCountLength]["VoiceUpgrade"]);
        ws.Cell(row,7).String(collection[skuCountLength]["price"]);
        ws.Cell(row,8).String(collection[skuCountLength]["dataCap"]);
        ws.Cell(row,9).String(collection[skuCountLength]["path"]);
         ws.Cell(row,10).String(collection[skuCountLength]["guid"]);
    }
    ws.Row(1).Height(30);
    ws.Column(1).Width(50);
    var myStyle = wb.Style();
    myStyle.Font.Bold();
    myStyle.Font.Italics();
    myStyle.Font.Family('Times New Roman');
    myStyle.Font.Color('FF0000');
    myStyle.Fill.Color('CCCCCC');
    ws.Cell(1,1).Style(myStyle);
    ws.Cell(1,2).Style(myStyle);
    ws.Cell(1,3).Style(myStyle);
    ws.Cell(1,4).Style(myStyle);
    ws.Cell(1,5).Style(myStyle);
    ws.Cell(1,6).Style(myStyle);
    wb.write("ExcelOutput/Tariff_Paths_Aug_v1.xlsx",function(err){
        console.log("done");
    });
        
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function writeToFile(file,content){
  fs.writeFile(file, content, function(err) {
    if(err) {
        console.log(err);
    } else {
        modifiedFileCount++;
        console.log("Modified Files"+modifiedFileCount);
        
    }
});
     
}


function convertBacktoOriginalState(newContent,file,newPathsContainer){
    var originalState;
    
    newContent = beautify(newContent, { indent_size: 3 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}

