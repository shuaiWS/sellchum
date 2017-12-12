/// <reference path="../../lib/drunk.d.ts" />

/**
 * 微信工具模块
 */
namespace WeixinUtil {

    declare var wx;

    import ajax = drunk.util.ajax;
    import Promise = drunk.Promise;

    /**
     * 微信初始化
     */
    export function config(url?: string): Promise<any> {
        if (!wx || !wx.config) {
            return Promise.reject();
        }

        var currentUrl = url || location.href.split("#")[0];

        return ajax({
            url: `http://m.pinzvip.cn/api/wx/jsapi/signature?url=${encodeURIComponent(currentUrl)}`,
            headers: { accept: 'application/json', },
            responseType: 'json'
        }).then((data: any) => {
            wx.config({
                debug: false,
                appId: data.appid,
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.noncestr, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名，见附录1
                jsApiList: [
                    "onMenuShareTimeline",
                    "onMenuShareAppMessage",
                    "onMenuShareQQ",
                    "onMenuShareWeibo",
                    "onMenuShareQZone",
                    "startRecord",
                    "stopRecord",
                    "onVoiceRecordEnd",
                    "playVoice",
                    "pauseVoice",
                    "stopVoice",
                    "onVoicePlayEnd",
                    "uploadVoice",
                    "downloadVoice",
                    "chooseImage",
                    "previewImage",
                    "uploadImage",
                    "downloadImage",
                    "translateVoice",
                    "getNetworkType",
                    "openLocation",
                    "getLocation",
                    "hideOptionMenu",
                    "showOptionMenu",
                    "hideMenuItems",
                    "showMenuItems",
                    "hideAllNonBaseMenuItem",
                    "showAllNonBaseMenuItem",
                    "closeWindow",
                    "scanQRCode",
                    "chooseWXPay",
                    "openProductSpecificView",
                    "addCard",
                    "chooseCard",
                    "openCard"
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        });
    }

    /**
     * 关闭window
     */
    export function closeWindow() {
        wx.ready(() => {
            wx.closeWindow();
        });
    }

    /**
     * 微信拍照或从手机相册中选图接口
     */
    export function chooseImage(maxImageNum: number): Promise<string[]> {
        return new Promise((resolve, reject) => {
            wx.ready(() => {
                wx.chooseImage({
                    count: maxImageNum || 1, // 默认9
                    sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: (res) => {
                        // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        resolve(res.localIds);
                    },
                    cancel: () => {
                        reject('user:cancel');
                    }
                });
            });
        })
    };

    /**
     * 微信预览图片接口
     */
    export function previewImage(imgList: string[], index: number = 0) {
        if (!imgList || !imgList.length) {
            return;
        }
        wx.ready(() => {
            wx.previewImage({
                current: imgList[index], // 当前显示图片的http链接
                urls: imgList // 需要预览的图片http链接列表
            });
        });
    }

    /**
     * 上传图片
     */
    export function uploadImage(imgList: string[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!imgList || !imgList.length) {
                return reject();
            }

            var serverIdArr: string[] = [];
            imgList = imgList.slice();

            function upload() {
                var _localId = imgList.shift();
                wx.uploadImage({
                    localId: _localId, // 需要上传的图片的本地ID，由chooseImage接口获得
                    isShowProgressTips: 1, // 默认为1，显示进度提示
                    success: (res) => {
                        var serverId = res.serverId; // 返回图片的服务器端ID
                        serverIdArr.push(serverId);
                        if (imgList.length > 0) {
                            upload();
                        }
                        else {
                            resolve(serverIdArr);
                        }
                    }
                });
            }

            wx.ready(upload);
        });
    }

    /**
     * 微信分享的方法
     */
    export function share(options: { title: string; link: string; imgUrl: string; desc: string; }) {
        return new Promise((resolve, reject) => {
            let shareData = drunk.util.extend({ success: resolve, cancel: reject }, options);
            wx.ready(() => {
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareAppMessage(shareData);
            });
        });
    }

    /**
     * 微信支付
     */
    // export function pay(payUrl: string, payData: Object) {
    //     if (!wx || !wx.config) {
    //         return;
    //     }
    //
    // }
    export function pay(options: { appId: string, timestamp: number, nonceStr: string, package: string, signType: string, paySign: string }) {
        if (!wx || !wx.config) {
            return;
        }
        return new Promise<any>((resolve, reject) => {
            wx.chooseWXPay({
                appId: options.appId,
                timestamp: options.timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: options.nonceStr, // 支付签名随机串，不长于 32 位
                package: options.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                signType: options.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: options.paySign, // 支付签名
                success: () => {
                    resolve(options);
                },
                cancel: reject
            });
        });
    }
}