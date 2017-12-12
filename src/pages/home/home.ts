/// <reference path="../../../lib/drunk.d.ts" />
///<reference path="../../../lib/application.d.ts"/>
/// <reference path="../../service/share.ts" />
/// <reference path="../../model/albumListModel.ts" />

namespace RoommateApp {

    import util = drunk.util;
    import Promise = drunk.Promise;
    import component = drunk.component;
    import Component = drunk.Component;

    import AlbumTypes = RoommateApp.AlbumTypes;
    import AlbumListModel = RoommateApp.AlbumListModel;

    @component('home-page')
    class HomePage extends Component implements drunk.IRouterComponent {

        private throttleTimer: number;
        private schoolId: string;
        private channelType: string;

        qrcodeVisibleByServer: boolean; // 服务端返回的是否弹出二维码
        // qrcodeVisibleByType: boolean; // 当type是schoolHot时不弹出
        isClickAttention: boolean;//是否点击了关注
        searchKeyword: string;
        renderList: IAlbumInfo[];
        isFetching: boolean;
        isNoMoreData: boolean;
        dispName: string;

        type: AlbumTypes;
        lastType: AlbumTypes;
        albumTypes = AlbumTypes;

        toastVisible: boolean = false;

        @drunk.computed
        get keywordInValid() {
            var keyword = this.searchKeyword;
            return !keyword || !/\S/.test(keyword);
        }

        // @drunk.computed
        // get qrcodeVisible() {
        //     return this.qrcodeVisibleByServer && this.qrcodeVisibleByType;
        // }
        // set qrcodeVisible(value: boolean) {
        //     this.qrcodeVisibleByType = value;
        // }
        @drunk.computed
        get qrcodeVisible() {
            return this.qrcodeVisibleByServer && this.isClickAttention;
        }

        set qrcodeVisible(value: boolean) {
            this.isClickAttention = value;
        }

        init(): void {
            Share.homePage().done(() => {
                this.alert({title: '分享成功', content: '每日首次分享奖励 辣条X2，辣条要送给珍惜的人哦~'});
            });

            this.subscribeModel();

            // 监听搜索关键字
            this.$watch('searchKeyword', (newValue: string) => {
                if (this.throttleTimer) {
                    clearTimeout(this.throttleTimer);
                }
                this.throttleTimer = setTimeout(() => this.onSearchKeywordChanged(), 1000);
            });

            this.schoolId = QueryString.schoolId;
            this.channelType = QueryString.channelType;

            Resource.getSchoolConfig(this.schoolId).then(res => {
                this.qrcodeVisibleByServer = !!res.popup;
                // console.log(this.qrcodeVisibleByServer+"-----------------");
                this.dispName = res.dispName;//渠道号学校名称
            }, err => {
                console.log(err);
            });
        }

        onEnter(state: drunk.IRouterState) {
            var type = state.params['type'];

            this.processType(type);
            // this.qrcodeVisibleByType = type != AlbumTypes.schoolHot;

            AlbumListModel.instance.fetch(this.type);
        }

        fetchNextPage() {
            AlbumListModel.instance.fetchNextPage();
        }

        private subscribeModel() {
            var listener = store => {
                this.isNoMoreData = store.isNoMoreData;
                this.isFetching = store.isFetching;
                this.renderList = store.list;
                this.type = store.type;
            };

            AlbumListModel.instance.subscribe(listener);
            this.$on(drunk.Component.Event.release, () => {
                AlbumListModel.instance.unsubscribe(listener);
            });
        }

        private processType(type) {
            if (this.schoolId && type == null && !QueryString.channelType) {
                // 有渠道号并且channel_type没有提供，默认显示的是学校颜值
                this.type = AlbumTypes.schoolYanZhi;
            } else {
                // 没有渠道号的时候默认显示的是全国最新
                // this.type = type == null ? AlbumTypes.hotest : Number(type);
                this.type = type == null ? AlbumTypes.newest : Number(type);
            }
        }

        private onSearchKeywordChanged() {
            this.throttleTimer = null;
            var keyword = this.searchKeyword;

            if (!keyword || !/\S/.test(keyword)) {
                return;
            }

            if (this.type != AlbumTypes.search) {
                this.lastType = this.type;
            }
            AlbumListModel.instance.search(keyword);
        }

        showQR() {
            this.isClickAttention = true;
        }

        goRankPage() {
            location.href = "#/rank";
        }

        private alertMarkVisible: boolean;
        markOrderNo: number;

        /**
         * 弹出打分窗口
         */
        showMark(item: IAlbumInfo) {
            this.alertMarkVisible = true;
            this.markOrderNo = item.number;
        }

        private alertTitle: string;
        private alertContent: string;
        private alertVisible = false;

        /**
         * 提示失败
         */
        alert(options: { content: string; title: string; }) {
            this.alertTitle = options.title;
            this.alertContent = options.content;
            this.alertVisible = true;
        }

        /**
         * 切换参赛类型
         */
        toggleAlbumType(type: string) {
            location.replace('#/home/' + type);
        }

        /**
         * 点击搜索按钮
         */
        search() {
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
        }

        doneMarkResult(alertParam, changeData) {
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
        }
        changeToastStatus(status:boolean){
            this.toastVisible = status;
        }

        refresh() {
            AlbumListModel.instance.refresh();
        }
    }

}