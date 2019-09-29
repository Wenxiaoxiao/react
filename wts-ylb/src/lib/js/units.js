//公共方法

!(function($) {

    var lz_tools = $.tools();
    
    var fromsFn = function() {
        return {
            init:function(params){
                insuranceProductId=params.insuranceProductId;
                this.cpNav();
                this.cpNavScroll();
            },
            submitData: function(
                plan,
                name,
                mobile,
                content,
                layerMsg
            ) {
                var self = this;
                var url = "https://weixin.wts999.com/source/collect.do";
                var sourceUrl = location.href;
                var refererUrl = document.referrer || '';
                var userAgent = navigator.userAgent;
                var channel = $.getQueryString("c") || "";
                var send = $.getQueryString("m") || "";
                var executer = $.getQueryString("e") || "";
                var planName = $.getQueryString("p") || "";
                var clickId = $.getQueryString('qz_gdt')||"";
                var data = {
                    mobile: mobile,
                    name: name,
                    content: JSON.stringify(content),
                    planCode: plan,
                    sourceUrl: sourceUrl,
                    refererUrl: refererUrl,
                    userAgent: userAgent,
                    channel: channel,
                    executer: executer,
                    planName: planName,
                    send: send,
                };
                $.ajax({
                    url: url,
                    data: data,
                    type: "POST",
                    dataType: "script",
                    success: function() {
                        if (result.success == 1) {
                            // afterSubmit();
                            layer.open({
                                content: layerMsg||'提交成功'
                                ,btn: '我知道了'
                              });
                        }
                    },
                    error: function() {
                        $.layerMsg("提交失败");
                    }
                });
            },
            setDate: function () {
                //时间方法
                $(".body-container").on("click",".beginTime",function(){
                    var begin = $(this).attr("data-begin") || "1950-01-01";
                    var end = $(this).attr("data-end") || "2030-12-31";
                    $(this).date("beginTime", {
                        beginyear: begin.split("-")[0],
                        endyear: end.split("-")[0]
                    })
                })
            },
            radioEvtClick:function(callBack) {
                //单选框选择
                $(".qm-input").on("click", ".typeRadio", function() {
                    var val = $(this).attr("data-item");
                    $(this).attr("data-check", true).siblings(".typeRadio").attr("data-check", "");
                    $(this).parents('.box-right').attr('data-value',val)
                });
            },
            setFroms:function(params){
                //初始化表单和校验表单
                var self=this;
                this.initSelect(params.selects);
                document.addEventListener('focusout', function(e) {window.scrollTo(0,document.body.clientHeight)})
                $('#subMitBtn').click(function(){
                    //提交数据
                    window.scrollTo();
                    var fromValue=[],names='',mobile='',isSubmit=true;
                    $(".qm-change").each(function(){
                        var _this=$(this);
                        var item=_this.children('.box-right');
                        var type=$(item).attr('data-type');
                        var id=$(item).attr('data-id');
                        var name=$(item).attr('name');
                        var value=self.getValue(item,type);
                        if(!value){
                            layer.open({
                                content: name+'尚未填写'
                                ,btn: '我知道了'
                            });
                            isSubmit=false
                            return false;
                        }else if(id==='mobile'){
                            if(!$.regular().isPhone(value)){
                                layer.open({
                                    content: '您输入的不是正确的手机号码！'
                                    ,btn: '我知道了'
                                });
                                isSubmit=false
                                return false;
                            }
                        }
                        if(id==='name'){
                            names=value;
                        }else if(id==='mobile'){
                            mobile=value;
                        }else{
                            fromValue.push({
                                key:name,
                                value:value
                            })
                        }
                        
                    })
                    if(!isSubmit)return;
                    self.submitData(params.title,names,mobile,fromValue,params.msg)
                })
            },
            initSelect:function(data){
                if(data){
                    var html=''
                    for(var k in data){
                        var start=Number(data[k].section.split('-')[0]);
                        var end=Number(data[k].section.split('-')[1]);
                        for(var n=start;n<end+1;n++){
                            html+='<option value="'+n+data[k].name+'">'+n+data[k].name+'</option>';
                        }
                        $('#'+data[k].id).children('select').html(html)
                    }
                }
            },
            getValue:function(item,type){
                //获取并比对表单值
                var value='';
                if(type==='2' || type==='3'){
                    value=$(item).find('.changes').val();
                }else if(type==='1'){
                    value=$(item).find('.lz-radio').val();
                }
                return value;
            },
            /** 
             * 微信分享监听
             * param
             * title-标题
             * img-图片地址
             * desc-描述
             * appId-appId
             */
            shareWx: function(title, img, desc, appId) {
                var appId = appId;
                var title = title;
                var url = location.href.split("#")[0];
                // 调用服务器获取签名
                $.ajax({
                    type: "POST",
                    url: "/tools/wechat/api/getJssdk",
                    data: { appid: appId, url: url },
                    async: false,
                    dataType: "json",
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
                            jsApiList: [
                                    "onMenuShareTimeline",
                                    "onMenuShareAppMessage",
                                    "onMenuShareQQ"
                                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                        });
                        wx.ready(function() {
                            //分享到朋友圈
                            wx.onMenuShareTimeline({
                                title: title,
                                desc: desc,
                                link: url,
                                imgUrl: img,
                                success: function() {
                                    //$.layerMsg('分享成功！');
                                },
                                cancel: function() {
                                    $.layerMsg("取消分享！");
                                },
                                fail: function(res) {
                                    alert(JSON.stringify(res));
                                }
                            });
                            //分享给朋友
                            wx.onMenuShareAppMessage({
                                title: title,
                                desc: desc,
                                link: url,
                                imgUrl: img,
                                trigger: function(res) {
                                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                                    //alert('发送成功');
                                },
                                success: function(res) {
                                    //$.layerMsg('已分享！');
                                },
                                cancel: function(res) {
                                    $.layerMsg("已取消！");
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
            },
        };
    };
    $.extend({
        fromsFn: fromsFn,
    });
})(jQuery);