<template>
	<view class="pagearticle" ref="render">
		<renderimg-popup :imgUrl="renderUrl" :isShow="isShowRender" @close="isShowRender = false" />
		<view class="hotBox" @tap="handleRight"></view>
		<view class="content" @touchstart="hideLong">
			<html2canvas ref="html2canvas" :domId="domId" @renderFinish="renderFinish">
				<view id="poster">
					<img :src="pageData.articleImgList[0]" class="autoImg"></image>
					<view class="comment">
						<comment-module isAuto :pageData="pageData" @showSelect="showSelect" />
					</view>
					<img v-if="pageData.articleImgList.length >1" :src="pageData.articleImgList[1]" class="autoComImg"></image>
					<longselect-module @cancel="longSelectHidden = false" @renderImg="preImg" :coordinate='coordinate' :hidden="longSelectHidden" />
					<input-module @blur="blurInput" :focus='false' :isFixed="isFixed" @inputMsg='getComment' />
					<view class="input"></view>
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
      coordinate: {},
      longSelectHidden: false,
      isFixed: false,
      domId: "",
      pageData: {
        type: 0,
        articleImgList: [],
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
    const data = JSON.parse(option.data);
    this.pageData = data;
  },
  methods: {
    handleRight(data) {
      this.coordinate = data;
      this.longSelectHidden = !this.longSelectHidden;
    },
    hideLong() {
      this.longSelectHidden = false;
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
    async doSave() {
      this.isFixed = false;
      uni.showToast({ title: "正在生成...", icon: "none", mask: true, duration: 5000 });
      try {
        const el = document.querySelector("#poster");
        if (!el) { uni.hideToast(); uni.showToast({ title: "未找到元素", icon: "none" }); return; }
        const imgs = el.querySelectorAll("img");
        for (let img of imgs) {
          if (img.src && img.src.startsWith("http") && !img.src.startsWith(location.origin)) {
            await new Promise((resolve) => {
              let tmp = new Image();
              tmp.crossOrigin = "anonymous";
              tmp.onload = () => {
                let cv = document.createElement("canvas");
                cv.width = tmp.naturalWidth;
                cv.height = tmp.naturalHeight;
                cv.getContext("2d").drawImage(tmp, 0, 0);
                try { img.src = cv.toDataURL("image/jpeg", 0.8); } catch(e) {}
                resolve();
              };
              tmp.onerror = resolve;
              tmp.src = img.src;
            });
          }
        }
        await new Promise(r => setTimeout(r, 100));

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
		
		.input{
			position: fixed;
			bottom: 0;
			width: 100%;
			height: 150upx;
		}
		
		.autoImg{
			width: 100%;
		}
		.autoComImg{
			width: 100%;
			margin-top: -134upx;
			margin-bottom: 150upx;
		}
		
		.hotBox{
			width: 200upx;
			height: 200upx;
			position: fixed;
			z-index: 1;
			top: 0;
			right: 0;
		}
		
		#poster{
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
