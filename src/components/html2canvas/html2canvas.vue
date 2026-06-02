<template>
	<view>
		<view class="html2canvas" :prop="domId">
			<slot></slot>
		</view>
	</view>
</template>

<script>
	import { base64ToPath } from '@/static/libs/image-tools.js';
	import html2canvas from 'html2canvas';
	export default {
		name: 'html2canvas',
		props: {
			domId: { type: String, required: true }
		},
		methods: {
			async createImg() {
				try {
					this.showLoading();
					const el = document.querySelector(".canbox") || document.querySelector("#main");
					// 找到封面 img，替换为 canvas
					const img = el.querySelector("img.linkImg") || el.querySelector("img[src^='data:']");
					let backup = null;
					if (img && img.src && img.src.startsWith('data:')) {
						const tmp = new Image();
						await new Promise(r => { tmp.onload = r; tmp.onerror = r; tmp.src = img.src; });
						if (tmp.complete && tmp.naturalWidth) {
							const cv = document.createElement('canvas');
							cv.width = tmp.naturalWidth;
							cv.height = tmp.naturalHeight;
							cv.className = img.className;
							cv.style.cssText = img.style.cssText;
							cv.getContext('2d').drawImage(tmp, 0, 0);
							backup = { parent: img.parentNode, ref: img.nextSibling, el: img };
							img.parentNode.insertBefore(cv, img);
							img.parentNode.removeChild(img);
						}
					}
					const canvas = await html2canvas(el, {
						useCORS: false,
						allowTaint: false
					});
					// 恢复原 img
					if (backup) {
						const cvs = backup.parent.querySelectorAll('canvas');
						for (const cv of cvs) {
							backup.parent.insertBefore(backup.el, cv);
							backup.parent.removeChild(cv);
							break;
						}
					}
					const base64 = canvas.toDataURL('image/jpeg', 1);
					this.renderFinish(base64);
				} catch (e) {
					console.log(e);
				}
			},
			async renderFinish(base64) {
				try { this.$emit('renderFinish', base64); }
				catch (e) { console.log('html2canvas error', e); }
			},
			showLoading() {
				uni.showToast({ title: '正在生成海报', icon: 'none', mask: true, duration: 100000 });
			}
		}
	}
</script>
