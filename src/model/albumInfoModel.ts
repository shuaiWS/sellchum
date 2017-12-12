/// <reference path="./baseModel.ts" />
/// <reference path="../service/resource.ts" />

namespace RoommateApp {

    interface IAlbumInfoStore {
        albumInfo: Resource.IAlbumInfo;
        comments: Resource.ICommentInfo[];
        isFetchComments: boolean;
        isNoMoreComments: boolean;
        isPostComment: boolean;
    }

    export class AlbumInfoModel extends BaseModel<IAlbumInfoStore> {

        private lastCommentId: number;

        albumdId: number;

        constructor() {
            super();

            this.store = {
                albumInfo: null,
                comments: [],
                isFetchComments: false,
                isNoMoreComments: false,
                isPostComment: false
            };
        }

        setAlbumId(albumdId: number) {
            this.albumdId = albumdId;
            this.store.comments = [];
            this.lastCommentId = null;
            this.store.isFetchComments = false;
            this.store.isNoMoreComments = false;

            this.fetchAlbumInfo();
            this.fetchComments();
        }

        fetchAlbumInfo() {
            Resource.getAlbumInfo(this.albumdId).done(res => {
                this.store.albumInfo = res;
                this.publish();
            });
        }

        fetchComments() {
            if (this.store.isFetchComments || this.store.isNoMoreComments) {
                return;
            }

            this.store.isFetchComments = true;

            Resource.getCommentList(this.albumdId, this.lastCommentId).then(res => {
                let list = this.store.comments;

                if (res.list.length > 0) {
                    list.push(...res.list);
                }

                this.store.isNoMoreComments = res.list.length === 0;

                if (list.length) {
                    this.lastCommentId = list[list.length - 1].id;
                }
            }, err => {
                console.error(err);
            }).done(() => {
                this.store.isFetchComments = false;
                this.publish();
            });

            this.publish();
        }

        addComment(content: string, commentId): drunk.Promise<{ success: boolean; message: string; }> {
            if (this.store.isPostComment) {
                return drunk.Promise.reject({ success: false, message: '正在提交...' });
            }

            this.store.isPostComment = true;

            var promise = Resource.postComment(this.albumdId, content, commentId).then(res => {
                this.store.comments.unshift(res);
                return {
                    success: true,
                    message: '评论成功'
                };
            }, err => {
                console.error(err);
                return {
                    success: false,
                    message: err.res.message || '评论失败'
                };
            }).then(res => {
                this.store.isPostComment = false;
                this.publish();
                return res;
            });

            this.publish();

            return promise;
        }
    }
}