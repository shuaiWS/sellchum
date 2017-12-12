/// <reference path="./weixin.ts" />
/// <reference path="./query.ts" />
/// <reference path="./resource.ts" />

namespace RoommateApp.Share {

    const logo = 'http://m.pinzvip.cn/babx/sellchum/img/share-img.png';
    const HOME_PAGE_URL = `http://m.pinzvip.cn/babx/sellchum/?school_id=${QueryString.schoolId}&channel_type=${QueryString.channelType}`;

    /**
     * 分享首页、本宝宝、报名页
     */
    export function homePage() {
        return shareAndLog({
            title: homeList.title,
            link: HOME_PAGE_URL,
            imgUrl: logo,
            desc: homeList.desc
        });
    }

    /**
     * 分享福利页
     */
    export function welfarePage() {
        return shareAndLog({
            title: welfareList.title,
            link: HOME_PAGE_URL,
            imgUrl: logo,
            desc: welfareList.desc
        });
    }

    /**
     * 分享某个详情页面
     */
    export function detailPage(link: string, imgUrl: string) {
        return shareAndLog({
            title: getRandomDescription().title,
            link: link,
            imgUrl: imgUrl || logo,
            desc: getRandomDescription().desc
        });
    }

    function shareAndLog(options: { title: string; link: string; imgUrl: string; desc: string }) {
        return WeixinUtil.share(options).then(() => {
            Resource.postShareData(options);
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

}