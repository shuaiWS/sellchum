/// <reference path="../lib/drunk.d.ts" />
/// <reference path="../lib/application.d.ts" />
/// <reference path="service/weixin.ts" />
/// <reference path="service/resource.ts" />

namespace RoommateApp {

    var token = (document.cookie.match(/usercheck=([^;]+?)/) || [])[1];

    if (!token) {
        // 如果没有登录，先登录
        location.replace(``);
    }
    else {
        drunk.config.prefix = 'd-';
        drunk.Application.start(document.querySelector('application') as HTMLElement);

        WeixinUtil.config();
    }

    window.addEventListener('hashchange', () => {
        Resource.pageVisit();
    });

    Resource.pageVisit();
}