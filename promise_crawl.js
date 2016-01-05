'use strict';
const promise = require('bluebird');
const gm = require('gm');
const request = require('request');
const cheerio = require('cheerio');
var array = [];
var arr1 = [];
var getAsync = promise.promisify(request.get);
const url = require('url');
const fs = require('fs');
var mmmagic = require('mmmagic');
let requestPromise = require('request-promise');
var magic = new mmmagic.Magic(mmmagic.MAGIC_MIME_TYPE);
//function getPhoto(folder,link,name){
//    return new Promise(function(fullfill,reject){
//        request.get(item).on("error",function(err){
//            reject(err);
//        }).pipe(createWriteStream(folder+name)).on('finish',function(){
//            fullfill(name);
//        }).on('error',function(err){
//            reject(err);
//        })
//    })
//}
let promises = [];
getAsync("https://unsplash.com/").then(function(response){
    var $ = cheerio.load(response.body);
    var image = $(".js-grid-image-container .photo__image");
    for(var i = 0 ; i<image.length; i++){
        array.push(image[i].attribs.src);
    }
    return array;
}).then(function(arr) {
    promise.map(arr,function (val) {
        var ext;
        var extension = url.parse(val).query.split('&');
        //console.log(extension);
        promise.map(extension, function (item) {
            if (item.indexOf('fm') > -1) {
                ext = (item.split('=').pop());
            }
            return ext;
        })
        var stats = fs.existsSync(__dirname+'/img/'+url.parse(val).pathname+'.'+ext);
        if(!stats){
            console.time('download');
            request.get(val)
                    .on('error',function(err){
                            console.log('Download error');
                        })
                    .pipe(fs.createWriteStream(__dirname+'/img/'+url.parse(val).pathname+'.'+ext))
                    .on('finish',function(){
                            console.timeEnd('download');
                            var exists1 = fs.existsSync(__dirname+'/thumb/'+url.parse(val).pathname+'.'+ext);
                                if(!exists1){
                                    if(val != ".DS_Store"){
                                        gm(__dirname+'/img/'+url.parse(val).pathname+'.'+ext).thumb(200,200,__dirname+'/thumb/'+url.parse(val).pathname+'.'+ext,100,function(err){
                                            if(err) console.log(err);
                                            console.log("thumbnail created!");
                                        })
                                    }
                                }
                            var exists2 = fs.existsSync(__dirname+'/BW/'+url.parse(val).pathname+'.'+ext);
                                if(!exists2){
                                    if(val != ".DS_Store"){
                                        gm(__dirname+'/img/'+url.parse(val).pathname+'.'+ext).blackThreshold(200,200,200).write(__dirname+'/BW/'+url.parse(val).pathname+'.'+ext,function(err){
                                            if(err) console.log(err);
                                            console.log("BW created!!");
                                        })
                                    }
                                }
                            console.log('Downloaded');
                        })
                    .on('error',function(err){
                            console.log('Error write to file',err);
                        })
        }
        else {

        }
    })
})


