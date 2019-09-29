/**
 * Created by Administrator on 2017/8/2.
 */

!(function($) {
    var browser = {
        versions: function() {
            var u = navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Firefox') > -1, //火狐内核Gecko
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android
                iPhone: u.indexOf('iPhone') > -1, //iPhone
                iPad: u.indexOf('iPad') > -1, //iPad
                webApp: u.indexOf('Safari') > -1, //Safari
                user: u,
            };
        }()
    }

    var environment = 1; //0-测试，1-正式，2-灰度
    var baseUrl = ["http://192.168.33.13:8080", '//bx.wts999.com']; //基础路径

    //全局数据
    var globedata = {
        environment: environment, //0-测试，1-正式，2-灰度
        baseUrl: baseUrl[environment], //基础路径http://www.chengding99.com
    }


    $.extend({
        globedata: globedata, //全局参数
        tools: tools, //工具类
        regular: regular, //正则类
        ajaxPackage: ajaxPackage, //ajax托管
        getLocalUrl: function() {
            var url = location.href;
            var num = url.indexOf("?");
            if (num != -1) {
                url = url.substring(0, num);
            }
            return url;
        }, //获取基础地址
        getQueryString: getQueryString, //获取地址栏参数
        domain: document.domain,
        shareWx: shareWx,
        indexHtml: function() {
            var url = $.getLocalUrl();
            if (url.indexOf("/market/") > -1 || url.indexOf("/community/") > -1 || url.indexOf("/personal/") > -1) {
                return "../index.html";
            } else {
                return "./index.html";
            }
        },
        errorLogFn: errorLogFn, //错误打印
    });
    console.log($.domain);
    //工具类
    function tools() {
        return {
            android: browser.versions.android, //安卓
            trident: browser.versions.trident, //IE内核
            presto: browser.versions.presto, //opera内核
            webKit: browser.versions.webKit, //苹果、谷歌内核
            gecko: browser.versions.gecko, //火狐内核Gecko
            mobile: browser.versions.mobile, //是否为移动终端
            ios: browser.versions.ios, //ios
            iPhone: browser.versions.iPhone, //iPhone
            iPad: browser.versions.iPad, //iPad
            webApp: browser.versions.webApp, //Safari
            user: browser.versions.user, //Safari
            checkScreen: function(url) {
                if (!this.mobile && !this.iPad) {
                    location.href = location.href.replace('/m/', '/pc/');
                }
            },
            //微信
            isWeiXin: function() {
                var ua = window.navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                    return true;
                } else {
                    return false;
                }
            }, //微信id
            isDD: function() {
                //判断是不是钉钉
                var ua = navigator.userAgent.toLowerCase();
                return ua.indexOf("dingtalk") >= 0;
            },
            //支付宝环境
            isAL: function() {
                var ua = navigator.userAgent.toLowerCase();
                if (ua.match(/Alipay/i) == "alipay") {
                    return true;
                } else {
                    return false;
                }
            },
            getWxId: function() {
                var openId = "wx84f4466f82b855ab";
                return openId;
            },
            //获取安卓版本号
            getAnbanben: function() {
                var user = this.user;
                var index = user.indexOf("Android");
                if (index > 0) {
                    return parseFloat(user.slice(index + 8));
                } else {
                    return null;
                }
            },
            // 获取html名称
            pageName: function() {
                var a = location.href;
                var b = a.split("/");
                var c = b.slice(b.length - 1, b.length).toString(String).split(".");
                return c.slice(0, 1);
            },
            //判断null
            isNull: function(exp) {
                if (!exp && typeof exp != "undefined" && exp != 0) {
                    return true;
                } else if (exp == "null") {
                    return true;
                }
                return false;
            },
            //删除地址栏参数
            delQueStr: function(url, ref) {
                var str = "";
                if (url.indexOf('?') != -1) {
                    str = url.substr(url.indexOf('?') + 1);
                } else {
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
                    return url.substr(0, url.indexOf('?')) + "?" + returnurl.substr(0, returnurl.length - 1);
                } else {
                    arr = str.split('=');
                    if (arr[0] == ref) {
                        return url.substr(0, url.indexOf('?'));
                    } else {
                        return url;
                    }
                }
            },
            //获取cookie
            getcookie: function(name) {
                var strcookie = document.cookie;
                var arrcookie = strcookie.split("; ");
                for (var i = 0; i < arrcookie.length; i++) {
                    var arr = arrcookie[i].split("=");
                    if (arr[0] == name) return decodeURIComponent(arr[1]);
                }
                return "";
            },
            //设置本地储存
            setLocal: function(name, value, type) {
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
            getLocal: function(name, exp) {
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
            //判断是否是数组
            isArr: function(value) {
                if (value instanceof Array ||
                    (!(value instanceof Object) &&
                        (Object.prototype.toString.call((value)) == '[object Array]') ||
                        typeof value.length == 'number' &&
                        typeof value.splice != 'undefined' &&
                        typeof value.propertyIsEnumerable != 'undefined' &&
                        !value.propertyIsEnumerable('splice'))) {
                    return true;
                } else {
                    return false;
                }
            },

            /*
             * 深复制
             * params
             * -destination  被赋值的新对象
             * -source  取值的对象
             * -miss  忽略的对象
             * */
            deepCopy: function(destination, source, miss) {
                for (var p in source) {
                    if ($.inArray(p, miss) > -1) {
                        return;
                    }
                    if (getType(source[p]) == "array" || getType(source[p]) == "object") {
                        destination[p] = getType(source[p]) == "array" ? [] : {};
                        arguments.callee(destination[p], source[p]);
                    } else {
                        destination[p] = source[p];
                    }
                }

                function getType(o) {
                    var _t;
                    return ((_t = typeof(o)) == "object" ? o == null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
                }
            },
            comeFrom: function() {
                var comeFrom = sessionStorage.getItem("comeFrom");
                if (comeFrom) {
                    return comeFrom;
                } else {
                    return "null";
                }
            },
            /*
             * ios页面返回刷新
             * */
            reloadIos: function() {
                var isPageHide = false;
                window.addEventListener('pageshow', function() {
                    if (isPageHide) {
                        window.location.reload();
                    }
                });
                window.addEventListener('pagehide', function() {
                    isPageHide = true;
                });
            }
        }
    }

    //正则类
    function regular() {
        return {
            //电话号码
            isPhone: function(phone) {
                var pattern = /^1[3,4,5,6,7,8,9]\d{9}$/;
                return pattern.test(phone);
            },
            //邮件
            isEmail: function(email) {
                var pattern = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})[; ,])*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
                return pattern.test(email);
            },
            //姓名
            isName: function(val) {
                var pattern = /^[\u4e00-\u9fa5]{2,10}$|^[\w+\s]{1,20}$/;
                return pattern.test(val);
            },
            //邮编
            isZip: function(val) {
                var pattern = /^[0-9]\d{5}$/;
                return pattern.test(val);
            },
            //身份证
            issfz: function(val) {
                var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                return pattern.test(val);
            },
            //数字
            isNum: function(val) {
                var pattern = /([1-9]\d*\.?\d*)|(0\.\d*[1-9])/;
                return pattern.test(val);
            },
            //匹配中英文
            isChAndEn: function(val) {
                var pattern = /[a-zA-Z\u4e00-\u9fa5]+/g;
                return !pattern.test(val);
            },
            //获取身份证对应的性别和年龄
            getDateSex: function(num) {
                var UUserCard = num;
                var returns = {
                        age: '',
                        sex: ''
                    }
                    //获取出生日期
                UUserCard.substring(6, 10) + "-" + UUserCard.substring(10, 12) + "-" + UUserCard.substring(12, 14);
                //获取性别
                if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
                    //alert("男");
                    returns.sex = 1;
                } else {
                    //alert("女");
                    returns.sex = 2;
                }
                //获取年龄
                var myDate = new Date();
                var month = myDate.getMonth() + 1;
                var day = myDate.getDate();
                var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
                if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
                    age++;
                }
                //alert(age);
                returns.age = age;
                return returns;
            }
        }
    }

    function getQueryString(name, type) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var search = window.location.search;
        if (type) {
            search = decodeURI(search);
        }
        var r = search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    //对ajax 进行统一的托管处理: 比如统一的错误码处理et...
    function ajaxPackage(paramList, num, action) {
        var baseUrl = globedata.baseUrl;
        var sendNum = num | 0;
        var _httpDefaultOpts = {
            type: 'POST', // GET/DELETE/HEAD/JSONP/POST/PUT
            url: '',
            dataType: 'json',
            params: {}, // 拼接在url的参数
            contentType: 'application/x-www-form-urlencoded',
            timeout: 60000,
            data: {},
            isBase: true,
            beforeSend: function() {}, // ajax 执行开始 执行函数
            success: function(data, isError) {}, // ajax 执行成功 执行函数
            error: function(data) {}, // ajax 执行失败 执行函数
            complete: function(data) {} // ajax 执行结束 执行函数
        };
        if ($.isPlainObject(paramList)) {
            paramList = $.extend({}, _httpDefaultOpts, paramList);
            //把所有参数按照英文首字母升序排列得到一个字符串
            if (paramList.isBase) {
                paramList.url = baseUrl + paramList.url;
            }
            ajax();

            function ajax() {
                $.ajax({
                    type: paramList.type,
                    url: paramList.url,
                    dataType: paramList.dataType,
                    timeout: paramList.timeout, //超时时间设置，单位毫秒
                    data: paramList.data,
                    contentType: paramList.contentType,
                    async: paramList.async,
                    beforeSend: function(request) {
                        // var token='eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3dCIsImlhdCI6MTU1NjA2NTc5NywidWlkIjoxMTE2NzQ5OTQyNjY1NDg2MzM3LCJvaWQiOiJvTmlIajBXM3U1dzFyUHhXdHY4akpPUHA0WkhZIiwiaXNzIjoid3MiLCJ1c2VyIjp7ImlkIjoxMTE2NzQ5OTQyNjY1NDg2MzM3LCJlbmFibGUiOm51bGwsInJlbWFyayI6bnVsbCwiY3JlYXRlQnkiOm51bGwsImNyZWF0ZVRpbWUiOm51bGwsInVwZGF0ZUJ5IjpudWxsLCJ1cGRhdGVUaW1lIjpudWxsLCJrZXl3b3JkIjpudWxsLCJuaWNrbmFtZSI6IuWFtOadpSIsImhlYWRpbWd1cmwiOiJodHRwczovL3N0YXRpYy53dHM5OTkuY29tLy9oZWFkSW1hZ2Uvb05kaWF3MGRRSFJJMW43MHlXWEo2Ulp6OWZTay5qcGciLCJzZXgiOiIxIiwiYmlydGhkYXkiOm51bGwsInByb3ZpbmNlIjoi5rmW5YyXIiwiY2l0eSI6Iumaj-W3niIsImVtYWlsIjpudWxsLCJtb2JpbGUxIjoidjJfMWQyYmVmODRiMTI5NWM4ZDI3ZGQyOWQxNjZjYzI2ZWIiLCJtb2JpbGUyIjoiWW1JeU16WXpZVE10TlRVeE55MDBNREppTFRrMU1UTXRaRGt5TlRBME9EZzVOVGRtYkVGalpWUm1NRlZMY2pJM1p5OWlibVpPYTJoTFJ5dFlObkJSY3l0dmMxUkJRVUZCUVVGQlFVRkJRa3B4U0RGc1EwRXZaVmc1VkRGUVNXMHdZUzlpVTJaQ1VYTkJVVUl5UkVzdlpXdG5aVmxhUTNabVNEVlZXVlpuZEdaRE9VaFVAb3BGU3pxUmk2MFEzcUVhSzJjYTlGNz09IiwibW9iaWxlIjoiMTg1KioqKjYwMTEiLCJ1bmlvbmlkIjoib05pSGowVzN1NXcxclB4V3R2OGpKT1BwNFpIWSIsIm9wZW5pZCI6Im9OZGlhdzBkUUhSSTFuNzB5V1hKNlJaejlmU2siLCJzZXJ2ZXJDb2RlIjoid3giLCJpbWVpIjoiODNkMzE5ZjgwYjhmY2VhOCIsImRldmljZU5vIjpudWxsLCJkZXZpY2VUeXBlIjoyLCJkZXZpY2VCcmFuZCI6IkhVQVdFSSIsImFwcFZlcnNpb24iOiI0LjIuMSIsImN1cnJlbnRDbGllbnRGbGFnIjoib05pSGowVzN1NXcxclB4V3R2OGpKT1BwNFpIWSIsImFwcEluZm8iOnsiaW1laSI6IjgzZDMxOWY4MGI4ZmNlYTgiLCJkZXZpY2VObyI6bnVsbCwiZGV2aWNlVHlwZSI6MiwiZGV2aWNlQnJhbmQiOiJIVUFXRUkiLCJhcHBWZXJzaW9uIjoiNC4yLjEifSwid3hJbmZvIjp7Im5pY2siOiLlhbTmnaUiLCJoZWFkSW1hZ2UiOiJodHRwczovL3N0YXRpYy53dHM5OTkuY29tLy9oZWFkSW1hZ2Uvb05kaWF3MGRRSFJJMW43MHlXWEo2Ulp6OWZTay5qcGciLCJvcGVuaWQiOiJvTmRpYXcwZFFIUkkxbjcweVdYSjZSWno5ZlNrIiwidW5pb25pZCI6Im9OaUhqMFczdTV3MXJQeFd0djhqSk9QcDRaSFkiLCJzZXgiOiIxIiwicHJvdmluY2UiOiLmuZbljJciLCJjaXR5Ijoi6ZqP5beeIn19fQ.kpdcF2rGoPaAmynWOFDQJJ11V3gx71kugNlOqPQEe8m8WaUalmsL6pDdO-gDxmzksT-IsvF3OXMJQHRiWI40sA';
                        // if (token) {
                        //     request.setRequestHeader('YLB_TOKEN_A', token);
                        // }
                        paramList.beforeSend(request);
                        if (sendNum > 0) return false;
                    },
                    success: function(data, textStatus, jqXHR) {
                        sendNum++;
                        var isError = successError(data);
                        paramList.success(data, isError);
                    },
                    error: function(data, textStatus, errorThrown) {
                        console.log(data);
                        console.log(data.status);
                        console.log(textStatus);
                        var isError = errordata(data, textStatus)
                        paramList.error(data, isError);
                    },
                    complete: function(data) {
                        paramList.complete(data);
                    }
                });
            }
        }
        //请求错误处理
        function errordata(data, textStatus) {
            if (textStatus == 'timeout') {
                layer.msg('网络请求超时，请先改善网络环境！')
                return false;
            } else if (data.status == 502) {
                layer.msg('服务器出错，请稍后再试-502')
                return false;
            } else if (data.status == 0) {
                layer.msg('未联网，请先检查网络')
                return false;
            }
            return 1;
        }

        //公共错误处理
        function successError(data) {
            //服务器出错
            if (data.httpCode == 403) {
                $.cookie('YLB_TOKEN_A', '', { expires: 1, path: "/", domain: "wts999.com", secure: true });
                location.rYLB_TOKEN_A
                return
            }
            if (data.httpCode != 200 && data.data) {
                layer.open({
                    content: data.data.errorMsg,
                    skin: 'lzAlert',
                    btn: '我知道了'
                });
                return false;
            } else if (data.httpCode != 200) {
                layer.open({
                    content: data.msg,
                    skin: 'lzAlert',
                    btn: '我知道了'
                });
                return false;
            }
            return true
        }
    }


    /*
     * 微信分享监听
     * params
     * title-标题
     * img-图片地址
     * desc-描述
     * appId-appId
     * */
    function shareWx(params) {
        if (!$.tools().isWeiXin()) return;
        var img = params.img || "http://www.chengding99.com/personal/lib/images/YLB/share.jpg";
        var appId = "wxfab3a0fc516eeb35";
        var title = params.title;
        var url = location.href.split('#')[0];
        var link = params.link || url;
        // 调用服务器获取签名
        $.ajax({
            type: "POST",
            url: "/yuanlv/auth/api/getJssdk",
            data: {
                appid: appId,
                url: url
            },
            async: false,
            dataType: 'json',
            success: function(data, isError) {
                //微信config授权
                if (!isError) {
                    return;
                }
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: appId, // 必填，公众号的唯一标识
                    timestamp: data.data.timeStamp, // 必填，生成签名的时间戳
                    nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
                    signature: data.data.signature, // 必填，签名，见附录1
                    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
                wx.ready(function() {
                    //分享到朋友圈
                    wx.onMenuShareTimeline({
                        title: params.title,
                        desc: params.desc,
                        link: link,
                        imgUrl: img,
                        success: function() {
                            //layer.msg('分享成功！');
                        },
                        cancel: function() {
                            layerMsg('取消分享！')
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    //分享给朋友
                    wx.onMenuShareAppMessage({
                        title: title,
                        desc: params.desc,
                        link: link,
                        imgUrl: img,
                        trigger: function(res) {
                            // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                            //alert('发送成功');
                        },
                        success: function(res) {
                            //layer.msg('已分享！');
                        },
                        cancel: function(res) {
                            layerMsg('已取消！')
                        },
                        fail: function(res) {
                            alert(JSON.stringify(res));
                        }
                    });
                    //alert('已注册获取“发送给朋友”状态事件');

                });

                wx.error(function(res) {
                    console.log(res);
                });

            }
        });

    }


    if(globedata.environment==0 || getQueryString('console')){
    setTimeout(function(){errorLogFn()},100);
}



    function errorLogFn() {
        // 错误打印处理
        $("body").append('<script src="./lib/js/alloy-lever.js"></script>');
        $("body").append('<div id="console_log">console</div>');
        AlloyLever.config({
            cdn: 'http://s.url.cn/qqun/qun/qqweb/m/qun/confession/js/vconsole.min.js', //vconsole的CDN地址
            reportUrl: "http://policy-produce.cn-hangzhou.log.aliyuncs.com/logstores/app/track", //错误上报地址
            reportPrefix: 'qun', //错误上报msg前缀，一般用于标识业务类型
            reportKey: 'key1',
            entry: "#console_log" //请点击这个DOM元素6次召唤vConsole。//你可以通过AlloyLever.entry('#entry2')设置多个机关入口召唤神龙
        })
    }

    // window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", hengshuping, true);
})(jQuery);