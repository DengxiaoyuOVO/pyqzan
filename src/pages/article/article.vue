<template>
  <view class="pagearticle" ref="render">
    <renderimg-popup
      :imgUrl="renderUrl"
      :isShow="isShowRender"
      @close="isShowRender = false"
    />
    <view class="content">
      <html2canvas
        ref="html2canvas"
        :domId="domId"
        @renderFinish="renderFinish"
      >
        <view id="poster">
          <!-- 手机顶部导航 -->
          <block v-if="pageData.navbar">
            <navbar @handle="doNothing" :pageData="pageData" />
          </block>
          <!-- 文章内容模块 -->
          <article-module
            :pageData="pageData"
            @comment="clickComment"
            @selfzan="clickGood"
          >
            <block v-if="pageData.article.pictureList != 0">
              <upload
                slot="picture"
                show
                :filesData="pageData.article.pictureList"
              />
            </block>
          </article-module>
          <!-- 文章评论模块 -->
          <view class="comment">
            <comment-module
              @showSelect="showSelect"
              :avatar="pageData.article.avatar"
              :pageData="pageData"
              :self-good="selfGood"
            />
          </view>
          <!-- 长按展开模块 -->
          <longselect-module
            @cancel="longSelectHidden = false"
            @replyCom="replyCom"
            @renderImg="preImg"
            @deleteCom="deleteCom"
            :coordinate="coordinate"
            :hidden="longSelectHidden"
          />
          <!-- input模块 -->
          <input-module
            @blur="blurInput"
            :reply="reply"
            :focus="isFocus"
            :isFixed="isFixed"
            @inputMsg="getComment"
          />
        </view>
      </html2canvas>
    </view>
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
      isRulePopup: true,
      coordinate: {},
      longSelectHidden: false,
      isFixed: false,
      isFocus: false,
      selfGood: false,
      reply: {
        isReply: false,
        username: "",
      },
      domId: "",
      pageData: {
        type: 0,
        navbar: false,
        navbarTime: "",
        dian: 0,
        linkInfo: {
          linkText: "",
          linkImg: "/static/img/avatar.png",
        },
        article: {
          username: "",
          avatar: "",
          contentText: "",
          pictureList: [],
          date: {
            date: "",
            time: "",
          },
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
    if (app.globalData.articleData) { this.pageData = app.globalData.articleData; delete app.globalData.articleData; } else if (option.data) { this.pageData = JSON.parse(option.data); }
  },
  methods: {
    handleRight(data) {
      this.coordinate = data;
      this.longSelectHidden = !this.longSelectHidden;
    },
    preImg() {
      this.isFixed = false;
      setTimeout(()=>{
        this.$refs.html2canvas.createImg();
      },200)
    },
    renderFinish(filePath) {
      this.renderUrl = filePath;
      uni.hideToast();
      this.isShowRender = true;
      this.isFixed = true;
    },
    deleteCom(i) {
      if (typeof i == "number") {
        this.pageData.comment.commentUserList.splice(i, 1);
      }
    },
    replyCom(i) {
      let username = this.pageData.comment.commentUserList[i].username;
      this.reply.isReply = true;
      this.reply.username = username;
      this.isFocus = true;
    },
    clickComment() {
      this.isFocus = true;
      this.reply.isReply = false;
      this.reply.username = "";
    },
    clickGood(data) {
      this.selfGood = data;
    },
    showSelect(data) {
      this.coordinate = data;
      this.longSelectHidden = true;
    },
    blurInput(value) {
      if (!value) {
        setTimeout(() => {
          this.reply.isReply = false;
          this.reply.username = "";
        }, 100);
      }
      this.isFocus = false;
    },
    getComment(e) {
      let array = this.pageData.comment.commentUserList;
      array.push(e);
      this.pageData.comment.commentUserList = array;
      this.reply.isReply = false;
      this.reply.username = "";
      this.isFocus = false;
    },
    doNothing() {},
    async doSave() {
      this.isFixed = false;
      uni.showToast({ title: "正在生成...", icon: "none", mask: true, duration: 5000 });
      try {
        const el = document.querySelector("#poster");
        if (!el) { uni.hideToast(); uni.showToast({ title: "未找到元素", icon: "none" }); return; }
        const canvas = await html2canvas(el, { width: el.offsetWidth, height: el.offsetHeight, useCORS: true, scale: Math.max(window.devicePixelRatio || 1, 2) * 2 });
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
  .pagearticle {
    width: 100vw;
  }
}
/* 针对桌面设备 */
@media screen and (min-width: 1024px) {
  .pagearticle {
    width: 550px;
    height: 100vh;
    margin: 0 auto;
    box-shadow: 0 0 5px #eee;
  }
}
.pagearticle {
  #poster {
    min-height: 100vh;
    position: relative;
  }

  .comment {
    padding-bottom: 2upx;
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
