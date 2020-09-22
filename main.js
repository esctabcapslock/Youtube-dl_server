let exec = require('child_process').exec;
const fs=require("fs");
const iconv = require('iconv-lite');
const port = 80;
var http = require("http");
var url = require("url");

var text="qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_"

  function iconvDecode(str = '') {
      return iconv.decode(Buffer.from(str, 'binary'), 'CP949'); //https://www.thetopsites.net/article/59635209.shtml , https://namu.wiki/w/CP949
  }



function is_(xx){
    for(i=0;i<xx.length;i++) if(!text.includes(xx[i]))return 0;
    if (xx.includes('/')) return 0;
    else if (xx.includes('C%3A%2F')) return 0;
    else if (xx.includes('../')) return 0;
    else return 1;
}

function is_url(xx,txt){
    if (xx.indexOf(txt)!=0) return 0;
    return is_(xx.substring(txt.length,xx.length));
}

var app = http.createServer(function(요청, 응답){
    var _url = 요청.url;
    var _method=요청.method;
    var parser = 요청.client['HTTPParser'];
    let date=new Date();
    console.log(_url,_method,parser);
   /* if (_method=="POST"){
        console.log('데이타');
        var post_data='';
        
        요청.on('data',(data)=>{
            post_data+=data;
        })
        요청.on('end',()=>{
            console.log('data',decodeURI(post_data),post_data.length);
            응답.writeHead(200);
            응답.end('d');
        })
    }
    else*/
    if (_url=="/"){
        fs.readFile('index.html','utf-8',(E,파일)=>{
            var 확장자 = 'text/html; charset=utf-8'
            응답.writeHead(200, {'Content-Type':확장자} );
            응답.end(파일);
        })
    }
    else if(is_url(_url,'/music/')&&_method=="POST"){
        var post_data='';
        요청.on('data',(data)=>{post_data+=data;});
        요청.on('end',()=>{
            console.log('data',decodeURIComponent(post_data.trim()),post_data.length);
            var code = decodeURIComponent(post_data.trim()).split('=')[1];
            if (!is_(code)){
                응답.writeHead(404);
                응답.end(".");
            }
            else{
                get_youtube(code,(파일,out_mp3)=>{
                    
                    var 주소=out_mp3.toString().trim();
                    console.log('받은주소',주소);
                    //console.log(iconv.decode(out_mp3, 'CP949'));
                    if(파일){
                    var 확장자='application/octet-stream';
                    console.log('주소1',주소);
                    응답.writeHead(200, {'Content-Type':확장자, 'Accept-Ranges': 'bytes', 'Content-Length': 파일.length.toString(),'Content-Transfer-Encoding': 'binary', 'Content-disposition': `attachment; filename=\"${encodeURIComponent(주소)}\"` });    //, '
                        
                    function ff(주소){console.log('주소2',주소); fs.unlinkSync('./'+주소) };
                    응답.end(파일,ff(주소));//파일 제거
                    } else{
                        console.log("오류남");
                        응답.writeHead(404, {'Content-Type':'text'} );
                        응답.end("없슈");
                    }
                })
            }
        })
    }
    else{
        응답.writeHead(404);
        응답.end(".");
    }
});

function get_youtube(code,callback){
    _url='https://youtube.com/watch?v='+code;
    var cmd = `chcp 65001 | youtube-dl.exe -x --audio-format mp3 --audio-quality 0 ${_url}`;
    //youtube-dl -x --audio-format mp3 
    console.log('cmd',cmd);
    exec(cmd, {encoding: 'binary '},(err,result,stderr) => {
        var out  = iconvDecode(result);
        console.log('out',out);
         var xx = out.indexOf('[ffmpeg] Destination:')+'[ffmpeg] Destination:'.length;
        var yy=out.indexOf('.mp3')+'.mp3'.length;
        var out_mp3=out.substring(xx,yy).trim();
        
        console.log('outmp3',out_mp3);
        fs.readFile((out_mp3),(E,파일)=>{
            console.log(파일.length);
            !E ? callback(파일,out_mp3) : callback(0,out_mp3);});
    });
}
                            
app.listen(port);
console.log(`${port}번 포트에서 실행`)