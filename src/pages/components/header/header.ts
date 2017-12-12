/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />
/// <reference path="../../../service/query.ts" />

namespace RoommateApp {

    import component = drunk.component;
    import Component = drunk.Component;

    @component('header-view')
    class HeaderView extends Component {

        minePage: boolean;//我的页面不显示 已发布、投食人数、访问量

        private statistic: IStatistic;

        banners = [{ img: 'img/banner.png', link: '' }];
        carouselIndex = 0;

        init() {
            this.$resolveData({
                statistic: Resource.getStatistic()
            });
            if (window.location.href.indexOf('mine') != -1) {
                this.minePage = true;
            }

            Resource.getSchoolConfig(QueryString.schoolId).then(res => {
                if (res.banners && res.banners.length) {
                    this.banners = res.banners;
                }
            });
        }
        goHome(e: Event) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/home';
        }

        goEntry(e: Event) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/entry';
        }

        goMine(e: Event) {
            e.preventDefault();
            e.stopPropagation();
            location.href = '#/mine';
        }
    }

    interface IStatistic {
        releaseCount: number;
        voteCount: number;
        visitCount: number;
        isHaveSale: boolean;
    }
}