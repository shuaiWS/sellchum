/// <reference path="../../../../lib/drunk.d.ts" />
/// <reference path="../../../../lib/application.d.ts"/>

namespace RoommateApp {

    import component = drunk.component;
    import Component = drunk.Component;

    @component('alert-view')
    class AlertView extends Component {

        title = 'title: 设置标题';
        content = 'content: 设置内容';
        visible = false;

        // 按钮文案
        // buttonName = '确认';

        onButtonClicked() {
            this.$emit('confirm');
            this.visible = false;
        }
    }
}