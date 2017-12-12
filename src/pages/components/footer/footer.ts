/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>
/// <reference path="../../../service/resource.ts" />

namespace RoommateApp {

    import component = drunk.component;
    import Component = drunk.Component;

    @component('footer-view')
    class FooterView extends Component {

        init() {
            this.$resolveData({
                statistic: Resource.getStatistic()
            });
        }
    }
}