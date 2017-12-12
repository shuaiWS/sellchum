var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../lib/drunk.d.ts" />
var drunk;
(function (drunk) {
    var ScrollEnd = (function (_super) {
        __extends(ScrollEnd, _super);
        function ScrollEnd() {
            var _this = _super.apply(this, arguments) || this;
            _this.onScroll = function () {
                var element = _this.element;
                var clientHeight = element.clientHeight, scrollHeight = element.scrollHeight, scrollTop = element.scrollTop;
                if (clientHeight !== scrollHeight && scrollTop + clientHeight >= scrollHeight - 50) {
                    _this.viewModel.$eval(_this.expression);
                }
            };
            return _this;
        }
        ScrollEnd.prototype.init = function () {
            this.element.addEventListener('scroll', this.onScroll);
        };
        ScrollEnd.prototype.release = function () {
            this.element.removeEventListener('scroll', this.onScroll);
            this.onScroll = null;
        };
        return ScrollEnd;
    }(drunk.Binding));
    ScrollEnd = __decorate([
        drunk.binding('scroll-end')
    ], ScrollEnd);
})(drunk || (drunk = {}));
/// <reference path="../../lib/drunk.d.ts" />
/**
 * @example
 *      <div drunk-scroll-position></div>
 */
var drunk;
(function (drunk) {
    var Promise = drunk.Promise;
    var recordMap = {};
    var ScrollPosition = (function (_super) {
        __extends(ScrollPosition, _super);
        function ScrollPosition() {
            return _super.apply(this, arguments) || this;
        }
        ScrollPosition.prototype.init = function () {
            this.resumePosition();
        };
        ScrollPosition.prototype.resumePosition = function () {
            var _this = this;
            var element = this.element;
            var scrollPosition = recordMap[this.attribute] || 0;
            this.job = Promise.timeout(100);
            this.job.done(function () {
                _this.job = null;
                element.scrollTop = scrollPosition;
                if (element.scrollTop != scrollPosition) {
                    _this.resumePosition();
                }
            });
        };
        ScrollPosition.prototype.release = function () {
            recordMap[this.attribute] = this.element.scrollTop;
            this.job && this.job.cancel();
            this.job = null;
        };
        return ScrollPosition;
    }(drunk.Binding));
    ScrollPosition = __decorate([
        drunk.binding('scroll-position')
    ], ScrollPosition);
})(drunk || (drunk = {}));
/// <reference path="../../lib/drunk.d.ts" />
/**
 * 微信工具模块
 */
var WeixinUtil;
(function (WeixinUtil) {
    var ajax = drunk.util.ajax;
    var Promise = drunk.Promise;
    /**
     * 微信初始化
     */
    function config(url) {
        if (!wx || !wx.config) {
            return Promise.reject();
        }
        var currentUrl = url || location.href.split("#")[0];
        return ajax({
            url: "http://m.pinzvip.cn/api/wx/jsapi/signature?url=" + encodeURIComponent(currentUrl),
            headers: { accept: 'application/json', },
            responseType: 'json'
        }).then(function (data) {
            wx.config({
                debug: false,
                appId: data.appid,
                timestamp: data.timestamp,
                nonceStr: data.noncestr,
                signature: data.signature,
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
    WeixinUtil.config = config;
    /**
     * 关闭window
     */
    function closeWindow() {
        wx.ready(function () {
            wx.closeWindow();
        });
    }
    WeixinUtil.closeWindow = closeWindow;
    /**
     * 微信拍照或从手机相册中选图接口
     */
    function chooseImage(maxImageNum) {
        return new Promise(function (resolve, reject) {
            wx.ready(function () {
                wx.chooseImage({
                    count: maxImageNum || 1,
                    sizeType: ['compressed'],
                    sourceType: ['album', 'camera'],
                    success: function (res) {
                        // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        resolve(res.localIds);
                    },
                    cancel: function () {
                        reject('user:cancel');
                    }
                });
            });
        });
    }
    WeixinUtil.chooseImage = chooseImage;
    ;
    /**
     * 微信预览图片接口
     */
    function previewImage(imgList, index) {
        if (index === void 0) { index = 0; }
        if (!imgList || !imgList.length) {
            return;
        }
        wx.ready(function () {
            wx.previewImage({
                current: imgList[index],
                urls: imgList // 需要预览的图片http链接列表
            });
        });
    }
    WeixinUtil.previewImage = previewImage;
    /**
     * 上传图片
     */
    function uploadImage(imgList) {
        return new Promise(function (resolve, reject) {
            if (!imgList || !imgList.length) {
                return reject();
            }
            var serverIdArr = [];
            imgList = imgList.slice();
            function upload() {
                var _localId = imgList.shift();
                wx.uploadImage({
                    localId: _localId,
                    isShowProgressTips: 1,
                    success: function (res) {
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
    WeixinUtil.uploadImage = uploadImage;
    /**
     * 微信分享的方法
     */
    function share(options) {
        return new Promise(function (resolve, reject) {
            var shareData = drunk.util.extend({ success: resolve, cancel: reject }, options);
            wx.ready(function () {
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareAppMessage(shareData);
            });
        });
    }
    WeixinUtil.share = share;
    /**
     * 微信支付
     */
    // export function pay(payUrl: string, payData: Object) {
    //     if (!wx || !wx.config) {
    //         return;
    //     }
    //
    // }
    function pay(options) {
        if (!wx || !wx.config) {
            return;
        }
        return new Promise(function (resolve, reject) {
            wx.chooseWXPay({
                appId: options.appId,
                timestamp: options.timestamp,
                nonceStr: options.nonceStr,
                package: options.package,
                signType: options.signType,
                paySign: options.paySign,
                success: function () {
                    resolve(options);
                },
                cancel: reject
            });
        });
    }
    WeixinUtil.pay = pay;
})(WeixinUtil || (WeixinUtil = {}));
/// <reference path="../../lib/drunk.d.ts" />
/// <reference path="../../lib/cookies.d.ts" />
var RoommateApp;
(function (RoommateApp) {
    var QueryString;
    (function (QueryString) {
        var query = drunk.querystring.parse(location.search.slice(1));
        QueryString.schoolId = query['school_id'] || '';
        QueryString.channelType = query['channel_type'] || '';
        Cookies.set('school_id', encodeURIComponent(QueryString.schoolId), {
            path: '/'
        });
    })(QueryString = RoommateApp.QueryString || (RoommateApp.QueryString = {}));
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../lib/drunk.d.ts" />
/// <reference path="./query.ts" />
var RoommateApp;
(function (RoommateApp) {
    var Resource;
    (function (Resource) {
        var ajax = drunk.util.ajax;
        var Promise = drunk.Promise;
        /**
         * 请求统计信息
         */
        function getStatistic() {
            var schoolId = RoommateApp.QueryString.schoolId;
            return getJSON(HOST + "/stats?school_id=" + schoolId);
        }
        Resource.getStatistic = getStatistic;
        /**
         * 请求排名信息
         */
        function getRankList() {
            return getJSON(HOST + "/rank");
        }
        Resource.getRankList = getRankList;
        /**
         * 提交报名数据
         */
        // export function postRegisterData({nickname: string, type:number, gender:number, schoolName: string,major: string,wxNumber: string, mediaIds: string[], detail: string,ilike :string,iwish :string }:) {
        function postRegisterData(data) {
            return postJSON(HOST + "/info/v1/", data);
        }
        Resource.postRegisterData = postRegisterData;
        /**
         * 验证短信发送
         */
        function postVerifySms(phone) {
            return postJSON(HOST + "/info/verify_sms/", { phone: phone });
        }
        Resource.postVerifySms = postVerifySms;
        /**
         *打分
         */
        function postMarkScore(recordId, score) {
            return postJSON(HOST + "/record/" + recordId + "/grade", { score: score });
        }
        Resource.postMarkScore = postMarkScore;
        /**
         * 发起投食
         */
        function postVote(albumId) {
            return postJSON(HOST + "/feed/" + albumId);
        }
        Resource.postVote = postVote;
        /**
         * 发起订单
         */
        function postGiftOrder(data) {
            return postJSON(HOST + "/gift/order/", data);
        }
        Resource.postGiftOrder = postGiftOrder;
        /**
         * 获取提现信息
         */
        function getExchangeInfo() {
            return postJSON(HOST + "/account/info/");
        }
        Resource.getExchangeInfo = getExchangeInfo;
        /**
         *获取提现列表
         */
        function getExchangeListInfo(page) {
            return getJSON(HOST + "/account/withdraw/list?page=" + page);
        }
        Resource.getExchangeListInfo = getExchangeListInfo;
        /**
         * 提现
         */
        function exchange(giftPgNum) {
            return postJSON(HOST + "/account/withdraw", { giftPgNum: giftPgNum });
        }
        Resource.exchange = exchange;
        function postBuy(_a, payParam) {
            var _this = this;
            var number = _a.orderId;
            return postJSON(HOST + "/insurance/orders/weibo").then(function (res) {
                return WeixinUtil.pay(_this.payParam);
            });
        }
        Resource.postBuy = postBuy;
        /**
         * 获取渠道号信息
         */
        function getSchoolConfig(schoolId) {
            return getJSON(HOST + "/channel/" + (schoolId || '1000') + "/info");
        }
        Resource.getSchoolConfig = getSchoolConfig;
        /**
         * 获取我投食过的列表
         */
        function getMyVotedAlbumList(page) {
            return getJSON(HOST + "/info/ilike?page=" + page);
        }
        Resource.getMyVotedAlbumList = getMyVotedAlbumList;
        /**
         * 获取全国男神女神榜列表
         */
        function getHotestAlbumList(page) {
            return getJSON(HOST + "/info/list?sort=gift&page=" + page);
        }
        Resource.getHotestAlbumList = getHotestAlbumList;
        /**
         * 获取全国最新
         */
        function getNewestAlbumList(page) {
            return getJSON(HOST + "/info/list?sort=time&page=" + page);
        }
        Resource.getNewestAlbumList = getNewestAlbumList;
        /**
         * 获取本校热门
         */
        function getSchoolHotAlbumList(page) {
            var schoolId = RoommateApp.QueryString.schoolId;
            return getJSON(HOST + "/info/list?sort=gift&school_id=" + schoolId + "&page=" + page);
        }
        Resource.getSchoolHotAlbumList = getSchoolHotAlbumList;
        /**
         * 获取全国颜值
         */
        function getYanZhiAlbumList(page) {
            return getJSON(HOST + "/info/list?sort=grade&&page=" + page);
        }
        Resource.getYanZhiAlbumList = getYanZhiAlbumList;
        /**
         * 获取本校颜值
         */
        function getSchoolYanZhiAlbumList(page) {
            var schoolId = RoommateApp.QueryString.schoolId;
            return getJSON(HOST + "/info/list?sort=grade&school_id=" + schoolId + "&page=" + page);
        }
        Resource.getSchoolYanZhiAlbumList = getSchoolYanZhiAlbumList;
        /**
         * 搜索
         */
        function getSearchListByKeyword(keyword, page) {
            return getJSON(HOST + "/info/search?q=" + keyword + "&page=" + page);
        }
        Resource.getSearchListByKeyword = getSearchListByKeyword;
        /**
         * 请求用户的卖室友数据
         */
        function getMyPublishAlbumList(page) {
            console.log(HOST + "/info/byme?page=" + page);
            return getJSON(HOST + "/info/byme?page=" + page);
        }
        Resource.getMyPublishAlbumList = getMyPublishAlbumList;
        /**
         * 请求评论列表
         */
        function getCommentList(albumId, lastCommentId) {
            var url = HOST + "/info/" + albumId + "/comments";
            if (lastCommentId != null) {
                url += "?last=" + lastCommentId;
            }
            console.log(url);
            return getJSON(url);
        }
        Resource.getCommentList = getCommentList;
        /**
         * 投诉
         */
        function postComplain(data) {
            return postJSON(HOST + "/info/report/", data);
        }
        Resource.postComplain = postComplain;
        /**
         * 获取用户信息
         */
        function getUserInfo() {
            return getJSON(HOST + "/user/info");
        }
        Resource.getUserInfo = getUserInfo;
        /**
         * 爆料详情
         */
        function getAlbumInfo(weiboId) {
            return getJSON(HOST + "/info/" + weiboId);
        }
        Resource.getAlbumInfo = getAlbumInfo;
        /**
         * 爆料评论发表
         */
        function postComment(weiboId, content, toCommentId) {
            return postJSON(HOST + "/info/" + weiboId + "/comments", { toCommentId: toCommentId, content: content });
        }
        Resource.postComment = postComment;
        /**
         * 颜值打分评论发表
         */
        // export function postYanZhiComment(weiboId: number, content: string, type: string): Promise<YanZhiReponse> {
        //     return postJSON(`${HOST}/info/${weiboId}/comments`, {weiboId, content, type});
        // }
        /**
         *更新颜值评论
         */
        function postUpdateYanZhiComment(commentId, content) {
            return postJSON(HOST + "/comment/" + commentId + "/update", { content: content });
        }
        Resource.postUpdateYanZhiComment = postUpdateYanZhiComment;
        // /**
        //  * 删除评论
        //  */
        // export function deleteComment(weiboId: number, commentId: number) {
        //     return deleteJSON(`${HOST}/insurance/weibo/${weiboId}/comments/${commentId}`);
        // }
        /**
         * 删除评论
         */
        function deleteComment(commentId) {
            return deleteJSON(HOST + "/info/comment/" + commentId);
        }
        Resource.deleteComment = deleteComment;
        /**
         *
         */
        function pageVisit() {
            return getJSON(HOST + "/visit");
        }
        Resource.pageVisit = pageVisit;
        function postShareData(options) {
            return postJSON(HOST + "/share", options);
        }
        Resource.postShareData = postShareData;
        function deleteJSON(url) {
            return ajax({
                url: url,
                type: 'DELETE',
                headers: {
                    Accept: 'application/json'
                },
                responseType: 'json',
                withCredentials: true
            }).catch(onError);
        }
        function getJSON(url) {
            return ajax({
                url: url,
                responseType: 'json',
                withCredentials: true
            }).catch(onError);
        }
        function postJSON(url, data) {
            return ajax({
                url: url,
                data: data,
                type: 'POST',
                contentType: 'application/json',
                responseType: 'json',
                withCredentials: true
            }).catch(onError);
        }
        var LOGIN_REQUIRED = 'LOGIN_REQUIRED';
        function onError(err) {
            if (err.res.message === LOGIN_REQUIRED) {
                location.replace("http://m.pinzvip.cn/api/wx/auth/userinfo?redirect_url=" + encodeURIComponent(location.href));
                return;
            }
            return Promise.reject(err);
        }
    })(Resource = RoommateApp.Resource || (RoommateApp.Resource = {}));
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../lib/drunk.d.ts" />
/// <reference path="../lib/application.d.ts" />
/// <reference path="service/weixin.ts" />
/// <reference path="service/resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var token = (document.cookie.match(/usercheck=([^;]+?)/) || [])[1];
    if (!token) {
        // 如果没有登录，先登录
        location.replace("http://m.pinzvip.cn/api/wx/auth/userinfo?redirect_url=" + encodeURIComponent(location.href));
    }
    else {
        drunk.config.prefix = 'd-';
        drunk.Application.start(document.querySelector('application'));
        WeixinUtil.config();
    }
    window.addEventListener('hashchange', function () {
        RoommateApp.Resource.pageVisit();
    });
    RoommateApp.Resource.pageVisit();
})(RoommateApp || (RoommateApp = {}));
var RoommateApp;
(function (RoommateApp) {
    var BaseModel = (function () {
        function BaseModel() {
            this._listeners = [];
        }
        BaseModel.prototype.subscribe = function (listener) {
            var index = this._listeners.indexOf(listener);
            if (index === -1) {
                this._listeners.push(listener);
                listener.call(undefined, this.store);
            }
        };
        BaseModel.prototype.unsubscribe = function (listener) {
            var index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
        BaseModel.prototype.publish = function () {
            var _this = this;
            this._listeners.slice().forEach(function (listener) {
                listener.call(undefined, _this.store);
            });
        };
        BaseModel.prototype.release = function () {
            this._listeners = null;
            this.store = null;
        };
        return BaseModel;
    }());
    RoommateApp.BaseModel = BaseModel;
})(RoommateApp || (RoommateApp = {}));
/// <reference path="./baseModel.ts" />
/// <reference path="../service/resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var AlbumInfoModel = (function (_super) {
        __extends(AlbumInfoModel, _super);
        function AlbumInfoModel() {
            var _this = _super.call(this) || this;
            _this.store = {
                albumInfo: null,
                comments: [],
                isFetchComments: false,
                isNoMoreComments: false,
                isPostComment: false
            };
            return _this;
        }
        AlbumInfoModel.prototype.setAlbumId = function (albumdId) {
            this.albumdId = albumdId;
            this.store.comments = [];
            this.lastCommentId = null;
            this.store.isFetchComments = false;
            this.store.isNoMoreComments = false;
            this.fetchAlbumInfo();
            this.fetchComments();
        };
        AlbumInfoModel.prototype.fetchAlbumInfo = function () {
            var _this = this;
            RoommateApp.Resource.getAlbumInfo(this.albumdId).done(function (res) {
                _this.store.albumInfo = res;
                _this.publish();
            });
        };
        AlbumInfoModel.prototype.fetchComments = function () {
            var _this = this;
            if (this.store.isFetchComments || this.store.isNoMoreComments) {
                return;
            }
            this.store.isFetchComments = true;
            RoommateApp.Resource.getCommentList(this.albumdId, this.lastCommentId).then(function (res) {
                var list = _this.store.comments;
                if (res.list.length > 0) {
                    list.push.apply(list, res.list);
                }
                _this.store.isNoMoreComments = res.list.length === 0;
                if (list.length) {
                    _this.lastCommentId = list[list.length - 1].id;
                }
            }, function (err) {
                console.error(err);
            }).done(function () {
                _this.store.isFetchComments = false;
                _this.publish();
            });
            this.publish();
        };
        AlbumInfoModel.prototype.addComment = function (content, commentId) {
            var _this = this;
            if (this.store.isPostComment) {
                return drunk.Promise.reject({ success: false, message: '正在提交...' });
            }
            this.store.isPostComment = true;
            var promise = RoommateApp.Resource.postComment(this.albumdId, content, commentId).then(function (res) {
                _this.store.comments.unshift(res);
                return {
                    success: true,
                    message: '评论成功'
                };
            }, function (err) {
                console.error(err);
                return {
                    success: false,
                    message: err.res.message || '评论失败'
                };
            }).then(function (res) {
                _this.store.isPostComment = false;
                _this.publish();
                return res;
            });
            this.publish();
            return promise;
        };
        return AlbumInfoModel;
    }(RoommateApp.BaseModel));
    RoommateApp.AlbumInfoModel = AlbumInfoModel;
})(RoommateApp || (RoommateApp = {}));
/// <reference path="./baseModel.ts" />
/// <reference path="../service/resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var AlbumTypes;
    (function (AlbumTypes) {
        AlbumTypes[AlbumTypes["newest"] = 0] = "newest";
        AlbumTypes[AlbumTypes["hotest"] = 1] = "hotest";
        AlbumTypes[AlbumTypes["schoolHot"] = 2] = "schoolHot";
        AlbumTypes[AlbumTypes["myVoted"] = 3] = "myVoted";
        AlbumTypes[AlbumTypes["search"] = 4] = "search";
        AlbumTypes[AlbumTypes["yanZhi"] = 5] = "yanZhi";
        AlbumTypes[AlbumTypes["schoolYanZhi"] = 6] = "schoolYanZhi";
    })(AlbumTypes = RoommateApp.AlbumTypes || (RoommateApp.AlbumTypes = {}));
    var AlbumListModel = (function (_super) {
        __extends(AlbumListModel, _super);
        function AlbumListModel() {
            var _this = _super.call(this) || this;
            _this.listByType = {};
            _this.pageCountByType = {};
            _this.isNoMoreDataByType = {};
            _this.isFetchingByType = {};
            _this.store = {
                isNoMoreData: false,
                isFetching: false,
                list: [],
                type: null
            };
            return _this;
        }
        AlbumListModel.prototype.fetch = function (type) {
            if (type === this.type) {
                return;
            }
            this.type = type;
            if (!this.listByType[type]) {
                this.pageCountByType[type] = 1;
                this.listByType[type] = [];
                this.isNoMoreDataByType[type] = false;
            }
            this.fetchNextPage();
            this.publish();
        };
        AlbumListModel.prototype.search = function (keyword) {
            var type = AlbumTypes.search;
            this.type = type;
            if (this.keyword != keyword) {
                this.keyword = keyword;
                this.listByType[type] = [];
                this.pageCountByType[type] = 1;
                this.isNoMoreDataByType[type] = false;
                this.isFetchingByType[type] = false;
                this.searchPromise && this.searchPromise.cancel();
                this.fetchNextPage();
            }
            this.publish();
        };
        AlbumListModel.prototype.fetchNextPage = function () {
            var _this = this;
            var _a = this, type = _a.type, isFetchingByType = _a.isFetchingByType, isNoMoreDataByType = _a.isNoMoreDataByType, pageCountByType = _a.pageCountByType, listByType = _a.listByType;
            if (isFetchingByType[type] || isNoMoreDataByType[type]) {
                return;
            }
            var promise;
            var pageCount = pageCountByType[type];
            switch (this.type) {
                case AlbumTypes.hotest:
                    promise = RoommateApp.Resource.getHotestAlbumList(pageCount);
                    break;
                case AlbumTypes.myVoted:
                    promise = RoommateApp.Resource.getMyVotedAlbumList(pageCount);
                    break;
                case AlbumTypes.newest:
                    promise = RoommateApp.Resource.getNewestAlbumList(pageCount);
                    break;
                case AlbumTypes.schoolHot:
                    promise = RoommateApp.Resource.getSchoolHotAlbumList(pageCount);
                    break;
                case AlbumTypes.yanZhi:
                    promise = RoommateApp.Resource.getYanZhiAlbumList(pageCount);
                    break;
                case AlbumTypes.schoolYanZhi:
                    promise = RoommateApp.Resource.getSchoolYanZhiAlbumList(pageCount);
                    break;
                case AlbumTypes.search:
                    promise = this.searchPromise = RoommateApp.Resource.getSearchListByKeyword(this.keyword, pageCount);
                    break;
            }
            isFetchingByType[type] = true;
            promise.then(function (res) {
                isNoMoreDataByType[type] = !res.list.length;
                if (!isNoMoreDataByType[type]) {
                    (_a = listByType[type]).push.apply(_a, res.list);
                    pageCountByType[type] += 1;
                }
                var _a;
            }, function (err) {
                console.error(err);
            }).done(function () {
                isFetchingByType[type] = false;
                _this.publish();
            });
            this.fetchingPromise = promise;
        };
        AlbumListModel.prototype.refresh = function () {
            this.clear();
            if (this.type === AlbumTypes.search) {
                var keyword = this.keyword;
                this.keyword = null;
                this.search(keyword);
            }
            else {
                var type = this.type;
                this.type = null;
                this.fetch(type);
            }
        };
        AlbumListModel.prototype.clear = function () {
            if (this.fetchingPromise) {
                this.fetchingPromise.cancel();
                this.fetchingPromise = null;
            }
            this.listByType = {};
            this.pageCountByType = {};
            this.isNoMoreDataByType = {};
            this.isFetchingByType = {};
        };
        AlbumListModel.prototype.publish = function () {
            var _a = this, type = _a.type, store = _a.store, isNoMoreDataByType = _a.isNoMoreDataByType, isFetchingByType = _a.isFetchingByType, listByType = _a.listByType;
            store.isFetching = isFetchingByType[type];
            store.isNoMoreData = isNoMoreDataByType[type];
            store.list = listByType[type];
            store.type = type;
            _super.prototype.publish.call(this);
        };
        Object.defineProperty(AlbumListModel, "instance", {
            get: function () {
                if (!this._instance) {
                    this._instance = new AlbumListModel();
                }
                return this._instance;
            },
            enumerable: true,
            configurable: true
        });
        return AlbumListModel;
    }(RoommateApp.BaseModel));
    RoommateApp.AlbumListModel = AlbumListModel;
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts" />
/// <reference path="../../../service/resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlbumList = (function (_super) {
        __extends(AlbumList, _super);
        function AlbumList() {
            return _super.apply(this, arguments) || this;
        }
        /**
         * 跳某个详情页面
         */
        AlbumList.prototype.viewDetail = function (albumId) {
            location.href = '#/detail/' + albumId;
        };
        AlbumList.prototype.init = function () {
            this.schoolId = RoommateApp.QueryString.schoolId;
            this.fetchUserInfo();
        };
        // 用户信息
        AlbumList.prototype.fetchUserInfo = function () {
            var _this = this;
            RoommateApp.Resource.getUserInfo().done(function (res) {
                _this.userInfo = res;
                // console.log(res);
            });
        };
        /**
         * 打分
         */
        AlbumList.prototype.markScore = function (item) {
            if (!item.isCanGrade) {
                this.$emit('alert', { 'title': '温馨提示', 'content': '已经给TA评过分啦~' });
                return;
            }
            this.$emit('alertmarkview', item);
        };
        /**
         * 投票
         */
        AlbumList.prototype.vote = function (album) {
            var _this = this;
            if (this.isVoting) {
                return;
            }
            this.isVoting = true;
            RoommateApp.Resource.postVote(album.number).then(function (res) {
                album.hotStripNum = res.totalFeedNum; //投票之后返回的总辣条数量
                if (res.isSuccess) {
                    _this.$emit('alert', {
                        title: '投食成功',
                        content: res.message
                    });
                }
                else {
                    _this.$emit('alert', {
                        title: '投食失败',
                        content: res.message
                    });
                }
                // this.fetchWeiboInfo();
                //更新可用辣条数量
                _this.$emit('updated', res.availableNum);
                _this.isVoting = false;
            }).catch(function (err) {
                _this.$emit('alert', {
                    title: '投食失败',
                    content: err.res && err.res.error.message || err.res.message || '请重试'
                });
                _this.isVoting = false;
            });
        };
        return AlbumList;
    }(Component));
    AlbumList = __decorate([
        component('album-list')
    ], AlbumList);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlertView = (function (_super) {
        __extends(AlertView, _super);
        function AlertView() {
            var _this = _super.apply(this, arguments) || this;
            _this.title = 'title: 设置标题';
            _this.content = 'content: 设置内容';
            _this.visible = false;
            return _this;
        }
        // 按钮文案
        // buttonName = '确认';
        AlertView.prototype.onButtonClicked = function () {
            this.$emit('confirm');
            this.visible = false;
        };
        return AlertView;
    }(Component));
    AlertView = __decorate([
        component('alert-view')
    ], AlertView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
/// <reference path="../../../service/query.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlertBuyView = (function (_super) {
        __extends(AlertBuyView, _super);
        function AlertBuyView() {
            var _this = _super.apply(this, arguments) || this;
            _this.choosedIndex = -1; //被选中的index
            return _this;
        }
        AlertBuyView.prototype.turnStatus = function (bags, index) {
            if (bags[index].isCanBuy) {
                this.choosedIndex = index;
            }
        };
        AlertBuyView.prototype.buy = function (bags, sendtonumber) {
            var _this = this;
            // var orderInfor = {};
            if (!bags[this.choosedIndex]) {
                console.log("没有选择礼包");
                return this.$emit('alert', '购买失败', '请选择想要购买的礼包~');
            }
            this.orderInfor = {
                "giftpg_id": bags[this.choosedIndex].giftPgId,
                "record_id": sendtonumber,
                "back_url": window.location.href
            };
            // console.log(this.orderInfor);
            // 发起订单，然后跳到订单支付页面
            RoommateApp.Resource.postGiftOrder(this.orderInfor).then(function (res) {
                //发起订单成功以后，返回订单编号，根据订单编号跳转到支付页面，支付成功后根据订单携带的卖室友详情页的number跳回室友详情页，提示送礼成功
                _this.orderId = res.orderNo;
                location.href = res.cashierUrl;
                // location.href = "http://test.m.pinzvip.cn:8000/src/" + '?id=' + this.orderId;
            }, function (err) {
                console.log(err);
            });
        };
        return AlertBuyView;
    }(Component));
    AlertBuyView = __decorate([
        component('alert-buy-view')
    ], AlertBuyView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
/// <reference path="../../../service/query.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var qrcodePromise;
    var ClickQRCodeView = (function (_super) {
        __extends(ClickQRCodeView, _super);
        function ClickQRCodeView() {
            return _super.apply(this, arguments) || this;
        }
        ClickQRCodeView.prototype.init = function () {
            // this.$watch('visible', visible => {
            //     this.shouldVisible = this.visible && this.shouldVisibleNow;
            // });
            var _this = this;
            if (RoommateApp.QueryString.schoolId) {
                // 如果有school_id，请求二维码链接
                qrcodePromise = qrcodePromise || RoommateApp.Resource.getSchoolConfig(RoommateApp.QueryString.schoolId);
                qrcodePromise.done(function (res) {
                    _this.qrcodeUrl = res.qrcode;
                });
            }
        };
        return ClickQRCodeView;
    }(Component));
    ClickQRCodeView = __decorate([
        component('alert-click-qrcode-view')
    ], ClickQRCodeView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlertConfirmView = (function (_super) {
        __extends(AlertConfirmView, _super);
        function AlertConfirmView() {
            var _this = _super.apply(this, arguments) || this;
            _this.title = 'title: 设置标题';
            _this.content = 'content: 设置内容';
            _this.visible = false;
            return _this;
        }
        // 按钮文案
        // buttonName = '确认';
        // cancelButtonName = '取消';
        AlertConfirmView.prototype.onButtonCancelClicked = function () {
            this.visible = false;
        };
        AlertConfirmView.prototype.onButtonSureClicked = function () {
            this.$emit('confirm');
            this.visible = false;
        };
        return AlertConfirmView;
    }(Component));
    AlertConfirmView = __decorate([
        component('alert-confirm-view')
    ], AlertConfirmView);
})(RoommateApp || (RoommateApp = {}));
/**
 * Created by RD on 2017/1/12.
 */
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlertMarkView = (function (_super) {
        __extends(AlertMarkView, _super);
        function AlertMarkView() {
            var _this = _super.apply(this, arguments) || this;
            _this.tipShaiziVisible = true;
            _this.messageInfo = '';
            _this.type = 'grade';
            _this.scoreDisabled = false;
            return _this;
        }
        //自己打分
        AlertMarkView.prototype.submitMarkSelf = function (markOrderId) {
            if (this.isSubmiting) {
                return;
            }
            if (0 < parseInt(this.scoreSelf) && parseInt(this.scoreSelf) <= 10) {
                this.isSubmiting = true;
                this.markOrderId = markOrderId;
                this.scoreSelfNum = this.resultScore = parseInt(this.scoreSelf);
                this.postScore(this.markOrderId, this.scoreSelfNum);
            }
            else {
                this.scoreSelf = '';
                this.tipSelfVisible = true;
                return;
            }
        };
        //提交筛子分数
        AlertMarkView.prototype.submitMarkShaizi = function (score) {
            if (!score) {
                return;
            }
            else {
                this.postScore(this.markOrderId, score);
            }
        };
        //开始摇色子
        AlertMarkView.prototype.beginTakeScore = function (markOrderId) {
            var _this = this;
            if (this.isSubmiting || this.isBeginTakeScore) {
                this.tipShaiziClickVisible = true;
                return;
            }
            this.scoreDisabled = true;
            // this.showPopDiv = true;
            this.isSubmiting = true;
            this.isBeginTakeScore = true;
            this.markOrderId = markOrderId;
            var a = setTimeout(function () {
                _this.resultScore = _this.scoreShaizi = _this.tackRandomScore(); //获取随机分数
                _this.isBeginTakeScore = false;
                _this.tipShaiziVisible = false; //隐藏戳我的提示
                _this.submitMarkShaizi(_this.scoreShaizi);
            }, 2000);
        };
        AlertMarkView.prototype.postScore = function (id, scoreValue) {
            var _this = this;
            this.isSubmiting = true;
            this.showTaost();
            RoommateApp.Resource.postMarkScore(id, scoreValue).then(function (res) {
                _this.responseInf = res;
                _this.isShowMessageView(scoreValue);
            }, function (err) {
                _this.$emit('alertmarkresult', {
                    title: '打分失败',
                    content: err.res && err.res.error.message || '请重试'
                });
                _this.initValue();
            }).done(function (res) {
                _this.hideTaost();
            });
        };
        AlertMarkView.prototype.isShowMessageView = function (score) {
            if (score == 1 || score == 2 || score == 3 || score == 9 || score == 10) {
                this.showMark = true; //显示留言框
                // this.showPopDiv = false;
                this.scoreSelf = "";
                this.tipSelfVisible = false;
            }
            else {
                this.$emit('alertmarkresult', {
                    'title': '打分成功',
                    'content': '您给评分为' + score + '分，在留言板可看到您的评分~'
                }, this.responseInf);
                this.initValue();
            }
        };
        // 留言
        AlertMarkView.prototype.leaveMessage = function () {
            if (this.messageInfo == '') {
                this.tipMessageVisible = true;
                return;
            }
            else {
                this.messageInfoAll = "给该室友打了" + this.resultScore + "分~,还说：" + this.messageInfo;
                this.postUpdateMessage(this.messageInfoAll);
            }
        };
        // 取消留言
        AlertMarkView.prototype.cancelLeaveMessage = function () {
            this.alertSuccess('alertmarkresult', {
                'title': '评分成功',
                'content': '您评分为' + this.resultScore + '分'
            });
        };
        AlertMarkView.prototype.postUpdateMessage = function (message) {
            var _this = this;
            this.showTaost();
            RoommateApp.Resource.postUpdateYanZhiComment(this.responseInf.commentId, message).then(function (res) {
                _this.hideTaost();
                _this.alertSuccess('alertmarkresult', {
                    'title': '评论成功',
                    'content': message,
                });
            }, function (err) {
                _this.hideTaost();
                _this.alertFail();
            });
        };
        AlertMarkView.prototype.alertSuccess = function (eventName, infor) {
            this.$emit(eventName, infor, this.responseInf);
            this.initValue();
        };
        AlertMarkView.prototype.alertFail = function () {
            this.$emit('alertmarkresult', {
                'title': '温馨提示', 'content': '网络超时'
            });
            this.initValue();
        };
        AlertMarkView.prototype.close = function () {
            if (this.responseInf) {
                this.alertSuccess('alertmarkresult', {
                    'title': '评论成功',
                    'content': '您评分' + this.resultScore + '分，在留言板可以看到您的留言哦~'
                });
            }
            this.initValue();
        };
        AlertMarkView.prototype.initValue = function () {
            this.showMark = false;
            this.scoreShaizi = 0;
            this.scoreSelf = '';
            this.tipMessageVisible = false;
            this.tipSelfVisible = false;
            this.tipShaiziVisible = true;
            this.visible = false;
            this.isSubmiting = false;
            this.tipShaiziClickVisible = false;
            this.messageInfo = '';
            this.responseInf = null;
            this.scoreDisabled = false;
        };
        //获取随机分数
        AlertMarkView.prototype.tackRandomScore = function () {
            var ran = Math.random() * 100 + 1;
            if (ran == 1) {
                return 1;
            }
            else if (ran > 1 && ran <= 11) {
                return 2;
            }
            else if (ran >= 12 && ran < 27) {
                return 5;
            }
            else if (ran >= 27 && ran < 57) {
                return 6;
            }
            else if (ran >= 57 && ran < 87) {
                return 9;
            }
            else if (ran >= 87 && ran <= 100) {
                return 10;
            }
        };
        AlertMarkView.prototype.showTaost = function () {
            this.$emit('toast', true);
        };
        AlertMarkView.prototype.hideTaost = function () {
            this.$emit('toast', false);
        };
        return AlertMarkView;
    }(Component));
    AlertMarkView = __decorate([
        component('alert-mark-view')
    ], AlertMarkView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
/// <reference path="../../../service/query.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var qrcodePromise;
    var QRCodeView = (function (_super) {
        __extends(QRCodeView, _super);
        function QRCodeView() {
            return _super.apply(this, arguments) || this;
        }
        QRCodeView.prototype.init = function () {
            var _this = this;
            this.$watch('visible', function (visible) {
                _this.shouldVisible = _this.visible && _this.shouldVisibleNow;
            });
            if (RoommateApp.QueryString.schoolId) {
                // 如果有school_id，请求二维码链接
                qrcodePromise = qrcodePromise || RoommateApp.Resource.getSchoolConfig(RoommateApp.QueryString.schoolId);
                qrcodePromise.done(function (res) {
                    _this.qrcodeUrl = res.qrcode;
                });
            }
        };
        Object.defineProperty(QRCodeView.prototype, "shouldVisibleNow", {
            get: function () {
                if (!this.visible) {
                    return false;
                }
                var key = 'qrcode-last-show-time';
                var lastShowTime = localStorage.getItem(key);
                if (!lastShowTime || parseFloat(lastShowTime) <= Date.now()) {
                    localStorage.setItem(key, (Date.now() + 86400000) + '');
                    return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        return QRCodeView;
    }(Component));
    QRCodeView = __decorate([
        component('alert-qrcode-view')
    ], QRCodeView);
})(RoommateApp || (RoommateApp = {}));
/**
 * Created by RD on 2016/12/5.
 */
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var ComplainView = (function (_super) {
        __extends(ComplainView, _super);
        function ComplainView() {
            return _super.apply(this, arguments) || this;
        }
        ComplainView.prototype.onCancelClicked = function () {
            this.visible = false;
        };
        ComplainView.prototype.onSubmitClicked = function () {
            var _this = this;
            if (this.isSubmit || this.id == null) {
                return;
            }
            if (!this.stringTest(this.content)) {
                return this.$emit('alert', '投诉失败', '请填写投诉内容');
            }
            if (!this.stringTest(this.phone)) {
                return this.$emit('alert', '投诉失败', '请填写联系方式');
            }
            this.isSubmit = true;
            RoommateApp.Resource.postComplain({ 'content': this.content, 'phone': this.phone, 'record_id': this.id }).then(function (res) {
                // console.log("success-----postComplain")
                _this.$emit('alert', '投诉成功', '我们的工作人员会尽快与您联系，工作人员微信号：biaobiaobabx1');
                _this.content = '';
                _this.phone = '';
            }, function (err) {
                console.error(err);
                _this.$emit('alert', '投诉失败', '请重试');
            }).done(function () {
                _this.isSubmit = false;
                _this.visible = false;
            });
        };
        /**
         * 字符串验证
         */
        ComplainView.prototype.stringTest = function (str) {
            return str && /\S/.test(str);
        };
        return ComplainView;
    }(Component));
    ComplainView = __decorate([
        component('complain-view')
    ], ComplainView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var FooterView = (function (_super) {
        __extends(FooterView, _super);
        function FooterView() {
            return _super.apply(this, arguments) || this;
        }
        FooterView.prototype.init = function () {
            this.$resolveData({
                statistic: RoommateApp.Resource.getStatistic()
            });
        };
        return FooterView;
    }(Component));
    FooterView = __decorate([
        component('footer-view')
    ], FooterView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
/// <reference path="../../../service/query.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var HeaderView = (function (_super) {
        __extends(HeaderView, _super);
        function HeaderView() {
            var _this = _super.apply(this, arguments) || this;
            _this.banners = [{ img: 'img/banner.png', link: '' }];
            _this.carouselIndex = 0;
            return _this;
        }
        HeaderView.prototype.init = function () {
            var _this = this;
            this.$resolveData({
                statistic: RoommateApp.Resource.getStatistic()
            });
            if (window.location.href.indexOf('mine') != -1) {
                this.minePage = true;
            }
            RoommateApp.Resource.getSchoolConfig(RoommateApp.QueryString.schoolId).then(function (res) {
                if (res.banners && res.banners.length) {
                    _this.banners = res.banners;
                }
            });
        };
        HeaderView.prototype.goHome = function (e) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/home';
        };
        HeaderView.prototype.goEntry = function (e) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/entry';
        };
        HeaderView.prototype.goMine = function (e) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/mine';
        };
        return HeaderView;
    }(Component));
    HeaderView = __decorate([
        component('header-view')
    ], HeaderView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var ShareView = (function (_super) {
        __extends(ShareView, _super);
        function ShareView() {
            return _super.apply(this, arguments) || this;
        }
        return ShareView;
    }(Component));
    ShareView = __decorate([
        component('share-view')
    ], ShareView);
})(RoommateApp || (RoommateApp = {}));
/**
 * Created by RD on 2017/1/20.
 */
/**
 * Created by RD on 2017/1/12.
 */
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var ToastView = (function (_super) {
        __extends(ToastView, _super);
        function ToastView() {
            return _super.apply(this, arguments) || this;
        }
        return ToastView;
    }(Component));
    ToastView = __decorate([
        component('toast-view')
    ], ToastView);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="./weixin.ts" />
/// <reference path="./query.ts" />
/// <reference path="./resource.ts" />
var RoommateApp;
(function (RoommateApp) {
    var Share;
    (function (Share) {
        var logo = 'http://m.pinzvip.cn/babx/sellchum/img/share-img.png';
        var HOME_PAGE_URL = "http://m.pinzvip.cn/babx/sellchum/?school_id=" + RoommateApp.QueryString.schoolId + "&channel_type=" + RoommateApp.QueryString.channelType;
        /**
         * 分享首页、本宝宝、报名页
         */
        function homePage() {
            return shareAndLog({
                title: homeList.title,
                link: HOME_PAGE_URL,
                imgUrl: logo,
                desc: homeList.desc
            });
        }
        Share.homePage = homePage;
        /**
         * 分享福利页
         */
        function welfarePage() {
            return shareAndLog({
                title: welfareList.title,
                link: HOME_PAGE_URL,
                imgUrl: logo,
                desc: welfareList.desc
            });
        }
        Share.welfarePage = welfarePage;
        /**
         * 分享某个详情页面
         */
        function detailPage(link, imgUrl) {
            return shareAndLog({
                title: getRandomDescription().title,
                link: link,
                imgUrl: imgUrl || logo,
                desc: getRandomDescription().desc
            });
        }
        Share.detailPage = detailPage;
        function shareAndLog(options) {
            return WeixinUtil.share(options).then(function () {
                RoommateApp.Resource.postShareData(options);
            });
        }
        var homeList = {
            title: '室友太抢手，牛逼就领走',
            desc: '室友太俏，快点来撩'
        };
        var welfareList = {
            title: '多多关爱你室友，世上少条单身狗。',
            desc: '患难见真情，室友不卖都不行。'
        };
        var descList = [
            {
                title: '室友太抢手，牛逼就领走。',
                desc: '室友太俏，快点来撩。'
            },
            {
                title: '多多关爱你室友，世上少条单身狗。',
                desc: '患难见真情，室友不卖都不行。'
            },
            {
                title: '我爱室友我操心，为她脱单天天拼。',
                desc: '为了有人亲TA嘴儿，老子奔波跑断腿儿。'
            },
            {
                title: '来，看看人家的室友。',
                desc: '请备好纸巾。'
            },
            {
                title: '我跟室友特别好，给TA卖了我就跑。',
                desc: '增进你俩感情关键的一步'
            },
            {
                title: '真爱她，就给她找个对象。',
                desc: '网上不说了嘛，真正的好室友，是把她当闺女养。'
            },
            {
                title: '我帮你处对象，你喂我吃狗粮。',
                desc: '笑你MLGB！我都是为了你为了你！'
            },
            {
                title: '室友再不好，也是我的宝。',
                desc: '室友谈恋爱，我去把房开。'
            },
            {
                title: '一朝卖室友，卖完室友对象请喝酒。',
                desc: '酒是精品粮，滋阴又壮阳，知你真有病，喝酒也没用。。。'
            }
        ];
        function getRandomDescription() {
            return descList[Math.random() * descList.length | 0];
        }
    })(Share = RoommateApp.Share || (RoommateApp.Share = {}));
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../lib/drunk.d.ts" />
/// <reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />
/// <reference path="../../model/albumInfoModel.ts" />
var RoommateApp;
(function (RoommateApp) {
    var Component = drunk.Component, component = drunk.component;
    var Share = RoommateApp.Share;
    var Resource = RoommateApp.Resource;
    var AlbumInfoModel = RoommateApp.AlbumInfoModel;
    var DetailsPage = (function (_super) {
        __extends(DetailsPage, _super);
        function DetailsPage() {
            return _super.apply(this, arguments) || this;
        }
        DetailsPage.prototype.init = function () {
            var _this = this;
            this.albumInfoModel = new AlbumInfoModel();
            this.albumInfoModel.subscribe(function (store) {
                _this.commentList = store.comments;
                _this.album = store.albumInfo;
                _this.isPostComment = store.isPostComment;
                _this.setShareData();
            });
        };
        DetailsPage.prototype.onEnter = function (state) {
            this.schoolId = RoommateApp.QueryString.schoolId; // 10001: 默认的schoolId
            this.albumId = state.params.id;
            this.requestPageData();
        };
        DetailsPage.prototype.requestPageData = function () {
            this.commentList = [];
            this.albumInfoModel.setAlbumId(this.albumId);
            this.fetchUserInfo();
        };
        DetailsPage.prototype.onExit = function () {
            this.albumInfoModel.release();
        };
        DetailsPage.prototype.fetchUserInfo = function () {
            var _this = this;
            Resource.getUserInfo().done(function (res) {
                _this.userInfo = res;
            });
        };
        DetailsPage.prototype.setShareData = function () {
            var _this = this;
            if (this.album && this.album.mediaIds[0]) {
                Share.detailPage(location.href, this.album.mediaIds[0]).done(function () {
                    _this.alert('分享成功', '每日首次分享奖励 辣条X2，辣条要送给珍惜的人哦~');
                });
            }
        };
        //刷新信息
        DetailsPage.prototype.freshInfo = function () {
            this.requestPageData();
        };
        DetailsPage.prototype.fetchCommentList = function () {
            this.albumInfoModel.fetchComments();
        };
        /**
         * 投食
         */
        DetailsPage.prototype.vote = function () {
            var _this = this;
            if (this.isPostVote) {
                return;
            }
            this.isPostVote = true;
            Resource.postVote(this.albumId).then(function (res) {
                if (res.isSuccess) {
                    _this.alert('投食成功', res.message);
                    _this.albumInfoModel.fetchAlbumInfo();
                }
                else {
                    _this.alert('投食失败', res.message);
                }
            }, function (err) {
                console.error(err);
                _this.alert('投食失败', err.res.message || '请重试');
            }).done(function () {
                _this.isPostVote = false;
            });
        };
        DetailsPage.prototype.markScore = function () {
            if (!this.album.isCanGrade) {
                this.alert('温馨提示', '您已经打过分数了~');
                return;
            }
            this.markOrderNo = this.album.number;
            this.alertMarkVisible = true;
        };
        /**
         * 点开评论框
         */
        DetailsPage.prototype.openComment = function (comment) {
            comment = comment || {};
            this.toCommentId = comment.id;
            this.commentPlaceholder = comment.nickname && ('回复' + comment.nickname + ":");
            this.commentBoxVisible = true;
        };
        /**
         * 发表评论
         */
        DetailsPage.prototype.comment = function () {
            var _this = this;
            if (!this.commentContent || !/\S/.test(this.commentContent)) {
                return this.alert('温馨提示', '评论内容不能为空');
            }
            this.albumInfoModel.addComment(this.commentContent, this.toCommentId).done(function (res) {
                _this.alert('温馨提示', res.message);
                if (res.success) {
                    _this.commentBoxVisible = false;
                    _this.commentContent = '';
                }
            });
        };
        /**
         * 删除评论
         */
        DetailsPage.prototype.deleteComment = function (comment) {
            var _this = this;
            if (confirm('确认要屏蔽这条评论？')) {
                Resource.deleteComment(comment.id).then(function (res) {
                    _this.alert('屏蔽成功', '是不是感觉自己萌萌哒');
                    drunk.observable.$removeItem(_this.commentList, comment);
                }, function (err) {
                    _this.alert('屏蔽失败', '这条评论很顽强，再试试吧');
                });
            }
        };
        /**
         * 投诉
         */
        DetailsPage.prototype.complain = function () {
            this.complainViewVisible = true;
        };
        DetailsPage.prototype.doneMarkResult = function (alertParam, changeData) {
            this.alert(alertParam.title, alertParam.content);
            if (changeData) {
                this.album.faceScore = changeData.faceScore;
                this.album.count = changeData.count;
                this.album.isCanGrade = changeData.isCanGrade;
                this.freshInfo();
            }
            // console.log("编号为" + changeData.recordId);
        };
        DetailsPage.prototype.changeToastStatus = function (status) {
            this.toastVisible = status;
        };
        /**
         * 显示分享提示
         */
        DetailsPage.prototype.showShareView = function () {
            this.shareViewVisible = true;
        };
        DetailsPage.prototype.alert = function (title, content) {
            this.alertTitle = title;
            this.alertContent = content;
            this.alertVisible = true;
        };
        DetailsPage.prototype.alertOk = function () {
            if (this.alertCallback) {
                this.alertCallback();
                this.alertCallback = null;
            }
        };
        return DetailsPage;
    }(Component));
    DetailsPage = __decorate([
        component('details-page')
    ], DetailsPage);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../lib/drunk.d.ts" />
/// <reference path="../../../lib/application.d.ts" />
/// <reference path="../../service/share.ts" />
/// <reference path="../../service/resource.ts" />
/// <reference path="../../model/albumListModel.ts" />
var RoommateApp;
(function (RoommateApp) {
    var util = drunk.util;
    var Promise = drunk.Promise;
    var Component = drunk.Component;
    var component = drunk.component;
    var COOLDOWN_TIME = 60; // 发验证码的冷却时间为60秒
    var EntryPage = (function (_super) {
        __extends(EntryPage, _super);
        function EntryPage() {
            var _this = _super.apply(this, arguments) || this;
            _this.localImages = []; // 本地图片ID
            _this.pictures = []; // 微信返回的图片ID
            _this.type = 1; //类型
            _this.gender = 1; //性别
            _this.alertTitle = '卖室友失败';
            _this.alertVisible = false;
            return _this;
        }
        Object.defineProperty(EntryPage.prototype, "mobileValid", {
            get: function () {
                var str = this.tel;
                return !!str && /(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(str);
                ;
            },
            enumerable: true,
            configurable: true
        });
        EntryPage.prototype.init = function () {
            var _this = this;
            this.schoolId = RoommateApp.QueryString.schoolId;
            if (this.schoolId) {
                this.schoolInfoPormise = RoommateApp.Resource.getSchoolConfig(this.schoolId);
                this.schoolInfoPormise.then(function (res) {
                    _this.schoolName = res.name; //学校名称默认
                }).catch(function (err) {
                    console.log(err);
                });
            }
        };
        EntryPage.prototype.onEnter = function () {
            RoommateApp.Share.homePage();
        };
        /**
         * 提示失败
         */
        EntryPage.prototype.alertFail = function (message) {
            this.alertTitle = '卖室友失败';
            this.alertContent = message;
            this.alertVisible = true;
        };
        /**
         * 提示成功
         */
        EntryPage.prototype.alertDone = function (message) {
            this.alertVisible = true;
            this.alertContent = message;
            this.alertTitle = '卖室友成功';
        };
        /**
         * 弹窗确认按钮点击后的回调
         */
        EntryPage.prototype.alertOk = function () {
            if (this.alertCallback) {
                this.alertCallback();
                this.alertCallback = null;
            }
        };
        /**
         * 选择图片
         */
        EntryPage.prototype.chooseImage = function () {
            var _this = this;
            WeixinUtil.chooseImage(9 - this.localImages.length).then(function (res) {
                res.forEach(function (img) {
                    util.addArrayItem(_this.localImages, img);
                });
            }).catch(function (err) {
                console.log(err);
            });
        };
        /**
         * 发送验证码
         */
        EntryPage.prototype.sendVerifySms = function () {
            var _this = this;
            if (this.isSubmiting) {
                return;
            }
            this.isSubmiting = true;
            RoommateApp.Resource.postVerifySms(this.tel).then(function (res) {
                _this.isSubmiting = false;
                console.log(_this.tel);
                _this.remainTime = COOLDOWN_TIME;
                _this.startWaitingTimer();
            }, function (err) {
                _this.isSubmiting = false;
                _this.alertFail('发送失败,请重试');
            });
        };
        /**
         * 发送验证码后的有60s后的等待时间
         */
        EntryPage.prototype.startWaitingTimer = function () {
            var _this = this;
            this.waitingTimer = setTimeout(function () {
                _this.remainTime -= 1;
                if (_this.remainTime === -1) {
                    _this.waitingTimer = null;
                }
                else {
                    _this.startWaitingTimer();
                }
            }, 1000);
        };
        /**
         * 提交报名数据
         */
        EntryPage.prototype.submit = function () {
            var _this = this;
            if (this.isSubmiting) {
                return;
            }
            if (!this.stringTest(this.nickname)) {
                return this.alertFail('请输入合法的昵称哦');
            }
            if (!this.mobileTest(this.tel)) {
                return this.alertFail('请输入合法的手机号码哦');
            }
            if (!this.stringTest(this.captcha)) {
                return this.alertFail('请输入验证码');
            }
            if (!this.stringTest(this.schoolName)) {
                return this.alertFail('请输入正确的学校名称哦');
            }
            if (!this.stringTest(this.major)) {
                return this.alertFail('请输入正确的专业名称哦');
            }
            if (!this.stringTest(this.wxNumber)) {
                return this.alertFail('请输入正确的微信号码哦');
            }
            if (!this.stringTest(this.detail)) {
                return this.alertFail('请介绍下室友哦');
            }
            if (this.localImages.length < 3) {
                return this.alertFail('请最少上传3张不同的照片哦');
            }
            this.isSubmiting = true;
            this.uploadImages().then(function () {
                return RoommateApp.Resource.postRegisterData({
                    nickname: _this.nickname,
                    type: _this.type,
                    gender: _this.gender,
                    schoolName: _this.schoolName,
                    major: _this.major,
                    tel: _this.tel,
                    captcha: _this.captcha,
                    wxNumber: _this.wxNumber,
                    mediaIds: _this.pictures.slice(),
                    detail: _this.detail,
                    ilike: _this.iLike,
                    iwish: _this.iWish
                });
            }).then(function (res) {
                _this.localImages = [];
                _this.pictures = [];
                _this.alertCallback = function () {
                    location.href = '#/detail/' + res['number'];
                };
                _this.alertDone('赶紧拉你的好友给你投食辣条吧！');
                _this.isSubmiting = false;
                RoommateApp.AlbumListModel.instance.clear();
            }).catch(function (err) {
                _this.isSubmiting = false;
                _this.alertFail(err.res && err.res.error.message || err.res.message || '服务异常，请重试');
            });
        };
        /**
         * 发送请求
         */
        EntryPage.prototype.uploadImages = function () {
            var _this = this;
            if (this.pictures && this.pictures.length) {
                return Promise.resolve(this.pictures);
            }
            if (!this.localImages || !this.localImages.length) {
                return Promise.reject({ res: { error: { message: '请先选择图片' } } });
            }
            return WeixinUtil.uploadImage(this.localImages).then(function (pictures) { return _this.pictures = pictures; });
        };
        /**
         * 字符串验证
         */
        EntryPage.prototype.stringTest = function (str) {
            return str && /\S/.test(str);
        };
        /**
         * 手机号码验证
         */
        EntryPage.prototype.mobileTest = function (str) {
            return str && /(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(str);
        };
        return EntryPage;
    }(Component));
    __decorate([
        drunk.computed
    ], EntryPage.prototype, "mobileValid", null);
    EntryPage = __decorate([
        component('entry-page')
    ], EntryPage);
})(RoommateApp || (RoommateApp = {}));
/**
 * Created by RD on 2017/1/6.
 */
/// <reference path="../../../lib/drunk.d.ts" />
/// <reference path="../../../lib/application.d.ts" />
/// <reference path="../../service/share.ts" />
/// <reference path="../../service/resource.ts" />
/// <reference path="../../model/albumListModel.ts" />
var RoommateApp;
(function (RoommateApp) {
    var Component = drunk.Component;
    var component = drunk.component;
    var ExchangeMoneyPage = (function (_super) {
        __extends(ExchangeMoneyPage, _super);
        function ExchangeMoneyPage() {
            var _this = _super.apply(this, arguments) || this;
            _this.exchangeList = []; //提现列表
            _this.PageNum = 1;
            _this.alertTitle = '警告'; //温馨提示，提现状态
            _this.alertVisible = false;
            _this.confirmVisible = false;
            return _this;
        }
        ExchangeMoneyPage.prototype.onEnter = function () {
            this.fetchExchangeInfo();
            this.fetchExchangeListInfo();
            RoommateApp.Share.homePage();
        };
        ExchangeMoneyPage.prototype.fetchExchangeInfo = function () {
            var _this = this;
            RoommateApp.Resource.getExchangeInfo().then(function (res) {
                _this.canWithdrawNum = res.canWithdrawNum;
                _this.freezeNum = res.freezeNum;
                _this.refundedNum = res.refundedNum;
            }, function (err) {
                console.log("获取信息错误！");
            });
        };
        ExchangeMoneyPage.prototype.fetchExchangeListInfo = function () {
            var _this = this;
            if (this.isFetching || this.IsNomoreData) {
                return;
            }
            this.isFetching = true;
            RoommateApp.Resource.getExchangeListInfo(this.PageNum).then(function (res) {
                if (res.list.length > 0) {
                    for (var i = 0; i < res.list.length; i++) {
                        res.list[i].money = _this.addTwoCount(res.list[i].money);
                    }
                    (_a = _this.exchangeList).push.apply(_a, res.list);
                }
                _this.IsNomoreData = res.list.length === 0;
                _this.PageNum++;
                var _a;
            }, function (err) {
            }).done(function () {
                _this.isFetching = false;
            });
        };
        ExchangeMoneyPage.prototype.addTwoCount = function (num) {
            return num.toFixed(2);
        };
        ExchangeMoneyPage.prototype.alert = function (title, content) {
            this.alertTitle = title;
            this.alertContent = content;
            this.alertVisible = true;
        };
        ExchangeMoneyPage.prototype.alertConform = function (title, content) {
            this.confirmTitle = title;
            this.confirmContent = content;
            this.confirmVisible = true;
        };
        //点击提交
        ExchangeMoneyPage.prototype.submit = function () {
            this.exchangeNum = parseInt(this.exchangeNumStr);
            // console.log(this.exchangeNumStr);
            if (this.exchangeNum) {
                if (this.exchangeNum > this.canWithdrawNum) {
                    this.alert("警告", "当前申请提现辣条包超过你的账户可提现辣条包，请调整当前申请提现数量。");
                }
                else {
                    if (this.exchangeNum > 200) {
                        this.alert("温馨提示", "提现包数不能大于200包，请调整当前申请提现数量！");
                    }
                    else if (this.exchangeNum < 2) {
                        this.alert("温馨提示", "提现包数不能小于2包！");
                    }
                    else {
                        this.alertConform("温馨提示", "确认提现后，申请提现的金额会在2个工昨日内提现到你的微信－零钱包，请注意查收。");
                    }
                }
            }
            else {
                this.alert("温馨提示", "请输入提现面筋包数");
            }
        };
        // 提现
        ExchangeMoneyPage.prototype.confirm = function () {
            var _this = this;
            if (this.isSubmit) {
                this.alert("温馨提示", "15秒内请勿重复提交哦~");
            }
            this.isSubmit = true;
            RoommateApp.Resource.exchange(this.exchangeNum).then(function (res) {
                _this.alert("提现处理中", "2个工昨日内提现到 微信－零钱包，请注意查收！");
                _this.exchangeNumStr = '';
                _this.fetchExchangeInfo();
                _this.PageNum = 1;
                _this.exchangeList = [];
                _this.IsNomoreData = false;
                _this.fetchExchangeListInfo();
            }, function (err) {
            }).done(function (res) {
                setTimeout(function () {
                    this.isSubmit = false;
                }, 15000);
            });
        };
        return ExchangeMoneyPage;
    }(Component));
    ExchangeMoneyPage = __decorate([
        component('exchange-money-page')
    ], ExchangeMoneyPage);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../lib/drunk.d.ts" />
///<reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />
/// <reference path="../../model/albumListModel.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var AlbumTypes = RoommateApp.AlbumTypes;
    var AlbumListModel = RoommateApp.AlbumListModel;
    var HomePage = (function (_super) {
        __extends(HomePage, _super);
        function HomePage() {
            var _this = _super.apply(this, arguments) || this;
            _this.albumTypes = AlbumTypes;
            _this.toastVisible = false;
            _this.alertVisible = false;
            return _this;
        }
        Object.defineProperty(HomePage.prototype, "keywordInValid", {
            get: function () {
                var keyword = this.searchKeyword;
                return !keyword || !/\S/.test(keyword);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HomePage.prototype, "qrcodeVisible", {
            // @drunk.computed
            // get qrcodeVisible() {
            //     return this.qrcodeVisibleByServer && this.qrcodeVisibleByType;
            // }
            // set qrcodeVisible(value: boolean) {
            //     this.qrcodeVisibleByType = value;
            // }
            get: function () {
                return this.qrcodeVisibleByServer && this.isClickAttention;
            },
            set: function (value) {
                this.isClickAttention = value;
            },
            enumerable: true,
            configurable: true
        });
        HomePage.prototype.init = function () {
            var _this = this;
            RoommateApp.Share.homePage().done(function () {
                _this.alert({ title: '分享成功', content: '每日首次分享奖励 辣条X2，辣条要送给珍惜的人哦~' });
            });
            this.subscribeModel();
            // 监听搜索关键字
            this.$watch('searchKeyword', function (newValue) {
                if (_this.throttleTimer) {
                    clearTimeout(_this.throttleTimer);
                }
                _this.throttleTimer = setTimeout(function () { return _this.onSearchKeywordChanged(); }, 1000);
            });
            this.schoolId = RoommateApp.QueryString.schoolId;
            this.channelType = RoommateApp.QueryString.channelType;
            RoommateApp.Resource.getSchoolConfig(this.schoolId).then(function (res) {
                _this.qrcodeVisibleByServer = !!res.popup;
                // console.log(this.qrcodeVisibleByServer+"-----------------");
                _this.dispName = res.dispName; //渠道号学校名称
            }, function (err) {
                console.log(err);
            });
        };
        HomePage.prototype.onEnter = function (state) {
            var type = state.params['type'];
            this.processType(type);
            // this.qrcodeVisibleByType = type != AlbumTypes.schoolHot;
            AlbumListModel.instance.fetch(this.type);
        };
        HomePage.prototype.fetchNextPage = function () {
            AlbumListModel.instance.fetchNextPage();
        };
        HomePage.prototype.subscribeModel = function () {
            var _this = this;
            var listener = function (store) {
                _this.isNoMoreData = store.isNoMoreData;
                _this.isFetching = store.isFetching;
                _this.renderList = store.list;
                _this.type = store.type;
            };
            AlbumListModel.instance.subscribe(listener);
            this.$on(drunk.Component.Event.release, function () {
                AlbumListModel.instance.unsubscribe(listener);
            });
        };
        HomePage.prototype.processType = function (type) {
            if (this.schoolId && type == null && !RoommateApp.QueryString.channelType) {
                // 有渠道号并且channel_type没有提供，默认显示的是学校颜值
                this.type = AlbumTypes.schoolYanZhi;
            }
            else {
                // 没有渠道号的时候默认显示的是全国最新
                // this.type = type == null ? AlbumTypes.hotest : Number(type);
                this.type = type == null ? AlbumTypes.newest : Number(type);
            }
        };
        HomePage.prototype.onSearchKeywordChanged = function () {
            this.throttleTimer = null;
            var keyword = this.searchKeyword;
            if (!keyword || !/\S/.test(keyword)) {
                return;
            }
            if (this.type != AlbumTypes.search) {
                this.lastType = this.type;
            }
            AlbumListModel.instance.search(keyword);
        };
        HomePage.prototype.showQR = function () {
            this.isClickAttention = true;
        };
        HomePage.prototype.goRankPage = function () {
            location.href = "#/rank";
        };
        /**
         * 弹出打分窗口
         */
        HomePage.prototype.showMark = function (item) {
            this.alertMarkVisible = true;
            this.markOrderNo = item.number;
        };
        /**
         * 提示失败
         */
        HomePage.prototype.alert = function (options) {
            this.alertTitle = options.title;
            this.alertContent = options.content;
            this.alertVisible = true;
        };
        /**
         * 切换参赛类型
         */
        HomePage.prototype.toggleAlbumType = function (type) {
            location.replace('#/home/' + type);
        };
        /**
         * 点击搜索按钮
         */
        HomePage.prototype.search = function () {
            if (this.type == AlbumTypes.search) {
                this.type = this.lastType == null ? AlbumTypes.hotest : this.lastType;
                console.log(this.type, this.lastType);
                AlbumListModel.instance.fetch(this.type);
            }
            else if (!this.keywordInValid) {
                this.onSearchKeywordChanged();
            }
            else {
                this.alert({
                    content: '请先输入搜索关键字',
                    title: '温馨提示'
                });
            }
        };
        HomePage.prototype.doneMarkResult = function (alertParam, changeData) {
            this.alert(alertParam);
            // console.log("编号为"+changeData.recordId);
            if (changeData) {
                for (var i = 0; i < this.renderList.length; i++) {
                    if (this.renderList[i].number == changeData.recordId) {
                        this.renderList[i].faceScore = changeData.faceScore;
                        this.renderList[i].count = changeData.count;
                        this.renderList[i].isCanGrade = changeData.isCanGrade;
                    }
                }
            }
        };
        HomePage.prototype.changeToastStatus = function (status) {
            this.toastVisible = status;
        };
        HomePage.prototype.refresh = function () {
            AlbumListModel.instance.refresh();
        };
        return HomePage;
    }(Component));
    __decorate([
        drunk.computed
    ], HomePage.prototype, "keywordInValid", null);
    __decorate([
        drunk.computed
    ], HomePage.prototype, "qrcodeVisible", null);
    HomePage = __decorate([
        component('home-page')
    ], HomePage);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../lib/drunk.d.ts" />
///<reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var MinePage = (function (_super) {
        __extends(MinePage, _super);
        function MinePage() {
            var _this = _super.apply(this, arguments) || this;
            _this.isFetching = false;
            _this.albumListPage = 1;
            _this.albumList = [];
            _this.alertVisible = false;
            return _this;
        }
        MinePage.prototype.onEnter = function () {
            var _this = this;
            this.schoolId = RoommateApp.QueryString.schoolId;
            RoommateApp.Share.homePage().done(function () {
                _this.alert({ title: '分享成功', content: '每日首次分享奖励 辣条X2，辣条要送给珍惜的人哦~' });
            });
            this.albumList = [];
            this.albumListPage = 1;
            this.isNoMoreAlbumData = false;
            if (this.fetchingPormise) {
                this.fetchingPormise.cancel();
            }
            this.fetchUserInfo();
            this.fetchNextPage();
        };
        /**
         * 弹出打分窗口
         */
        MinePage.prototype.showMark = function (item) {
            this.alertMarkVisible = true;
            this.markOrderNo = item.number;
        };
        MinePage.prototype.goExchangeMoneyPage = function () {
            location.href = "#/excmoney";
        };
        /**
         * 投票
         */
        MinePage.prototype.vote = function (album) {
            var _this = this;
            if (this.isVoting) {
                return;
            }
            this.isVoting = true;
            RoommateApp.Resource.postVote(album.number).then(function (res) {
                console.log("album.number" + album.number);
                album.votes = res.votes;
                _this.alert({
                    title: '温馨提示',
                    content: '投食成功！'
                });
                _this.isVoting = false;
            }).catch(function (err) {
                _this.alert({
                    title: '投食失败',
                    content: err.res && err.res.error.message || '请重试'
                });
                _this.isVoting = false;
            });
        };
        MinePage.prototype.fetchUserInfo = function () {
            var _this = this;
            RoommateApp.Resource.getUserInfo().done(function (res) {
                _this.userInfo = res;
                console.log(res);
            });
        };
        //打分之后刷新信息
        MinePage.prototype.freshInfo = function () {
            location.reload();
            console.log("请刷新列表信息");
        };
        /**
         * 请求下一页的数据
         */
        MinePage.prototype.fetchNextPage = function () {
            if (this.isFetching) {
                return;
            }
            else {
                this.fetchAlbumList();
            }
        };
        /**
         * 请求晒昭列表
         */
        MinePage.prototype.fetchAlbumList = function () {
            var _this = this;
            if (this.isNoMoreAlbumData) {
                return;
            }
            this.isFetching = true;
            this.fetchingPormise = RoommateApp.Resource.getMyPublishAlbumList(this.albumListPage);
            this.fetchingPormise.then(function (res) {
                if (res.list.length > 0) {
                    (_a = _this.albumList).push.apply(_a, res.list);
                    _this.albumListPage += 1;
                }
                else {
                    _this.isNoMoreAlbumData = true;
                }
                _this.isFetching = false;
                var _a;
            }).catch(function (err) {
                console.log(err);
                _this.isFetching = false;
            });
        };
        /**
         * 提示失败
         */
        MinePage.prototype.alert = function (options) {
            this.alertTitle = options.title;
            this.alertContent = options.content;
            this.alertVisible = true;
        };
        MinePage.prototype.doneMarkResult = function (alertParam, changeData) {
            this.alert(alertParam);
            // console.log("编号为"+changeData.recordId);
            if (changeData) {
                for (var i = 0; i < this.albumList.length; i++) {
                    if (this.albumList[i].number == changeData.recordId) {
                        this.albumList[i].faceScore = changeData.faceScore;
                        this.albumList[i].count = changeData.count;
                        this.albumList[i].isCanGrade = changeData.isCanGrade;
                    }
                }
            }
        };
        MinePage.prototype.changeToastStatus = function (status) {
            this.toastVisible = status;
        };
        return MinePage;
    }(Component));
    MinePage = __decorate([
        component('mine-page')
    ], MinePage);
})(RoommateApp || (RoommateApp = {}));
/**
 * Created by RD on 2016/12/30.
 */
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var RankPage = (function (_super) {
        __extends(RankPage, _super);
        function RankPage() {
            return _super.apply(this, arguments) || this;
        }
        RankPage.prototype.init = function () {
            this.fetchRankList();
        };
        RankPage.prototype.fetchRankList = function () {
            var _this = this;
            RoommateApp.Resource.getRankList().then(function (res) {
                _this.rankList = res.list;
            }, function (err) {
            });
        };
        return RankPage;
    }(Component));
    RankPage = __decorate([
        component('rank-page')
    ], RankPage);
})(RoommateApp || (RoommateApp = {}));
/// <reference path="../../../lib/drunk.d.ts" />
///<reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />
var RoommateApp;
(function (RoommateApp) {
    var component = drunk.component;
    var Component = drunk.Component;
    var WelfarePage = (function (_super) {
        __extends(WelfarePage, _super);
        function WelfarePage() {
            return _super.apply(this, arguments) || this;
        }
        WelfarePage.prototype.onEnter = function () {
            RoommateApp.Share.welfarePage();
        };
        return WelfarePage;
    }(Component));
    WelfarePage = __decorate([
        component('welfare-page')
    ], WelfarePage);
})(RoommateApp || (RoommateApp = {}));
//# sourceMappingURL=app.js.map