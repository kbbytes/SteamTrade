const _fs = require('fs');
const _config = require('../config');
const request = require("request");
const async = require('async');
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const colors = require('colors');
const backpacktf = require("backpacktf");

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community: community,
    language: 'en'
});

const loginOptions = {
    accountName: _config.BOT.username,
    password: _config.BOT.password,
    twoFactorCode: SteamTotp.generateAuthCode(_config.BOT.shared_secret)
}

client.logOn(loginOptions);

client.on('loggedOn', () => {
    console.log("successfully loggedin!");
    client.setPersona(SteamUser.EPersonaState.Offline);

    //client.gamesPlayed(["FlushA", 570, 730]);
    setTimeout(() => {
        return startFloatChecker(() => {
            return callback()
        });
    }, 1500)
});
Inv_Total_Items_Name = [];
Inv_Items_AssetID = [];
function startFloatChecker()
{
    
    getInventory(_config.BOT.bot_id, _config.OFFER.appid,_config.OFFER.contextid, (err, items) => {
        if (err) {
            console.error(err)
            console.log('[Error]', `Could not load inventory of "${_config.BOT.bot_id}".`)
            return 0
        }
        if (!items || !Object.keys(items).length) {
            console.log('[Error]', `Could not get items for "${_config.BOT.bot_id}", maybe inventory is empty?`)
            return 0
        }
        console.log('[Progress]', `Starting gathering inventory items`)

        async.eachOfSeries(items, (item, assetid, itemCallback) => {

            setTimeout(itemCallback, 50)
            console.log(item.data.market_hash_name + " assetids: " + assetid)
            Inv_Items_AssetID.push({Name: item.data.market_hash_name, AssetID: assetid})
            Inv_Total_Items_Name.push(item.data.market_hash_name)
        }, () => {
            console.log('[Progress]', `Done gathering info for "${_config.BOT.bot_id}".`)
            setInterval(fetchOrders, _config.DB.fetchCD);
            return 0
        })
    });
}

client.on("friendMessage", function(steamID, message) {
    if(message == "ping")
    {
        client.chatMessage(steamID, "PONG! ");
    }
    else
    {
        //client.getPersonas([steamID], function (data) { console.log(data[steamID].player_name + " said: " + message) });
        /*client.getPersonas([steamID], function(per){
            console.log(per);
        });*/
    }
});

client.on('webSession', (sessionid, cookies) => {
    manager.setCookies(cookies);

    community.setCookies(cookies);
    community.startConfirmationChecker(20000, _config.BOT.identity_secret);
});

function acceptOffer(offer)
{
    offer.accept((err) => {
        if(!err)
        {
            community.checkConfirmations();
            console.log("an offer has been accepted!");
        }
        if(err) console.log("there was an error accepting the error.");
    });
}

function declineOffer(offer)
{
    offer.decline((err) => {
        if(!err)
        {
            community.checkConfirmations();
            console.log("an offer has been declined!");     
        }
        if(err) console.log("there was an error declining the offer.");
        
    });
}

//client.setOption("promptSteamGuardCode", false);


    /*if(offer.isGlitched() || offer.state === 11)
    {
        console.log("Offer was glitched, declining.");
        declineOffer(offer);
    }
    else if(offer.partner.getSteamID64() === _config.BOT.ownerid) {
        acceptOffer(offer);
    }
    else
    {
        var ourItems = offer.itemstoGive;
        var theirItems = offer.itemsToReceive;

        console.log()

    }*/

manager.on('newOffer', (offer) => {
   
});
TRADEOFFER_QTY = []
TRADEOFFER_ORDERID = []
TRADEOFFER_ITEMS = []
FinalModifyOffer = 0
SteamBot.prototype.getAssetid = function getAssetid(ItemName, ItemID, TradeURL, ID , Items_Cound)
{

    var Total_Items = Inv_Total_Items_Name;
    var Order_Items = Total_Items.includes(ItemName);
    if(Order_Items)
    {
        //console.log(ItemName)
        TRADEOFFER_ITEMS.push(ItemName)
    }
    setTimeout(() => {
        for(var i = 0; i < Inv_Items_AssetID.length; i++)
        if(ItemName.indexOf(Inv_Items_AssetID[i].Name) !== -1)
        console.log(' Inv_Assets ' + Inv_Items_AssetID[i].Name)
    }, 1000);
    
    /*
    ID.forEach(i => {
        this._sqlCon.query("SELECT meta_key, meta_value FROM " + _config.DB.prefix + "woocommerce_order_itemmeta WHERE order_item_id='" + i + "' AND meta_key='_qty';", function (err, rows, result, fields) {
            if (err) 
                console.error(err)
            else
            {
                if(TRADEOFFER_QTY.length < ID.length)      
                    TRADEOFFER_QTY.push(rows[0].meta_value)
            }
        });
    });
    */
    /*
    //console.log(ItemName[ItemID])
    var url = 'https://api.steamapis.com/market/item/570/' + ItemName[ItemID] + '?api_key=' + _config.STEAMAPI.steamapis;
    //var url = "json/570/" + ItemName[ItemID];
    //console.log(url)
    //let rawdata = _fs.readFileSync(url)    
    //var parseData = JSON.parse(rawdata)
    //console.log(parseData.nameID)

    
    
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if(error)
            console.error(error)
        if (!error && response.statusCode === 200) {
            allourItemsAssetID.push(body.nameID)
        }
    });*/
    //console.log(ItemName + ' ' + TradeURL)
    data = {ItemName, TRADEOFFER_ITEMS, TradeURL, TRADEOFFER_QTY, TRADEOFFER_ORDERID, Items_Cound}
    if(ItemID + 1 >= Items_Cound.length)
    {
        FinalModifyOffer = setInterval(ModifyOffer, 1000, data)
    }
    
}

m_Items = []
function ModifyOffer(data)
{
    /*
    */
    /*
    community.getMarketItem(570, data.ItemName[0], (err, item) => {
        if(err)
            console.log(err)
        else
            console.log("getmarketItem" + item.firstAsset.id)
    });
    */
   /*
    getInventory(_config.BOT.bot_id, _config.OFFER.appid,_config.OFFER.contextid, (err, items) => {
        if (err) {
            console.error(err)
            console.log('[Error]', `Could not load inventory of "${_config.BOT.bot_id}".`)
            return 0
        }
        if (!items || !Object.keys(items).length) {
            console.log('[Error]', `Could not get items for "${_config.BOT.bot_id}", maybe inventory is empty?`)
            return 0
        }
        console.log('[Progress]', `Starting gathering inventory items`)

        async.eachOfSeries(items, (item, assetid, itemCallback) => {
            console.log(item + ' ' + assetid)
        }, () => {
            console.log('[Progress]', `Done gathering info for "${_config.BOT.bot_id}".`)
            return 0
        })
    });
    */
    clearInterval(FinalModifyOffer);
    /*
    for(var i = 0; i < data.allourItemsAssetID.length; i++)
    {
        var order_amount = {
            Item_Asset_ID: data.allourItemsAssetID[i],
            Item_Order_Amount: data.TRADEOFFER_QTY[i]
        }
        parseJson = order_amount
        order_data = JSON.stringify(parseJson, null, 2)
        _fs.writeFile('./data/item_amount/' + data.allourItemsAssetID[i] + '.json', order_data, (err) => {
            if (err) 
                console.error(err)
            else
                m_Amount[data.allourItemsAssetID[i]] = order_amount.Item_Order_Amount
        });
    }
    */
    const trade_link = data.TradeURL;
    const offerData = data;
    if (
        trade_link.indexOf('steamcommunity.com/tradeoffer/new/') === -1 ||
        trade_link.indexOf('?partner=') === -1 ||
        trade_link.indexOf('&token=') === -1
    ) 
    {
        console.error("Invalid trade URL please check user trade link!");
        _fs.writeFile('./data/errors/error_' + offerData.ID + '.json', offerData.allourItemsAssetID, (err) => {
            if (err) 
                console.error(err)
        });

    }
    else
    {
        //console.log(offerData.TRADEOFFER_ITEMS)
        if(offerData.TRADEOFFER_ITEMS.length)
        {
            console.log(trade_link + ' is ' + 'valid'.green);
            const offer = manager.createOffer(trade_link);
            /*for(var i = 0; i < offerData.TRADEOFFER_QTY.length;)
            {
                let rawdata = _fs.readFileSync('data/item_amount/' + assetid + '.json')    
                var parseData = JSON.parse(rawdata)
            }*/
            offer.addMyItems(offerData.allourItemsAssetID.map(assetid => ({
                assetid: 15093671666,
                appid: _config.OFFER.appid,
                contextid: _config.OFFER.contextid,
                amount: _config.OFFER.amount,
            })));
        
            offer.setMessage(_config.OFFER.offer_msg);
            offer.getUserDetails((detailsError, me, them) => {
                if (detailsError) {
                    console.error(detailsError)
                } else if (me.escrowDays + them.escrowDays > 0) {
                    console.error('You must have 2FA enabled, we do not accept trades that go into Escrow.')
                } else {
                    offer.send(function(errSend, status) {
                        if (errSend) {
                            console.error(errSend)
                        }
                        else
                        {
                            console.log("Offer #" + offer.id + " is now " + status);
                            if (status === 'pending') {
                                community.acceptConfirmationForObject(identitySecret, offer.id, (err) => {
                                    if (!err) {
                                        console.log("Offer confirmation has been done!");
                                    } else {
                                       console.error(err)
                                    }
                                });
                            }
                        }
                    });
                }
            })
            checkOffer(offer);
        }
        else
        {
            console.error('Offer data is empty!')
        }
    }
}

function checkOffer(offer)
{
    allourItemsAssetID.length = 0;
    ourItems = offer.itemsToGive; //All of our items
    allourItems.length = 0;

    /*
    backpacktf.getCommunityPrices("5d8edd306780722e36758c1e", "570", function(err, data) {
        if (err) {
            console.log("Error: " + err.message);
        } else {
            console.log(data); //You probably don't actually want to do this since there is a LOT of data.
        }
    });*/
    
}

const MAX_RETRIES = 3
const API_URL = 'https://api.steamapis.com/steam/inventory'

async function getInventory(steamID64, appID, contextID, callback, retries) {
    request(`${API_URL}/${steamID64}/${appID}/${contextID}?api_key=${_config.STEAMAPI.steamapis}`, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const items = JSON.parse(body)
            const assets = items.assets
            const descriptions = items.descriptions

            const inventory = {}

            if (descriptions && assets) {
                async.forEach(descriptions, (description, cbDesc) => async.forEach(assets, (asset, cbAsset) => {
                    if (
                        description.classid === asset.classid
                        && description.tradable
                        && description.marketable
                        && description.market_hash_name.indexOf('Souvenir') === -1
                    ) {
                        if (typeof inventory[asset.assetid] !== 'undefined') {
                            return true
                        }
           
                        inventory[asset.assetid] = asset
                        inventory[asset.assetid].data = {
                            background: description.background_color,
                            image: description.icon_url,
                            tradable: description.tradable,
                            marketable: description.marketable,
                            market_hash_name: description.market_hash_name,
                            type: description.type,
                            color: description.name_color,
                        }
                    }
                    return cbAsset()
                }, cbDesc))
            }
            return callback(null, inventory)
        }
        let retry = retries
        if (typeof retries === 'undefined') {
            retry = 0
        }
        retry += 1
        if (retry <= MAX_RETRIES) {
            return getInventory(steamID64, appID, contextID, callback, retry)
        }
        let statusCode = null
        if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
            statusCode = response.statusCode
        }
        return callback({ error, statusCode })
    })
}

function SteamBot(params) 
{
    this._sqlCon = params._sqlCon || false

    console.log("[!!!] SteamBot has been loaded!");
}


module.exports = SteamBot
