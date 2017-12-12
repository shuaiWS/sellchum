/// <reference path="./baseModel.ts" />
/// <reference path="../service/resource.ts" />

namespace RoommateApp {

    export interface IAlbumListStore {
        isNoMoreData: boolean;
        isFetching: boolean;
        list: IAlbumInfo[];
        type: AlbumTypes;
    }

    export interface IAlbumInfo {
        number: number;
        nickName: string;
        schoolName: string;
        photo: {
            url: string;
            width: number;
            height: number;
        };
        hotStripNum: number;
        "count": number;
        "recordId": number;
        "faceScore": number;
        "isCanGrade": boolean;

    }

    export enum AlbumTypes {
        newest, // 最新
        hotest, // 男神女神
        schoolHot, // 学校最热
        myVoted, // 我的投食
        search, // 搜索
        yanZhi, // 全国颜值
        schoolYanZhi, // 本校颜值
    }

    export class AlbumListModel extends BaseModel<IAlbumListStore> {

        private listByType: { [type: string]: IAlbumInfo[] } = {};
        private pageCountByType: { [type: string]: number } = {};
        private isNoMoreDataByType: { [type: string]: boolean } = {};
        private isFetchingByType: { [type: string]: boolean } = {};
        private fetchingPromise: drunk.Promise<any>;
        private searchPromise: drunk.Promise<any>;

        type: AlbumTypes;
        keyword: string;

        constructor() {
            super();

            this.store = {
                isNoMoreData: false,
                isFetching: false,
                list: [],
                type: null
            };
        }

        fetch(type: AlbumTypes) {
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
        }

        search(keyword: string) {
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
        }

        fetchNextPage() {
            var {type, isFetchingByType, isNoMoreDataByType, pageCountByType, listByType} = this;

            if (isFetchingByType[type] || isNoMoreDataByType[type]) {
                return;
            }

            var promise: drunk.Promise<{ list: IAlbumInfo[] }>;
            var pageCount = pageCountByType[type];

            switch (this.type) {
                case AlbumTypes.hotest:
                    promise = Resource.getHotestAlbumList(pageCount);
                    break;
                case AlbumTypes.myVoted:
                    promise = Resource.getMyVotedAlbumList(pageCount);
                    break;
                case AlbumTypes.newest:
                    promise = Resource.getNewestAlbumList(pageCount);
                    break;
                case AlbumTypes.schoolHot:
                    promise = Resource.getSchoolHotAlbumList(pageCount);
                    break;
                case AlbumTypes.yanZhi:
                    promise = Resource.getYanZhiAlbumList(pageCount);
                    break;
                case AlbumTypes.schoolYanZhi:
                    promise = Resource.getSchoolYanZhiAlbumList(pageCount);
                    break;
                case AlbumTypes.search:
                    promise = this.searchPromise = Resource.getSearchListByKeyword(this.keyword, pageCount);
                    break;
            }

            isFetchingByType[type] = true;

            promise.then(res => {
                isNoMoreDataByType[type] = !res.list.length;

                if (!isNoMoreDataByType[type]) {
                    listByType[type].push(...res.list);
                    pageCountByType[type] += 1;
                }
            }, err => {
                console.error(err);
            }).done(() => {
                isFetchingByType[type] = false;
                this.publish();
            });

            this.fetchingPromise = promise;
        }

        refresh() {
            this.clear();

            if (this.type === AlbumTypes.search) {
                let keyword = this.keyword;
                this.keyword = null;
                this.search(keyword);
            }
            else {
                let type = this.type;
                this.type = null;
                this.fetch(type);
            }
        }

        clear() {
            if (this.fetchingPromise) {
                this.fetchingPromise.cancel();
                this.fetchingPromise = null;
            }

            this.listByType = {};
            this.pageCountByType = {};
            this.isNoMoreDataByType = {};
            this.isFetchingByType = {};
        }

        publish() {
            var {type, store, isNoMoreDataByType, isFetchingByType, listByType} = this;

            store.isFetching = isFetchingByType[type];
            store.isNoMoreData = isNoMoreDataByType[type];
            store.list = listByType[type];
            store.type = type;

            super.publish();
        }

        private static _instance: AlbumListModel;

        static get instance() {
            if (!this._instance) {
                this._instance = new AlbumListModel();
            }
            return this._instance;
        }
    }
}