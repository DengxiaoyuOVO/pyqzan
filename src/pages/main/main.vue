<template>
  <view class="main">
    <renderimg-popup
      :imgUrl="renderUrl"
      :isShow="isShowRender"
      @close="isShowRender = false"
    />
    <!-- 长按展开模块 -->
    <longselect-module
      @renderImg="preImg"
      :coordinate="coordinate"
      :hidden="longSelectHidden"
    />
    <html2canvas ref="html2canvas" :domId="domId" @renderFinish="renderFinish">
      <view class="canbox" id="main" @touchstart="hideLong">
        <!-- 手机顶部导航 -->
        <block v-if="pageData.navbar">
          <navbar
            @handle="handleRight"
            ismain
            :pageData="pageData"
            bgColor="#111"
            textColor="#fff"
          />
        </block>
        <view class="content">
          <image
            :src="pageData.article.pictureList[0]"
            mode="widthFix"
            class="con_img"
          ></image>
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
    </html2canvas>
      <!-- 保存截图按钮 -->
    <view class="save-btn" @click="doSave" v-if="!isShowRender">
      <text class="iconfont icon-good"></text>
      <text>保存截图</text>
    </view>
</view>
</template>

<script>
import html2canvas from "html2canvas";
export default {
  data() {
    return {
      isShowRender: false,
      renderUrl: "",
      coordinate: {},
      longSelectHidden: false,
      domId: "",
      pageData: {
        type: 2,
        navbar: false,
        navbarTime: "",
        dian: 0,
        article: {
          username: "",
          avatar: "",
          contentText: "",
          pictureList: [],
          date: { date: "", time: "" },
        },
        comment: {
          commentNum: 0,
          goodUserAvatarList: 0,
          commentUserList: [],
        },
      },
    };
  },
  onLoad(option) {
    this.domId = "#poster";
    const app = getApp();
    if (app.globalData.articleData) {
      Object.assign(this.pageData, app.globalData.articleData);
      delete app.globalData.articleData;
    } else if (option.data) {
      try { const d = JSON.parse(option.data); Object.assign(this.pageData, d); } catch(e) {}
    }
  },
  methods: {
    handleRight(data) {
      this.coordinate = data;
      this.longSelectHidden = !this.longSelectHidden;
    },
    preImg() {
      setTimeout(()=>{
        this.$refs.html2canvas.createImg();
      },200)
    },
    renderFinish(filePath) {
      this.renderUrl = filePath;
      uni.hideToast();
      this.isShowRender = true;
    },
    async doSave() {
      uni.showToast({ title: "正在生成...", icon: "none", mask: true, duration: 5000 });
      try {
        const el = document.querySelector(".canbox") || document.querySelector("#main");
        if (!el) { uni.hideToast(); uni.showToast({ title: "未找到元素", icon: "none" }); return; }
        // Replace cover img with canvas so html2canvas captures it natively
        const img = el.querySelector("img.linkImg") || el.querySelector("img[src^='data:']");
        let backup = null;
        if (img && img.src && img.src.startsWith("data:")) {
          const tmp = new Image();
          await new Promise(r => { tmp.onload = r; tmp.onerror = r; tmp.src = img.src; });
          if (tmp.complete && tmp.naturalWidth) {
            const cv = document.createElement("canvas");
            cv.width = tmp.naturalWidth;
            cv.height = tmp.naturalHeight;
            cv.className = img.className;
            cv.style.cssText = img.style.cssText;
            cv.getContext("2d").drawImage(tmp, 0, 0);
            backup = { parent: img.parentNode, ref: img.nextSibling, el: img };
            img.parentNode.insertBefore(cv, img);
            img.parentNode.removeChild(img);
          }
        }
        const scale = Math.max(window.devicePixelRatio || 1, 2) * 2;
        const canvas = await html2canvas(el, { width: el.offsetWidth, height: el.offsetHeight, useCORS: false, scale });
        // Restore original img
        if (backup) {
          const cvs = backup.parent.querySelectorAll("canvas");
          for (const cv of cvs) {
            backup.parent.insertBefore(backup.el, cv);
            backup.parent.removeChild(cv);
            break;
          }
        }
        this.renderUrl = canvas.toDataURL("image/png", 1);
        uni.hideToast();
        this.isShowRender = true;
      } catch(e) {
        uni.hideToast();
        uni.showToast({ title: "生成失败: " + e.message, icon: "none", duration: 3000 });
      }
    },
  },
};
</script>


<style lang="scss">
/* 针对手机设备 */
@media screen and (max-width: 768px) {
  .main {
    width: 100vw;
  }
}
/* 针对桌面设备 */
@media screen and (min-width: 1024px) {
  .main {
    width: 550px;
    height: 100vh;
    margin: 0 auto;
    box-shadow: 0 0 5px #eee;
  }
}
.main {
  .canbox {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .content {
      flex: 1;
      background-color: #000;
      max-height: 85vh;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      margin: -2upx 0;

      .con_img {
        width: 100%;
      }
    }

    .boottom {
      width: 100%;
      height: auto;
      background-color: #0f0e13;
    }

    .boot_text {
      color: #fffeff;
      padding: 14upx 20upx;
      font-size: 34upx;
      letter-spacing: 2upx;
      line-height: 1.4;
      max-height: 130upx;
      overflow: hidden;
    }

    .footer {
      width: 100%;
      height: 90upx;
      box-sizing: border-box;
      background-color: #343233;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40upx 10upx 30upx;

      .icon-good {
        font-size: 42upx;
        margin-right: 6upx;
        vertical-align: middle;
      }

      .zan {
        font-size: 32upx;
        margin-right: 16upx;
        position: relative;
        bottom: 2upx;
      }

      .moreright {
        margin-right: 50upx;
      }

      .icon-chat {
        font-size: 38upx;
        font-weight: 900;
        margin-right: 8upx;
        vertical-align: middle;
        position: relative;
        top: 2upx;
      }

      .comment {
        font-size: 32upx;
        position: relative;
        bottom: 2upx;
      }
    }
  }
}
.save-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 90upx;
    background-color: #1677ff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32upx;
    z-index: 999;
    gap: 10upx;
  }
</style>
