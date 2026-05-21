<template>
  <popup ref="articlepopup" type="fadeInMiddle" @hide="close">
    <view class="weiarticle_popup">
      <view class="popup_title"> 文章信息 </view>
      
      <view class="url_row">
        <input class="popup_input url_input" type="text" v-model="articleUrl" placeholder="粘贴微信公众号文章链接..." />
        <view class="fetch_btn" @click="fetchArticle">{{ fetching ? "抓取中..." : "获取" }}</view>
      </view>
      
      <view class="divider"><text class="divider_text">或手动填写</text></view>
      
      <input class="popup_input" type="text" v-model="linkText" placeholder="输入文章标题" />
      
      <view class="cover_row">
        <image class="cover_preview" :src="linkImg" mode="aspectFill" @click="chooseImg"></image>
        <text class="cover_tip" @click="chooseImg">点击选择封面图</text>
      </view>
      
      <view class="popup_btn" @click="submit"> 确定 </view>
    </view>
  </popup>
</template>

<script>
const WORKER_URL = 'https://wechat-fetcher.1843262744.workers.dev';

export default {
  name: "wei-article",
  data() {
    return { articleUrl: "", fetching: false, linkText: "", linkImg: "/static/img/avatar.png" };
  },
  props: { isShow: { type: Boolean, default: false } },
  watch: {
    isShow(newVal) {
      if (newVal) {
        this.articleUrl = ""; this.linkText = ""; this.linkImg = "/static/img/avatar.png";
        this.$refs.articlepopup.show();
      } else { this.$refs.articlepopup.hide(); }
    },
  },
  methods: {
    async fetchArticle() {
      const u = this.articleUrl.trim();
      if (!u) { uni.showToast({ title: '请粘贴文章链接', icon: 'none' }); return; }
      const isLocal = window.location.hostname === 'localhost';
      if (isLocal) {
        this.fetching = true;
        uni.showLoading({ title: '抓取中...' });
        try {
          const r = await fetch("/api/wechat-fetch?url=" + encodeURIComponent(u));
          const d = await r.json();
          if (d.success && d.title) {
            this.linkText = d.title;
            if (d.cover) { this.linkImg = d.cover; }
            uni.hideLoading(); uni.showToast({ title: '获取成功', icon: 'success' });
            this.fetching = false; return;
          }
        } catch (e) {}
        uni.hideLoading(); this.fetching = false;
        uni.showToast({ title: '自动抓取失败，请手动填写', icon: 'none' });
      } else {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = 'https://pyqzan.pages.dev/?url=' + encodeURIComponent(u) + '&return=' + returnUrl;
      }
    },submit() {
      if (!this.linkText.trim()) { uni.showToast({ title: "请输入标题", icon: "none" }); return; }
      this.$refs.articlepopup.hide();
      this.$emit("submit", { linkText: this.linkText, linkImg: this.linkImg });
    },
    close() { this.$emit("close"); },
  },
};
</script>

<style lang="scss">
.weiarticle_popup { width: 640upx; padding: 30upx; border-radius: 10upx; background-color: #fff;
  .popup_title { text-align: center; font-size: 34upx; font-weight: 900; margin-bottom: 20upx; color: #1677ff; }
  .url_row { display: flex; gap: 10upx; margin-bottom: 10upx; }
  .url_input { flex: 1; margin-bottom: 0; }
  .fetch_btn { width: 120upx; height: 70upx; line-height: 70upx; text-align: center; background-color: #1677ff; color: #fff; border-radius: 8upx; font-size: 26upx; }
  .divider { text-align: center; margin: 15upx 0; }
  .divider_text { font-size: 22upx; color: #999; background: #fff; padding: 0 20upx; }
  .popup_input { border: 1px solid #ddd; border-radius: 8upx; padding: 20upx; font-size: 28upx; margin-bottom: 20upx; }
  .cover_row { display: flex; align-items: center; margin-bottom: 30upx; gap: 20upx; }
  .cover_preview { width: 120upx; height: 120upx; border-radius: 8upx; border: 1px solid #ddd; }
  .cover_tip { font-size: 26upx; color: #1677ff; text-decoration: underline; }
  .popup_btn { margin: 0 auto; font-size: 30upx; width: 200upx; text-align: center; border-radius: 10upx; background-color: #1677ff; padding: 16upx 0; color: #fff; }
}
</style>