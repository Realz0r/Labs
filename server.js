var
    http = require('http'),
    fs = require('fs'),
    ejs = require('ejs'),
    server = new http.Server().listen(1337, '127.0.0.1'),
    parseString = require('xml2js').parseString,
    js2xmlparser = require("js2xmlparser"),
    arrayOfDependencies = ['/main_styles.css', '/handlers.js', '/helpers.js'],
    actualWebPage;

renderWebPage();
server.on('request', function(req, res) {
    var
        pathReq = req.url;

    if (pathReq == "/") {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(actualWebPage);
    }

    else if (pathReq == '/saveFile') {
        var
            data = '',
            newTextXML;

        req.on('data', function(chunk) {
            data += chunk.toString();
        });
        req.on('end', function() {

                newTextXML = js2xmlparser("Parameters", {Parameter: JSON.parse(data)});
                fs.writeFile(__dirname + '/xmlFiles/input.xml', newTextXML, function(err) {
                    if(err) {
                        res.writeHead(502, {'Content-Type': 'text/plain'});
                        res.end("Пичалька");
                        console.log(err);
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end("Успех");
                        renderWebPage();
                        console.log("Файл сохранен.");
                    }
                });

        });
    }

    else if (arrayOfDependencies.indexOf(pathReq) != -1) {
        fs.readFile(__dirname + "/public" + pathReq, function(err, data) {
            res.setHeader('Content-Type', 'charset=utf-8');
            res.end(data);
        });
    }
    else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(404);
        res.end('Дружок, здесь ловить нечего, доступные ресурсы: ' + arrayOfDependencies.join(', '));
    }
});

function renderWebPage() {
    fs.readFile(__dirname + '/xmlFiles/input.xml', function(err, data) {
        parseString(data, function (err, result) {
            try {
                result = result.Parameters.Parameter;
            } catch(err) {
                exseptionHandlers("Некорректные данные в input.xml", err);
                return;
            }

            fs.readFile('./public/index.ejs', 'utf-8', function(error, content) {
                if (error) {
                    exseptionHandlers("Ошибка при чтении index.ejs", error);
                    return;
                }

                try {
                    actualWebPage = ejs.render(content, {table: result}, {delimiter: '?'});
                } catch(err) {
                    exseptionHandlers("Некорректные данные переданы в index.ejs", err);
                }
            });
        });
    });
}

function exseptionHandlers(message, err) {
    actualWebPage = "Извените, неполадки с данными на сервере";
    console.log("------------------------------------------------------------------------------------");
    console.log(message);
    console.log(err);
    console.log("------------------------------------------------------------------------------------");
}