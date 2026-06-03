<template>
  <view class="pageindex">
    <rule-popup
      v-if="isRulePopup"
      :isShow="isRulePopup"
      @close="isRulePopup = false"
    />
    <view class="head">
      <view class="head_left"> 朋友圈集赞截图生成工具 </view>
      <view class="head_right">
        <text class="iconfont icon-github-fill" @tap="goGit"></text>
      </view>
    </view>
    <view class="mode">
      <view class="mode_left"> 提示模式: </view>
      <view class="mode_right" @tap="handleTip">
        {{ isTip ? "已开启" : "已关闭" }}
      </view>
    </view>
    <radio-group @change="radioChange">
      <swiper
        @change="changeSwiper"
        :interval="3000"
        class="swiper"
        circular
        previous-margin="120upx"
        next-margin="120upx"
      >
        <swiper-item
          class="list"
          v-for="(item, index) in items"
          :key="item.value"
        >
          <label class="label">
            <view class="title">样式{{ item.value }} : </view>
            <view class="num">{{ item.title }}</view>
            <image
              class="list_img"
              :src="`/static/img/type${index + 1}.jpeg`"
              mode="widthFix"
            ></image>
            <radio
              :value="item.value"
              color="#1677ff"
              :checked="index === current"
            />
          </label>
        </swiper-item>
      </swiper>
    </radio-group>
    <view class="btn_box">
      <view class="btn" @click="goEdit"> 进 入 </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      isRulePopup: false,
      isTip: true,
      items: [
        { value: "一", title: "图文样式", checked: "true" },
        { value: "二", title: "链接样式" },
        { value: "三", title: "主图样式" },
      ],
      current: 0,
    };
  },
  onLoad() {
    const isTip = uni.getStorageSync("isTip");
    if (isTip === "") {
      uni.setStorageSync("isTip", true);
      this.isTip = true;
    } else {
      this.isTip = isTip;
    }
    this.isRulePopup = true;
  },
  methods: {
    handleTip() {
      const text = this.isTip
        ? "关闭后，所有页面都将不会再有教程提示～"
        : "开启后，所有页面都会弹框弹出教程提示～";
      uni.showModal({
        title: "提示",
        content: `是否${this.isTip ? "关闭" : "开启"}提示模式，${text}`,
        success: (res) => {
          if (res.confirm) {
            this.isTip = !this.isTip;
            getApp().globalData.isTip = this.isTip;
            uni.setStorageSync("isTip", this.isTip);
          }
        },
      });
    },
    changeSwiper(e) { this.current = e.detail.current; },
    goGit() { window.open("https://github.com/zxb1655/weipyq"); },
    radioChange(evt) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].value === evt.detail.value) { this.current = i; break; }
      }
    },
    goEdit() {
      uni.navigateTo({ url: `/pages/edit/edit?type=${this.current}` });
    },
  },
};
</script>

<style lang="scss">
@media screen and (max-width: 768px) { .pageindex { width: 100vw; } }
@media screen and (min-width: 1024px) {
  .pageindex { width: 550px; height: 100vh; margin: 0 auto; box-shadow: 0 0 5px #eee; }
}
.pageindex {
  .head {
    width: 100%; height: 90upx; background-color: #1677ff; color: #fff;
    display: flex; justify-content: space-between; align-items: center;
    padding: 0 20upx; box-sizing: border-box;
    .head_left { font-size: 40upx; }
    .head_right {
      .iconfont { font-size: 54upx; }
      .icon-github-fill { margin-right: 10upx; }
    }
  }
  .mode {
    margin-top: 20upx; margin-bottom: 20upx; display: flex;
    justify-content: center; align-items: center; position: relative; z-index: 9;
    .mode_left { font-size: 34upx; color: #222; margin-right: 20upx; font-weight: 900; }
    .mode_right { font-size: 28upx; padding: 4upx 8upx; border-radius: 10upx; color: #fff; background-color: var(--green); }
  }
  .swiper { width: 100%; height: 1060upx; }
  .list { width: 600upx; display: flex; align-items: center; justify-content: center; flex-direction: column; margin-bottom: 20upx; }
  .label { display: flex; flex-direction: column; align-items: center; }
  .title { color: var(--green); font-size: 22upx; }
  .num { color: var(--green); font-size: 32upx; margin-bottom: 10upx; font-weight: 900; letter-spacing: 4upx; }
  .list_img { width: 420upx; margin-bottom: 20upx; }
  .btn { display: inline-block; border-radius: 10upx; background-color: var(--green); padding: 10upx 30upx; color: white; font-size: 34upx; }
  .btn_box { text-align: center; padding: 10upx 50upx; }
}
</style>
