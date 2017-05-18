/**
 * Created by tmin_lim on 18/05/2017.
 */
var formidable = require('formidable');
var express = require('express');
var fs = require('fs');
var pathUtil = require('path');
var easyimg = require('easyimage');
var async = require('async');
var randomstring = require('randomstring');
var log = require('winston');

var uploadDir = __dirname + '/upload';
const ACCESS_KEY = 'AKIAJHHGR4NYLCYD362Q';
const SECRET_ACCESS_KEY = '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';

if (!fs.existsSync(uploadDir)) {
	console.error('upload,' +
		' thumbnail none!');
	process.exit();
}

// 이미지 파일 목록
var resources = [];


var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
AWS.config.accessKeyId = 'ACCESS_KEY';
AWS.config.secretAccessKey = 'SECRET_ACCESS_KEY'

// Listup All Files
var s3 = new AWS.S3();

var bucketName = 'd-n0518';

var app = express();
app.post('/', uploadImage);
app.get('/', showImages);
app.listen(3000);

function uploadImage(req, res) {
	async.waterfall(
		[
			function (callback) {
				var form = new formidable.IncomingForm();
				form.encoding = 'utf-8';
				form.uploadDir = uploadDir;
				form.keepExtensions = true;
				form.parse(req, function (err, fields, files) {
					if (err) {
						return callback(err, null);
					}

					var title = fields.title;
					// 임시 폴더로 업로드된 파일
					var file = files.file;

					log.info('title is ' + title);
					log.info('file is ' + file);

					callback(null, title, file);
				});
			},
			function (title, file, callback) {
				// 새로운 이미지 파일 이름 생성
				var randomStr = randomstring.generate(10); // 10자리 랜덤
				var newFileName = 'img' + randomStr;
				var extname = pathUtil.extname(file.name); // 확장자
				var contentType = file.type;

				var readStream = fs.createReadStream(file.path);

				// 버킷 내 객체 키 생성
				var itemKey = 'img /' + newFileName + extname;

				var params = {
					Bucket: bucketName,     // 필수
					Key: itemKey,				// 필수
					ACL: 'public-read',
					Body: readStream,
					ContentType: contentType
				}

				s3.putObject(params, function (err, data) {
					if (err) {
						console.error('S3 PutObject Error', err);
						callback(err);
					}
					else {
						// 접근 경로 - 2가지 방법
						var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey;
						var imageSignedUrl = s3.getSignedUrl('getObject', { Bucket: bucketName, Key: itemKey });
						callback(null, title, imageUrl);
					}
				});
			},
			function (title, url, callback) {
				var info = {
					title: title,
					image: url
				}
				resources.push(info);
				callback();
			}
		],
		function (err) {
			if (err) {
				res.sendStatus(500);
			}
			else {
				res.redirect('./');
			}
		});
}

function showImages(req, res) {
	var body = '<html><body>';

	body += '<h3>File List</h3>';
	body += '<ul>';
	for (var i = 0; i < resources.length; i++) {
		var item = resources[i];
		body += '<li>' + '<img src="' + item.image + '" height="100">' + item.title + '</li>';
	}
	body += '</ul>';
	body += '<form method="post" action="/" enctype="multipart/form-data">';
	body += '<input type="text" name="title"><li>';
	body += '<input type="file" name="file"><li>';
	body += '<input type="submit" value="Uplaod"><li>';
	body += '</form>';

	res.send(body);
}