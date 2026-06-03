<template>
  <view class="pagearticle" ref="render">
    <view class="content">
      <view id="poster">
        <block v-if="pageData.navbar">
          <navbar @handle="doNothing" :pageData="pageData" />
        </block>
        <article-module
          :pageData="pageData"
          @comment="clickComment"
          @selfzan="clickGood"
        >
          <block v-if="pageData.article.pictureList != 0">
            <upload slot="picture" show :filesData="pageData.article.pictureList" />
          </block>
        </article-module>
        <view class="comment">
          <comment-module
            @showSelect="showSelect"
            :avatar="pageData.article.avatar"
            :pageData="pageData"
            :self-good="selfGood"
          />
        </view>
        <longselect-module
          @cancel="longSelectHidden = false"
          @replyCom="replyCom"
          @renderImg="showTip"
          @deleteCom="deleteCom"
          :coordinate="coordinate"
          :hidden="longSelectHidden"
        />
        <input-module
          @blur="blurInput"
          :reply="reply"
          :focus="isFocus"
          :isFixed="isFixed"
          @inputMsg="getComment"
        />
      </view>
    </view>
    <view class="save-btn" @click="showTip">
      <text class="iconfont icon-good"></text>
      <text>如何保存到相册</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isRulePopup: true,
      coordinate: {},
      longSelectHidden: false,
      isFixed: false,
      isFocus: false,
      selfGood: false,
      reply: { isReply: false, username: "" },
      pageData: {
        type: 0,
        navbar: false,
        navbarTime: "",
        dian: 0,
        linkInfo: { linkText: "", linkImg: "/static/img/avatar.png" },
        article: {
          username: "", avatar: "", contentText: "", pictureList: [],
          date: { date: "", time: "" },
        },
        comment: { commentNum: 0, goodUserAvatarList: 0, commentUserList: [] },
      },
    };
  },
  onLoad(option) {
    const app = getApp();
    if (app.globalData.articleData) { this.pageData = app.globalData.articleData; delete app.globalData.articleData; } else if (option.data) { this.pageData = JSON.parse(option.data); }
  },
  methods: {
    deleteCom(i) { if (typeof i == "number") { this.pageData.comment.commentUserList.splice(i, 1); } },
    replyCom(i) { let u = this.pageData.comment.commentUserList[i].username; this.reply.isReply = true; this.reply.username = u; this.isFocus = true; },
    clickComment() { this.isFocus = true; this.reply.isReply = false; this.reply.username = ""; },
    clickGood(data) { this.selfGood = data; },
    showSelect(data) { this.coordinate = data; this.longSelectHidden = true; },
    blurInput(value) { if (!value) { setTimeout(() => { this.reply.isReply = false; this.reply.username = ""; }, 100); } this.isFocus = false; },
    getComment(e) { let a = this.pageData.comment.commentUserList; a.push(e); this.pageData.comment.commentUserList = a; this.reply.isReply = false; this.reply.username = ""; this.isFocus = false; },
    doNothing() {},
    showTip() {
      uni.showModal({
        title: "保存截图",
        content: "请使用手机自带截图功能（同时按电源键+音量键，或三指下滑），然后在相册中裁剪即可。",
        showCancel: false,
        confirmText: "知道了"
      });
    },
  },
};
</script>

<style lang="scss">
@media screen and (max-width: 768px) { .pagearticle { width: 100vw; } }
@media screen and (min-width: 1024px) {
  .pagearticle { width: 550px; height: 100vh; margin: 0 auto; box-shadow: 0 0 5px #eee; }
}
.pagearticle {
  #poster { min-height: 100vh; position: relative; }
  .comment { padding-bottom: 2upx; }
}
.save-btn {
  position: fixed; bottom: 0; left: 0; right: 0; height: 90upx;
  background-color: #1677ff; color: #fff; display: flex;
  align-items: center; justify-content: center; font-size: 32upx; z-index: 999; gap: 10upx;
}
</style>
