/**
 * Created by naxj on 17/9/6.
 */
/**
 * 微信支付
 * @param wxappid
 * @param debug 是否为debug模式
 * @constructor
 */
var WxPay = function () {
    this.wxappid = "wxfab3a0fc516eeb35";
    this.openid = null;
};

/**
 * 公众号支付
 * @param config
 * @returns {*}
 */
WxPay.prototype.pay = function (config) {
    config.orderType = "farmind";
    var df = $.Deferred();
    if (typeof (config.tradeNo) == "undefined") {
        return alert("参数不全");
    }
    if (typeof (config.openid) == "undefined") {
        config.openid = this.openid;
        if (config.openid == "") {
            return alert("未获得用户标识(openid)");
        }
    }
    
    //{"totalFee":0.01,"body":"测试","openid":getcookie('wxopenid')}
    $.post("/yuanlv/pay/wechat/jsapi2", config, function (result) {
        console.log("=======下单完成=======\n" + JSON.stringify(result));
        if (200 != result.httpCode) {
            alert(result.msg);
            return df.reject(result.msg);
        }
        var paySign = result.data;
        var opetions = {
            "appId": paySign.appId,     //公众号名称，由商户传入
            "timeStamp": paySign.timeStamp,         //时间戳，自1970年以来的秒数
            "nonceStr": paySign.nonceStr, //随机串
            "package": paySign.package,
            "signType": paySign.signType,         //微信签名方式：
            "paySign": paySign.paySign //微信签名
        };
        console.log("=======拉起支付的参数=======\n" + JSON.stringify(opetions));
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', opetions,
            function (res) {
                 console.log(JSON.stringify(res))
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    df.resolve(paySign);
                }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                    df.reject("取消支付");
                }else{
                    df.reject(JSON.stringify(res));
                }
            }
        );
    });
    return df.promise();
};


function onBridgeReady() {
    console.log("=======onBridgeReady=======\n");
}

if (typeof WeixinJSBridge == "undefined") {
    if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
    } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
    }
} else {
    onBridgeReady();
}
