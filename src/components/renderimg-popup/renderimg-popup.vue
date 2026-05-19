<template>
  <popup ref="imgPopup" type="fadeInMiddle" @hide="hideImgPopup">
    <view class="tip"> 长按图片进行保存 </view>
    <scroll-view scroll-y="true" class="img_popup_box">
      <image :src="imgUrl" mode="heightFix" class="renderImg"></image>
    </scroll-view>
    <view class="download-btn" @tap="downloadImg">点击下载图片</view>
  </popup>
</template>

<script>
export default {
  name: "renderimg-popup",
  data() {
    return {};
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    imgUrl: {
      type: String,
      default: "",
    },
  },
  watch: {
    isShow(newVal, old) {
      if (newVal) {
        this.$refs.imgPopup.show();
      } else {
        this.$refs.imgPopup.hide();
      }
    },
  },
  methods: {
    hideImgPopup() {
      this.close();
    },
    downloadImg() {
      const link = document.createElement('a');
      link.download = 'pyqzan_' + Date.now() + '.png';
      link.href = this.imgUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.rule {
  .img_popup_box {
    width: 630upx;
    height: 75vh;
    border-radius: 10upx;
    .renderImg {
      width: 100%;
    }
  }
  .tip {
    text-align: center;
    padding: 15upx 0;
    font-size: 28upx;
    color: #999;
  }
  .download-btn {
    margin: 20upx auto;
    width: 300upx;
    text-align: center;
    background-color: #1677ff;
    color: #fff;
    padding: 16upx 0;
    border-radius: 8upx;
    font-size: 28upx;
  }
}
</style>
