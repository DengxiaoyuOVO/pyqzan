<template>
  <view class="main">
    <view class="canbox" id="main">
      <block v-if="pageData.navbar">
        <navbar @handle="handleRight" ismain :pageData="pageData" bgColor="#111" textColor="#fff" />
      </block>
      <view class="content" v-if="(pageData.type==2&&pageData.linkInfo&&pageData.linkInfo.linkImg)||(pageData.article.pictureList&&pageData.article.pictureList[0])">
        <image :src="pageData.type==2?pageData.linkInfo.linkImg:pageData.article.pictureList[0]" mode="widthFix" class="con_img"></image>
      </view>
      <view class="boottom">
        <view class="boot_text" v-html="pageData.article.contentText"></view>
        <view class="footer">
          <view class="foot_left">
            <text class="icon-good iconfont"></text>
            <text class="zan moreright">赞</text>
            <text class="icon-chat iconfont"></text>
            <text class="comment">评论</text>
          </view>
          <view class="foot_right">
            <text class="icon-good iconfont"></text>
            <text class="zan">{{ pageData.comment.goodUserAvatarList }}</text>
            <text class="icon-chat iconfont"></text>
            <text class="comment">{{ pageData.comment.commentNum }}</text>
          </view>
        </view>
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
      pageData: {
        type: 2,
        navbar: false,
        navbarTime: "",
        dian: 0,
        linkInfo: { linkText: "", linkImg: "" },
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
    if (app.globalData.articleData) {
      Object.assign(this.pageData, app.globalData.articleData);
      delete app.globalData.articleData;
    } else if (option.data) {
      try { const d = JSON.parse(option.data); Object.assign(this.pageData, d); } catch(e) {}
    }
    const cover = sessionStorage.getItem("pyqzan_linkImg");
    const title = sessionStorage.getItem("pyqzan_linkText");
    if (cover && cover.startsWith("data:")) {
      fetch(cover).then(r => r.blob()).then(blob => {
        this.pageData.linkInfo = { linkImg: URL.createObjectURL(blob), linkText: title || "" };
      });
      sessionStorage.removeItem("pyqzan_linkImg");
      sessionStorage.removeItem("pyqzan_linkText");
    }
  },
  methods: {
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
@media screen and (max-width: 768px) { .main { width: 100vw; } }
@media screen and (min-width: 1024px) {
  .main { width: 550px; height: 100vh; margin: 0 auto; box-shadow: 0 0 5px #eee; }
}
.main {
  .canbox {
    width: 100%; height: 100vh; display: flex; flex-direction: column;
    .content {
      flex: 1; background-color: #000; max-height: 85vh; height: 100%;
      overflow: hidden; display: flex; align-items: center; margin: -2upx 0;
      .con_img { width: 100%; }
    }
    .boottom { width: 100%; height: auto; background-color: #0f0e13; }
    .boot_text {
      color: #fffeff; padding: 14upx 20upx; font-size: 34upx;
      letter-spacing: 2upx; line-height: 1.4; max-height: 130upx; overflow: hidden;
    }
    .footer {
      width: 100%; height: 90upx; box-sizing: border-box; background-color: #343233;
      color: #ffffff; display: flex; align-items: center; justify-content: space-between;
      padding: 0 40upx 10upx 30upx;
      .icon-good { font-size: 42upx; margin-right: 6upx; vertical-align: middle; }
      .zan { font-size: 32upx; margin-right: 16upx; position: relative; bottom: 2upx; }
      .moreright { margin-right: 50upx; }
      .icon-chat { font-size: 38upx; font-weight: 900; margin-right: 8upx; vertical-align: middle; position: relative; top: 2upx; }
      .comment { font-size: 32upx; position: relative; bottom: 2upx; }
    }
  }
}
.save-btn {
  position: fixed; bottom: 0; left: 0; right: 0; height: 90upx;
  background-color: #1677ff; color: #fff; display: flex;
  align-items: center; justify-content: center; font-size: 32upx; z-index: 999; gap: 10upx;
}
</style>
