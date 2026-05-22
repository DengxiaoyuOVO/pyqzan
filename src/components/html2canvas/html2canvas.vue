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
			domId: {
				type: String,
				required: true
			}
		},
		methods: {
						async createImg() {
				try {
					this.showLoading();
					const shareContent = document.querySelector(this.domId);
					
					// Convert all non-data-URL images to data URLs
					const images = shareContent.querySelectorAll('img');
					for (const img of images) {
						const src = img.getAttribute('src') || img.src;
						if (!src || src.startsWith('data:')) continue;
						try {
							const proxy = new Image();
							proxy.crossOrigin = 'anonymous';
							await new Promise((resolve, reject) => {
								proxy.onload = resolve;
								proxy.onerror = reject;
								proxy.src = src;
							});
							const cvs = document.createElement('canvas');
							cvs.width = proxy.naturalWidth;
							cvs.height = proxy.naturalHeight;
							cvs.getContext('2d').drawImage(proxy, 0, 0);
							img.src = cvs.toDataURL('image/jpeg', 0.9);
							img.removeAttribute('crossorigin');
						} catch(e) {
							// If proxy load fails, try direct draw (same-origin only)
							try {
								if (img.complete && img.naturalWidth) {
									const cvs = document.createElement('canvas');
									cvs.width = img.naturalWidth;
									cvs.height = img.naturalHeight;
									cvs.getContext('2d').drawImage(img, 0, 0);
									img.src = cvs.toDataURL('image/jpeg', 0.9);
									img.removeAttribute('crossorigin');
								}
							} catch(e2) {}
						}
					}
					
					// Remove crossorigin from data URL images
					for (const img of images) {
						if (img.src.startsWith('data:')) {
							img.removeAttribute('crossorigin');
						}
					}
					
					await new Promise(r => setTimeout(r, 100));
					
					const canvas = await html2canvas(shareContent, {
						width: shareContent.offsetWidth,
						height: shareContent.offsetHeight,
						logging: false,
						useCORS: false,
						allowTaint: false
					});
					const base64 = canvas.toDataURL('image/jpeg', 1);
					this.renderFinish(base64);
				} catch(error){
					console.log(error);
				}
			},
			async renderFinish(base64) {
				try{
					this.$emit('renderFinish', base64);
					// const imgPath = await base64ToPath(base64, '.jpeg');
					// this.$emit('renderFinish', imgPath);
				}catch(e){
					console.log('html2canvas error', e)
				}
			},
			showLoading() {
				uni.showToast({
					title: "正在生成海报",
					icon: "none",
					mask: true,
					duration: 100000
				})
			},
		}
	}
</script>


