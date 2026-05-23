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
					const el = document.querySelector(this.domId);
					// Hide cover, composite manually
					const cover = el.querySelector("img[src^='data:']");
					let ci = null;
					if (cover) {
						const cr = cover.getBoundingClientRect();
						const er = el.getBoundingClientRect();
						ci = { img: cover, x: cr.left - er.left, y: cr.top - er.top, w: cr.width, h: cr.height, src: cover.src };
						cover.style.visibility = 'hidden';
					}
					const canvas = await html2canvas(el, { useCORS: false, allowTaint: false });
					if (ci) {
						const img = new Image();
						await new Promise((r) => { img.onload = r; img.onerror = r; img.src = ci.src; });
						if (img.complete && img.naturalWidth) {
							canvas.getContext('2d').drawImage(img, ci.x, ci.y, ci.w, ci.h);
						}
						ci.img.style.visibility = '';
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
