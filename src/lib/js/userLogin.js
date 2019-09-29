/**
 * Created by Administrator on 2017/12/25.
 * 郝兴来
 */
function YlbLogin() { }
YlbLogin.prototype = {
    constructor: YlbLogin,
    init: function (callBack) {
        //this.dom = "#cityPicker";
        var self = this;
        this.callBack = callBack;

        var domain = "http://www.chengding99.com";
        var base ="chengding99.com";
        this.params = {
            domain: domain,//域名-全面
            base: base,//域名-一级
            wxscope: "snsapi_base",
            autoLogin: domain + '/yuanlv/auth/autoLogin', //获取登录数据
            //微信相关
            wxoauthappid: domain + '/yuanlv/auth/wxoauthappid',
            wxmplogin: domain + '/yuanlv/auth/wxmplogin',
            wxmploginHtml: domain + '/wxmplogin.html',
        }
        
        this.token = $.cookie('YLB_TOKEN_A');
        if (this.token) {
            self.getUserInfo();
        } else {
            self.toChannel()
        }
    },
    /**
     * 判断是哪个渠道登录-微信，支付宝，h5
     */
    toChannel: function () {
        if (this.isWeiXin()) {
            this.wxmplogin();
        }else {
            this.h5mplogin();
        }
    },
    wxmplogin: function () {
        var self = this;
        var code = this.getQueryStringByName('code');
        var state = this.getQueryStringByName('state');
        if (!code) {
            $.ajax({
                type: 'get',
                url: self.params.wxoauthappid,
                async: false,
                cache: false,
                data: {
                    key: 'oauth.wx.mp.appid'
                },
                dataType: 'json',
                success: function (result) {
                    //将页面跳转至微信授权页
                    if (result != null && result.httpCode == 200 && result.hasOwnProperty('data') && result.data != "") {
                        var redirect_url = self.wechat_redirect_url(result);//获取授权地址
                        location.href = redirect_url;
                    } else {
                        alert('获取appid失败 \n ' + result);
                    }
                }
            });
        } else {
            $.ajax({
                type: 'get',
                url: self.params.wxmplogin,
                async: false,
                cache: false,
                data: {
                    code: code,
                    state: state
                },
                dataType: 'json',
                success: function (result) {
                    if (result != null && result.httpCode == 200 && result.hasOwnProperty('data') && result.data != "") {
                        console.log(result.data);
                        self.getUserInfo();
                        //如果静默授权登录失败,则换成显示授权重新登录一次
                    } else if (result.httpCode == 303 && self.params.wxscope == "snsapi_base") {
                        self.params.wxscope = "snsapi_userinfo";
                        $.ajax({
                            type: 'get',
                            url: self.params.wxoauthappid,
                            async: false,
                            cache: false,
                            data: {
                                key: 'oauth.wx.mp.appid'
                            },
                            dataType: 'json',
                            success: function (result) {
                                //将页面跳转至微信授权页
                                if (result != null && result.httpCode == 200 && result.hasOwnProperty('data') && result.data != "") {
                                    var redirect_url = self.wechat_redirect_url(result);//获取授权地址
                                    location.href = redirect_url;
                                } else {
                                    alert('获取appid失败 \n ' + JSON.stringify(result));
                                }
                            }
                        });
                        //location.href=url;
                    } else {
                        alert('微信身份识别失败 \n ' + JSON.stringify(result));
                    }
                }
            });
        }
    },
    
    h5mplogin: function () {
        this.callBack(false)
    },
    getUserInfo: function () {
        var self = this;
        var loginDatas = this.getLocal("YLB_USER");
        var cookieUser = $.cookie('YLB_USER');
        if (loginDatas && cookieUser) {
            // if (self.checkUserServerCode(loginDatas))return;
            return self.callBack(loginDatas)
        } else if (cookieUser) {
            // if (self.checkUserServerCode(JSON.parse(cookieUser)))return;
            return self.callBack(JSON.parse(cookieUser))
        }
        $.ajax({
            type: "get",
            url: self.params.autoLogin,
            async: false,

            dataType: 'json',
            success: function (result, er) {
                console.log(result);
                if (result.httpCode == 403) {
                    self.clearUser()
                    return self.toChannel()
                }
                // if (self.checkUserServerCode(result.data)) return;
                if (result.data) {
                    self.setLocal("YLB_USER", result.data);
                    $.cookie('YLB_USER', JSON.stringify(result.data), {
                        expires: 1,
                        path: "/",
                        domain: self.params.base,
                        secure: true
                    });
                }
                if (self.isWeiXin()) {
                    var url = location.href;
                    if(url.indexOf('code')<0){
                        return self.callBack(result.data)
                    }
                    url = self.delQueStr(url, "code");
                    url = self.delQueStr(url, "state");
                    location.replace(url);
                    
                } else if (self.isAL()) {
                    var url = location.href;
                    if(url.indexOf('auth_code')<0){
                        return self.callBack(result.data)
                    }
                    url = self.delQueStr(url, "auth_code");
                    url = self.delQueStr(url, "app_id");
                    url = self.delQueStr(url, "source");
                    url = self.delQueStr(url, "scope");
                    location.replace(url);
                } else {
                    self.callBack(result.data)
                }
            }
        });
    },
    //微信
    isWeiXin: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    },
    isDD: function () {
        //判断是不是钉钉
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf("dingtalk") >= 0;
    },
    //支付宝环境
    isAL: function () {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/Alipay/i) == "alipay") {
            return true;
        } else {
            return false;
        }
    },
    //获取地址栏参数
    getQueryStringByName: function (name) {
        var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
        if (result == null || result.length < 1) {
            return "";
        }
        return result[1];
    },
    //清除本地cookie和缓存的用户信息
    clearUser: function () {
        $.cookie('YLB_TOKEN_A', '', {
            expires: 1,
            path: "/",
            domain: this.params.base,
            secure: true
        });
    },

    //判断用户信息环境
    checkUserServerCode: function (userDta) {
        var self = this;
        var result=false;
        if (self.isAL() && userDta.serverCode != "alp") {
            result= true;
        }
        if (self.isWeiXin() && userDta.serverCode != "wx") {
            result= true;
        }
        if(result){
            self.clearUser()
            self.toChannel()
        }
        return result;
    },

    //获取微信授权地址
    wechat_redirect_url: function (result) {
        var wxappid = result.data.appid; //appid
        var domain = result.data.domain; //安全域名
        var fromurl = '';
        var tempHref = location.href;
        tempHref = this.delQueStr(tempHref, 'code');
        tempHref = this.delQueStr(tempHref, 'state');
        //如果当前访问域名不在安全域名内,则跳转到个人中心的登录跳转页
        fromurl = document.domain == domain ? encodeURIComponent(tempHref) : encodeURIComponent(this.params.wxmploginHtml + "?jumpToUrl=" + tempHref);
        var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + wxappid + '&redirect_uri=' + fromurl + '&response_type=code&scope=' + this.params.wxscope + '&state=' + this.params.wxscope + '#wechat_redirect';
        return url;
    },
    
    //删除地址栏参数
    delQueStr: function (url, ref) {
        var str = "";
        if (url.indexOf('?') != -1) {
            str = url.substr(url.indexOf('?') + 1);
        }
        else {
            return url;
        }
        var arr = "";
        var returnurl = "";
        var setparam = "";
        if (str.indexOf('&') != -1) {
            arr = str.split('&');
            for (i in arr) {
                if (arr[i].split('=')[0] != ref) {
                    returnurl = returnurl + arr[i].split('=')[0] + "=" + arr[i].split('=')[1] + "&";
                }
            }
            return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1) + this.hasHash();
        }
        else {
            arr = str.split('=');
            if (arr[0] == ref) {
                return url.substr(0, url.indexOf('?')) + this.hasHash();
            }
            else {
                return url;
            }
        }
    },

    //判断是否存才hash
    hasHash: function () {
        if (window.location.hash && window.location.hash.length > 0) {
            return window.location.hash;
        }
        return "";
    },
    //设置本地储存
    setLocal: function (name, value, type) {
        var curTime = new Date().getTime();
        if (!type || type == 2) { //默认设置-之前存在则使用创建时间
            var data = localStorage.getItem(name);
            if (!data || data == "null") {
                localStorage.setItem(name, JSON.stringify({
                    data: value,
                    time: curTime
                }));
            } else {
                var dataObj = JSON.parse(data);
                var setTime = dataObj.time;
                localStorage.setItem(name, JSON.stringify({
                    data: value,
                    time: setTime
                }));
            }
        } else if (type == 1) { //type:1重新创建
            localStorage.setItem(name, JSON.stringify({
                data: value,
                time: curTime
            }));
        }

    },
    //获取本地储存
    getLocal: function (name, exp) {
        var data = localStorage.getItem(name);
        var dataObj = JSON.parse(data);
        if (!exp) {
            var exp = 1000 * 60 * 60 * 24 * 3;
        }
        if (dataObj && new Date().getTime() - dataObj.time > exp) {
            localStorage.removeItem(name);
            console.log('信息已过期');
            return null;
        } else {
            var dataObjDatatoJson = !dataObj ? null : dataObj.data;
            return dataObjDatatoJson;
        }
    },

}