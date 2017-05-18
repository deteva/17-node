/**
 * Created by tmin_lim on 18/05/2017.
 */
const AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-2';
AWS.config.accessKeyId = 'AKIAJHHGR4NYLCYD362Q';
AWS.config.secretAccessKey = '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';

// Listup All Files
var s3 = new AWS.S3();
console.log('endpoint : ', s3.endpoint);
console.log('href', s3.endpoint.href);

// 버킷 내 객체 목록
var bucketName = 's3-examples';
s3.listObjects({Bucket: bucketName}, function(err, data) {
	console.log('== List Object');
	if ( err ) {
		console.error('S3 listObjects Error', err);
		throw err;
	}

	var items = data.Contents;
	items.forEach(function(item) {
		// console.log('item : ', item);
		const path1 = s3.endpoint.href + '/' + bucketName + '/' + item.Key;
		const path2 = 'http://' + s3.endpoint.host + '/' + bucketName + '/' + item.Key;
		console.log('HTTPS url : ', path1);
		console.log('HTTP url : ', path2);
	});
});

// 파일 확인, 메타 데이터
var key = 'offset_64450.jpg';
s3.headObject({Bucket:bucketName, Key:key}, function(err, data) {
	console.log('== HeadObject');
	if ( err && err.statusCode == 404 ) {
		console.log('Not Found');
	}
	else if ( err ) {
		console.error('headObject Error', err);
	}
	else {
		console.log('Exist, Metadata :', data);
	}
});