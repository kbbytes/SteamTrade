var _fs = require('fs')
var _config = require('../config')
const colors = require('colors');

function DataLoader(params)
{
    this._sqlCon = params._sqlCon || false

    console.log("[!!!] DataLoader has been loaded!")
}

DataLoader.prototype.getOrdersInfo = function getOrdersInfo(ID) {
    if(ID > -1)
    {
        this._sqlCon.query("SELECT order_item_id, order_item_name FROM " + _config.DB.prefix + "woocommerce_order_items WHERE order_id='" + ID + "';", function (err, rows, result, fields) {
            if (err) 
                console.error(err)
            else
            {
                Object.keys(rows).forEach(function(key) {
                    var row = rows[key];
                    var detail = {
                        Order_Item_ID: row.order_item_id,
                        Order_Item_Name: row.order_item_name
                    }
                    parseJson = rows
                    order_data = JSON.stringify(parseJson, null, 2)
                    if(!_fs.exists('./data/orderid/ORDER_' + ID + '.json',function(err) {
                        if(!err)
                        {
                            _fs.writeFile('./data/orderid/' + ID + '.json', order_data, (err) => {
                                if (err) 
                                    console.error(err)
                            });
                        }
                    }));
                });
                
                /*for(var i = 0; i < rows.length; i++)
                {
                    let details = rows
                    let details_velues = details
                    let m_OrderID = {
                        Order_Item_ID: rows[i].order_item_id,
                        Order_Item_Name: rows[i].order_item_name
                    }
                
                    order_data = JSON.stringify(rows, null, 2)
                }

                _fs.writeFile('./data/orderid/' + ID + '.json', order_data, (err) => {
                    if (err) 
                        console.error(err)
                });
                */
            }
        });
        
    }
}

DataLoader.prototype.jsonParser = function jsonParser(jsonString, callbackString)
{
    var string = JSON.stringify(jsonString);
    var obj_value = JSON.parse(string);

    return obj_value[callbackString];
}

module.exports = DataLoader