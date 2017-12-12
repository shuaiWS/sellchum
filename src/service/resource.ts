/// <reference path="../../lib/drunk.d.ts" />
/// <reference path="./query.ts" />

namespace RoommateApp.Resource {

    declare var HOST: string;

    import ajax = drunk.util.ajax;
    import Promise = drunk.Promise;

    /**
     * 请求统计信息
     */
    export function getStatistic() {
        var schoolId = QueryString.schoolId;
        return getJSON(`${HOST}/stats?school_id=${schoolId}`);
    }

    export interface Rank {
        "rank": number,
        "number": number,
        "nickname": string,
        "giftNum": number
    }
    /**
     * 请求排名信息
     */
    export function getRankList() {
        return getJSON(`${HOST}/rank`);
    }

    /**
     * 提交报名数据
     */
    // export function postRegisterData({nickname: string, type:number, gender:number, schoolName: string,major: string,wxNumber: string, mediaIds: string[], detail: string,ilike :string,iwish :string }:) {
    export function postRegisterData(data: Object) {
        return postJSON(`${HOST}/info/v1/`, data);
    }

    /**
     * 验证短信发送
     */
    export function postVerifySms(phone: string) {
        return postJSON(`${HOST}/info/verify_sms/`, {phone});
    }

    /**
     *打分
     */
    export function postMarkScore(recordId: number, score: number) {
        return postJSON(`${HOST}/record/${recordId}/grade`, {score});
    }

    /**
     * 发起投食
     */
    export function postVote(albumId: number) {
        return postJSON(`${HOST}/feed/${albumId}`);
    }

    //发起订单
    export interface GiftOrderParam {
        "record_id": number,
        "giftpg_id": number,
        "back_url": string
    }

    /**
     * 发起订单
     */
    export function postGiftOrder(data: GiftOrderParam) {
        return postJSON(`${HOST}/gift/order/`, data);
    }

    //订单信息
    export interface GiftOrderInfor {
        "orderId": number;
        "orderImg": string;
        "orderTitle": string;
        "orderSubhead": string;
        "money": number;
        "backUrl": string;
    }
    export interface ExchangeInfor {
        "money": number;
        "createTime": number;
        "withDrawNum": number;
        "status": string;
    }

    /**
     * 获取提现信息
     */
    export function getExchangeInfo() {
        return postJSON(`${HOST}/account/info/`);
    }

    /**
     *获取提现列表
     */
    export function getExchangeListInfo(page: number) {
        return getJSON(`${HOST}/account/withdraw/list?page=${page}`);
    }

    /**
     * 提现
     */
    export function exchange(giftPgNum: number) {
        return postJSON(`${HOST}/account/withdraw`, {giftPgNum});
    }


    // //获取订单信息
    // export function getGiftOrderInfor(orderId: number) {
    //     return getJSON(`${HOST}/XXX/XXX/orderId=${orderId}`);
    // }

    export interface PayParam {
        "appId": string;
        "timeStamp": number;
        "nonceStr": string;
        "package": string;
        "signType": string;
        "paySign": string;
    }

    export function postBuy({orderId:number}, payParam: PayParam) {
        return postJSON(`${HOST}/insurance/orders/weibo`).then(res => {
            return WeixinUtil.pay(this.payParam);
        });
    }

    export interface IChannelInfo {
        "id": number;
        "name": string;    // 渠道名
        "type": "school";  // 渠道类型。type 为 "school" 时有本校
        "popup": 0 | 1;    // 是否弹框  默认：0---不弹窗;1--弹窗
        "qrcode": string;
        "dispName": string
        "banners": {
            "img": string,
            "link": string // 可能为 null
        }[];
    }

    /**
     * 获取渠道号信息
     */
    export function getSchoolConfig(schoolId: string): Promise<IChannelInfo> {
        return getJSON(`${HOST}/channel/${schoolId || '1000'}/info`);
    }

    /**
     * 获取我投食过的列表
     */
    export function getMyVotedAlbumList(page: number) {
        return getJSON(`${HOST}/info/ilike?page=${page}`);
    }

    /**
     * 获取全国男神女神榜列表
     */
    export function getHotestAlbumList(page: number) {
        return getJSON(`${HOST}/info/list?sort=gift&page=${page}`);

    }

    /**
     * 获取全国最新
     */
    export function getNewestAlbumList(page: number) {
        return getJSON(`${HOST}/info/list?sort=time&page=${page}`);

    }

    /**
     * 获取本校热门
     */
    export function getSchoolHotAlbumList(page: number) {
        var schoolId = QueryString.schoolId;
        return getJSON(`${HOST}/info/list?sort=gift&school_id=${schoolId}&page=${page}`);

    }

    /**
     * 获取全国颜值
     */
    export function getYanZhiAlbumList(page: number) {
        return getJSON(`${HOST}/info/list?sort=grade&&page=${page}`);
    }

    /**
     * 获取本校颜值
     */
    export function getSchoolYanZhiAlbumList(page: number) {
        var schoolId = QueryString.schoolId;
        return getJSON(`${HOST}/info/list?sort=grade&school_id=${schoolId}&page=${page}`);
    }

    /**
     * 搜索
     */
    export function getSearchListByKeyword(keyword: string, page: number) {
        return getJSON(`${HOST}/info/search?q=${keyword}&page=${page}`);
    }

    /**
     * 请求用户的卖室友数据
     */
    export function getMyPublishAlbumList(page: number) {
        console.log(`${HOST}/info/byme?page=${page}`);

        return getJSON(`${HOST}/info/byme?page=${page}`);
    }

    /**
     * 请求评论列表
     */
    export function getCommentList(albumId: number, lastCommentId?: number): Promise<{ list: ICommentInfo[] }> {
        var url = `${HOST}/info/${albumId}/comments`;
        if (lastCommentId != null) {
            url += `?last=${lastCommentId}`;
        }
        console.log(url);
        return getJSON(url);
    }


    /**
     * 投诉
     */
    export function postComplain(data: { record_id: number, content: string, phone: string }) {
        return postJSON(`${HOST}/info/report/`, data);
    }


    export interface ICommentInfo {
        "id": number;
        "uid": string;
        "nickname": string;
        "headImgUrl": string;
        "content": string;
        "location": string;
        "toCommentId": number;
        "toNickname": string;
        "createTime": number;
        "type": string;


    }
    export interface YanZhiReponse {
        "count": number;
        "recordId": number;
        "faceScore": number;
        "type": string;
        commentId: number;
    }

    export interface IAlbumInfo {
        "uid": string;
        "schoolId": string;
        "userName": string;
        "userLogo": string;
        "describe": string;
        "number": number;
        "nickName": string;
        "schoolName": string;
        "gender": string;
        "major": string;
        "detail": string;
        "ilike": string;
        "iwish": string;
        "mediaIds": string[];
        "isSee": boolean;
        "wxNumber": string;
        "rank": number;
        "totalFeedNum": number;
        "differNum": number;
        "feedPersonNum": number;
        "feedUserLogos": string[];
        "lackFeedNum": number;
        "voted": boolean;
        "gitfPgList": GiftBag[];
        "faceScore": number;
        "count": number;
        "isCanGrade": boolean;
    }
    export interface IUserInfo {
        loginTime: number;
        token: string;
        uid: string;
    }
    /**
     * 获取用户信息
     */
    export function getUserInfo(): Promise<IUserInfo> {
        return getJSON(`${HOST}/user/info`);
    }

    /**
     * 爆料详情
     */
    export function getAlbumInfo(weiboId: number): Promise<IAlbumInfo> {
        return getJSON(`${HOST}/info/${weiboId}`);
    }

    /**
     * 爆料评论发表
     */
    export function postComment(weiboId: number, content: string, toCommentId: number): Promise<ICommentInfo> {
        return postJSON(`${HOST}/info/${weiboId}/comments`, {toCommentId, content});
    }

    /**
     * 颜值打分评论发表
     */
    // export function postYanZhiComment(weiboId: number, content: string, type: string): Promise<YanZhiReponse> {
    //     return postJSON(`${HOST}/info/${weiboId}/comments`, {weiboId, content, type});
    // }

    /**
     *更新颜值评论
     */
    export function postUpdateYanZhiComment(commentId: number, content: string) {
        return postJSON(`${HOST}/comment/${commentId}/update`, {content});
    }

    // /**
    //  * 删除评论
    //  */
    // export function deleteComment(weiboId: number, commentId: number) {
    //     return deleteJSON(`${HOST}/insurance/weibo/${weiboId}/comments/${commentId}`);
    // }

    /**
     * 删除评论
     */
    export function deleteComment(commentId: number) {
        return deleteJSON(`${HOST}/info/comment/${commentId}`);
    }

    /**
     *
     */
    export function pageVisit() {
        return getJSON(`${HOST}/visit`);
    }

    export function postShareData(options: { title: string; link: string; imgUrl: string; desc: string }) {
        return postJSON(`${HOST}/share`, options);
    }

    function deleteJSON(url: string) {
        return ajax({
            url,
            type: 'DELETE',
            headers: {
                Accept: 'application/json'
            },
            responseType: 'json',
            withCredentials: true
        }).catch(onError);
    }

    function getJSON(url: string) {
        return ajax({
            url,
            responseType: 'json',
            withCredentials: true
        }).catch(onError);
    }

    function postJSON(url: string, data?: Object) {
        return ajax({
            url,
            data,
            type: 'POST',
            contentType: 'application/json',
            responseType: 'json',
            withCredentials: true
        }).catch(onError);
    }

    const LOGIN_REQUIRED = 'LOGIN_REQUIRED';

    function onError(err) {
        if (err.res.message === LOGIN_REQUIRED) {
            location.replace(`http://m.pinzvip.cn/api/wx/auth/userinfo?redirect_url=${encodeURIComponent(location.href)}`);
            return;
        }
        return Promise.reject(err);
    }

}