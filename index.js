const _express = require('express')

const _app = _express()
const _server = require('http').Server(_app)
const io = require('socket.io')(_server)
const session = require('express-session')
const sharedsession = require('express-socket.io-session')
const _sql = require("mysql")
const fs = require('fs')
const colors = require('colors');

const _config = require("./config")

var _sqlCon = _sql.createConnection({
    connectionLimit : 100,
    host     : _config.Sql.host,
    user     : _config.Sql.username,
    password : _config.Sql.password,
    database : _config.Sql.database,
    debug    :  false
});

const dataloader = require("./inc/dataloader")
const _DataLoader = new dataloader({ _sqlCon })

const steambot = require('./inc/bot')
const _SteamBot = new steambot({ _sqlCon })

_server.listen(_config.Server.serverPort)
console.log("Application running on port " + _config.Server.serverPort)

if(!fs.exists('./data/',function(err) {
    if(!err)
    {
        fs.mkdir('./data/', (err) => {
            if (err) throw err;
        });
    }
}));
if(!fs.exists('./data/completed/',function(err) {
    if(!err)
    {
        fs.mkdir('./data/completed/', (err) => {
            if (err) throw err;
        });
    }
}));
if(!fs.exists('./data/orderid/',function(err) {
    if(!err)
    {
        fs.mkdir('./data/orderid/', (err) => {
            if (err) throw err;
        });
    }
}));
if(!fs.exists('./data/errors/',function(err) {
    if(!err)
    {
        fs.mkdir('./data/errors/', (err) => {
            if (err) throw err;
        });
    }
}));
if(!fs.exists('./data/item_amount/',function(err) {
    if(!err)
    {
        fs.mkdir('./data/item_amount/', (err) => {
            if (err) throw err;
        });
    }
}));

_app.use('/static', _express.static('./static'))
_app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

_sqlCon.connect(function(err) {
    if (err) return console.error("Unable to connect " + _config.Sql.host + " database!");
    console.log("Mysql connection done!")
});

let TRADEOFFER = []
let getnickinterval = 0
var uid, uname = '', uemailaddr = '', ugateway = '', uprice = -1, utrade_url = ''
let processing_order_id = -1
let max_offer_items = -1

fetchOrders = function fetchOrders()
{
    _sqlCon.query("SELECT ID, post_status, post_type FROM " + _config.DB.prefix + "posts WHERE post_type='shop_order' AND post_status='wc-processing'", function (err, rows, result, fields) {
        if (err) throw err;
        let order_data = 0
        
        // Save orders to orders.json file
        if(rows.length > 0)
        {
            for(var i = 0; i < rows.length; i++)
            {
                if((rows[i].post_status).indexOf("wc-processing") > -1)
                {
                    let m_Order = {
                        ID: rows[i].ID,
                        Order_status: rows[i].post_status
                    }
                    order_data = JSON.stringify(m_Order, null, 2)

                    // Create order id json
                    processing_order_id = rows[i].ID
                    _DataLoader.getOrdersInfo(processing_order_id)
                }
            }
            fs.writeFile('./data/orders.json', order_data, (err) => {
                if (err) throw err;
            });
        }

        if(processing_order_id >= 0)
        {
            console.log('Orders fetched!')
            if(_config.ORDER.order_autocomplete)
            {
                _sqlCon.query("SELECT meta_key, meta_value FROM " + _config.DB.prefix + "postmeta WHERE post_id='" + processing_order_id + "';", function (err, rows, result, fields) {
                    if (err) throw err;
                    Object.keys(rows).forEach(function(key) {
                        var row = rows[key];
                        if(row.meta_key == "_customer_user")
                            uid = rows[key].meta_value
                        else if(row.meta_key == "_payment_method_title")
                            ugateway = rows[key].meta_value
                        else if(row.meta_key == "_billing_email")
                            uemailaddr = rows[key].meta_value
                        else if(row.meta_key == "_order_total")
                            uprice = rows[key].meta_value
                      });
                });
            }
        }
        else
            console.log('processing order not found!')
    });
    if(uid >= 0)
        getnickinterval = setInterval(getOrderNickname, 500, uid, uname, uemailaddr, ugateway, uprice, utrade_url)
}

function getOrderNickname(id, name, emailaddr, gateway, price, trade_url)
{
    clearInterval(getnickinterval)
    _sqlCon.query("SELECT meta_key, meta_value FROM " + _config.DB.prefix + "usermeta WHERE user_id='" + id + "';", function (err, rows, result, fields) {
        if (err) throw err;
        Object.keys(rows).forEach(function(key) {
            var row = rows[key];
            if(row.meta_key == "nickname")
                uname = rows[key].meta_value
            else if(row.meta_key == "steamtradelink")
                utrade_url = rows[key].meta_value
          });

        let completed_order = { 
            user_id: id,
            nickname: uname,
            email: emailaddr, 
            payment_gateway: gateway,
            total_order: price,
            tradelink: utrade_url                   
        };
                    
        let data = JSON.stringify(completed_order, null, 2);
        
        fs.writeFile('data/completed/ID_' + id + '.json', data, (err) => {
            if (err) throw err;

            let rawdata = fs.readFileSync('data/orderid/' + processing_order_id + '.json')    
            var parseData = JSON.parse(rawdata)
            for(var i = 0; i < parseData.length; i++)
            {
                TRADEOFFER.ID = parseData[i].order_item_id
                TRADEOFFER.Name = parseData[i].order_item_name
                //TRADEOFFER.Qty = parseData[i].order_item_amount
                max_offer_items = parseData.length
                sendOfferItem(TRADEOFFER.ID, TRADEOFFER.Name, utrade_url, max_offer_items, i+1)
                
            }
            
            if(_config.ORDER.update_database)
            {
                _sqlCon.query("UPDATE " + _config.DB.prefix + "posts SET post_status='wc-complete' WHERE ID='" + processing_order_id +"';", function (err, result, fields) {
                    if (err) throw err;
                        
                    console.log("[ " + processing_order_id + " ] Order completed!")
                });
            }

            uid = -1
            id = -1
            uname = ''
            uprice = -1
            ugateway = ''
            uemailaddr = ''
            utrade_url = ''
            processing_order_id = -1
            console.log('Complete orders wrote in file!');
            
        });
    });
}
allourItems = [];
allourItemsAssetID = [];
orderitemid = [];
function sendOfferItem(ID, ItemName, TradeURL, MaxItems, Item_Number)
{
    //console.log('Item with ' + ID + ' and ' + ItemName + ' name added to trade offer!')
    allourItems.push(ItemName);
    orderitemid.push(ID);
    if(Item_Number === MaxItems)
    {
        assetIDAccuired(TradeURL, orderitemid);
        //_SteamBot.processOffer({ID, allourItems, TradeURL, MaxItems});
    }
}

function assetIDAccuired(TradeURL, ID)
{
    for(var i = 0; i < allourItems.length; i++)
    {
        _SteamBot.getAssetid(allourItems[i], i, TradeURL, ID, allourItems);
    }
}
