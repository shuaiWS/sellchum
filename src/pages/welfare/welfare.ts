/// <reference path="../../../lib/drunk.d.ts" />
///<reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />

namespace RoommateApp {

    import component = drunk.component;
    import Component = drunk.Component;

    @component('welfare-page')
    class WelfarePage extends Component {

        onEnter() {
            Share.welfarePage();
        }
    }
}