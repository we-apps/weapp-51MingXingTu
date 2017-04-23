var superagent = require('superagent');
var charset = require('superagent-charset');
charset(superagent);
var cheerio = require('cheerio');
var express = require('express');
var app = express();
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');

var urlencodeParser = bodyParser.urlencoded({extend: false});

app.use(express.static('public'));


var baseUrl = 'http://tu.duowan.com/m/bxgif';
const successCode = 0, failCode = -1;

function isEmpty(obj){
    for (let i in obj){
        return false;
    }
    return true;
}

function uniqueArr(arr) {
    var rs = [];
    for (var i in arr) {
        if (rs.indexOf(arr[i]) != -1) {
            rs.push(arr[i]);
        }
    }
    return rs;
}

function inArr(v, arr) {
    var rs = false;
    for (var i in arr) {
        if (arr[i] == v) {
            rs = true;
            break;
        }
    }
    return rs;
}

app.get('/', function(req, res){
    res.send('<h1>girls now!</h1>');
});

app.get('/tags', function(req, res){
    console.log("get tags");
    res.header("Content-Type", "application/json; charset=utf-8");
    superagent.get(baseUrl)
    .charset('gb2312')
    .end(function (err, sres) {
        var items = [];
        var hrefs = [];
        if (err) {
            console.log('ERR: ' + err);
            res.json({code: failCode, msg: err, sets:items});
            return;
        }
        var $ = cheerio.load(sres.text);
        $('#container .tags span a').each(function (idx, element) {
            var $element = $(element);
            var hrefStr = $element.attr('href');
            var cid = hrefStr.match(/\/a\/(\w+)\.htm[l]?/);
            cid = isEmpty(cid) ? "" : cid[1];
            if (!inArr(hrefStr, hrefs)) {
                hrefs.push(hrefStr);
                items.push({
                    title : $element.text(),
                    href : hrefStr,
                    value : cid,
                    is_show: true,
                });
            }
        });
        res.send({code: successCode, msg: "", data:items});
        console.log('types: ' + JSON.stringify(items));
    });
});

app.get('/girls', function(req, res){
    console.log("get girls");
    // var cid = req.query.c;
    // var mid = req.query.m;
    // var page = req.query.p;

    // console.log("cid: " + cid);
    // console.log("mid: " + mid);
    // console.log("page: " + page);

    // cid = !isEmpty(cid) ? cid : '';
    // page = !isEmpty(page) ? page : '1';
    // var route = '/a/' + cid + (!isEmpty(mid) ? '_'+mid+'_'+page : '') + '.html';
    res.header("Content-Type", "application/json; charset=utf-8");
    // console.log(baseUrl+route);
    superagent.get(baseUrl)
    .charset('gb2312')
    .end(function (err, sres) {
        if (err) {
            console.log('ERR: ' + err);
            // return next(err);
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        $('#content .i-list ul li').each(function (idx, element) {
            var $element = $(element);
            var $subElement = $element.find('.box a img');
            var thumbImgSrc = $subElement.attr('src');
            // var titleEle = $subElement.attr('em a').text;
            items.push({
                // title : !isEmpty(titleEle) ? titleEle[1] : '妹纸',
                href : $element.find('.box a').attr('href'),
                // largeSrc : isEmpty(thumbImgSrc) ? "" : thumbImgSrc.replace('limg', '01'),
                largeSrc : thumbImgSrc,
                thumbSrc : thumbImgSrc,
                smallSrc : thumbImgSrc,
            });
        });
        // $('#wp_page_numbers ul li').each(function (idx, element) {
        //     var $element = $(element);
        //     var $subElement = $element.find('a');
        //     var hrefElement = $subElement.attr('href');
        //     if (!isEmpty(hrefElement)) {
        //         var midStr = $subElement.attr('href').match(/_(\d)_\d\.html/);
        //         if (!isEmpty(midStr)) {
        //             mid = midStr[1];
        //             return false;
        //         }
        //     }
        // });
        res.json({code: successCode, msg: "", data:items});
        console.log('girls data: ' + JSON.stringify(items));
    });
});

app.get('/detail', function(req, res){
    console.log("get detail");
    var cid = req.query.d;

    console.log("cid: " + cid);

    var route = '/a/' + cid + '.html';
    res.header("Content-Type", "application/json; charset=utf-8");
    console.log(baseUrl+route);
    superagent.get(baseUrl+route)
    .charset('gb2312')
    .end(function (err, sres) {
        if (err) {
            console.log('ERR: ' + err);
            // return next(err);
        }
        var $ = cheerio.load(sres.text);
        var items = [];
        var imgList = [];
        var title = "";
        $('#picture p img').each(function (idx, element) {
            var $element = $(element);
            var imgSrc = $element.attr('src');
            // var titleEle = $subElement.attr('alt').match(/<b>(\w+)<\/b>/);
            imgList.push(
                // title : !isEmpty(titleEle) ? titleEle[1] : '',
                // href : $element.find('.pic a').attr('href'),
                // largeSrc : isEmpty(thumbImgSrc) ? "" : thumbImgSrc.replace('limg', '01'),
                // largeSrc : thumbImgSrc,
                // thumbSrc : thumbImgSrc,
                imgSrc
            );
        });
        $('#maincontent .postmeta .metaRight h2').each(function (idx, element) {
            var $element = $(element);
            var $subElement = $element.find('a');
            title = $subElement.text();
        });
        res.json({code: successCode, msg: "", title: title, data:{imgList:imgList}});
        // console.log('datail data: ' + JSON.stringify(items));
    });
});

var server = app.listen(process.env.PORT || 8080, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log("应用实例，访问地址为：http://%s:%s",host,port);
})
