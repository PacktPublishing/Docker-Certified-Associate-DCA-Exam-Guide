var args = process.argv.slice(2);
const pg = require('pg')
var http=require('http');
var serverip=require('my-local-ip')()
var servername=require('os').hostname();
var fs = require('fs');
var port=args[0];

var appdate=+new Date();

var config = require('./dbconfig.json');

var dbuser = process.env.dbuser || config.dbuser;
var dbpasswd = process.env.dbpasswd || config.dbpasswd;
var dbhost = process.env.dbhost || config.dbhost;
var dbname = process.env.dbname || config.dbname;
var dbport = process.env.dbport || config.dbport || 5432;
var dbpool = process.env.dbpool || config.dbpool || false;

console.log('dbuser: '+dbuser + ' dbpasswd: ' + dbpasswd);
console.log('dbhost: '+dbhost + ' dbname: ' + dbname + ' dbport: ' + dbport);
console.log("Can use environment variables to avoid '/APP/dbconfig.js' file configurations.");

const conString = 'postgres://' + dbuser + ':' + dbpasswd + '@' + dbhost + ':'+ dbport + '/' + dbname;

http.createServer(function (req, res) {
  if (req.url == "/favicon.ico"){return;}
  if (req.url == "/reset"){

    pg.connect(conString, function (err, client, done) {

      if (err) {
        return console.error('error fetching client from pool', err)
      }

      var truncate='TRUNCATE hits';

      console.log(truncate);
        client.query(truncate, function (err, result) {
            done()

            if (err) {
              return console.error('error happened during query', err)
		        }

	    })
    })
    fs.readFile('reset.html', 'utf-8', function (err, page) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.write(page);
      res.end();
    });
    return;
    
   }


  if (req.url == "/Chart.js") {
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      fs.createReadStream('./Chart.js').pipe(res);
      return;
  }

    var clientip = req.connection.remoteAddress;
    var ipaddr = require('ipaddr.js');
    if (ipaddr.IPv4.isValid(clientip)) {
        clientip=ipaddr.toString();
    } else if (ipaddr.IPv6.isValid(clientip)) {
        var ip = ipaddr.IPv6.parse(clientip);
      if (ip.isIPv4MappedAddress()) {
        clientip=ip.toIPv4Address().toString();
      } else {
        if (ip == "::1"){ip="localhost";}
        clientip=ip;
      }
    } else {
      clientip="Unknown";
    }



    //res.write('<p>appserverip: ' + serverip+' appservername: '+servername+' clientip: '+clientip+'</p>\n');
    console.log("Request received from " + clientip);

    pg.connect(conString, function (err, client, done) {

      if (err) {
        return console.error('error fetching client from pool', err)
      }

      var insert='INSERT INTO hits(serverip,clientip,date) VALUES (\''+serverip+'\',\''+clientip+'\',Now())';

      console.log(insert);

        client.query(insert, function (err, result) {
            done()

            if (err) {
              return console.error('error happened during query', err)
            }

            //console.log(result.rows[0])
        })

        var select='select serverip, count (*) as hits from hits group by serverip';


        console.log('SELECT: '+select);

        var serverips="";
        var serverhits="";

        client.query(select, function (err, qresult,serverips,serverhits) {
            console.log(">> "+ JSON.stringify(qresult.rows));
            //console.log("obj "+ typeof(qresult.rows));
            qrows=qresult.rows
            qcount=Object.keys(qrows).length
            console.log(qcount);
            if (qcount === 0){
              fs.readFile('simplestapp.html', 'utf-8', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
                var result = "";
                serverip=serverip.replace("undefined","");
                //res.write('<p>appserverip: ' + serverip+' appservername: '+servername+' clientip: '+clientip+'</p>\n');
                result= data.replace(new RegExp('{{chartData}}', 'g'), '1');
                result= result.replace(new RegExp('{{chartLabels}}','g'), '"'+serverip+'"');
                result = result.replace('{{SERVERIP}}', serverip);
                result = result.replace('{{SERVERNAME}}', servername);
                result = result.replace('{{CLIENTIP}}', clientip);

                console.log(result);
                res.write(result);

                // Closing response
                res.write('</body>\n');
                res.write('</html>\n');
                res.end();
              });
              return;
            }
            totalhits=0;
            for(var i = 0; i < qcount ; i++) {
              //console.log(qresult.rows[i].serverip);
              serverips=serverips + "\"" + qresult.rows[i].serverip +"\","
              //console.log(qresult.rows[i].hits);
              totalhits=parseInt(qresult.rows[i].hits)+totalhits;
              serverhits=serverhits+qresult.rows[i].hits+","
            }
            serverips=serverips.replace("undefined","");
            serverips=serverips.replace(new RegExp(/,$/),"");

            serverhits=serverhits.replace("undefined","");
            serverhits=serverhits.replace(new RegExp(/,$/),"");

            console.log(serverips);
            console.log(serverhits);


            fs.readFile('simplestapp.html', 'utf-8', function (err, data) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
              var result = "";
              //res.write('<p>appserverip: ' + serverip+' appservername: '+servername+' clientip: '+clientip+'</p>\n');
              result= data.replace(new RegExp('{{chartData}}', 'g'), serverhits);
              result= result.replace(new RegExp('{{chartLabels}}','g'), serverips);
              result = result.replace('{{SERVERIP}}', serverip);
              result = result.replace('{{SERVERNAME}}', servername);
              result = result.replace('{{CLIENTIP}}', clientip);
              result = result.replace('{{APPSERVERS}}', qcount);
              result = result.replace('{{TOTALHITS}}', totalhits);
              result = result.replace('{{DBSERVER}}', dbhost);



              console.log(result);
              res.write(result);

              // Closing response
              res.write('</body>\n');
              res.write('</html>\n');
              res.end();
            });
        })

        client.end


    })



}).listen(port);






console.log('[' + appdate + ']  ' + serverip+' - '+servername);

console.log('Server running at http://'+serverip+':'+port+'/');
