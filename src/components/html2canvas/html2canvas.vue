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
					
					// Hide data URL cover, save info for manual composite
					const coverImg = shareContent.querySelector('.linkImg');
					let coverInfo = null;
					console.log('coverImg found:', !!coverImg, 'src starts data:', coverImg && coverImg.src && coverImg.src.startsWith('data:'));
					if (coverImg && coverImg.src && coverImg.src.startsWith('data:')) {
						const sr = coverImg.getBoundingClientRect();
						const pr = shareContent.getBoundingClientRect();
						coverInfo = { src: coverImg.src, x: sr.left - pr.left, y: sr.top - pr.top, w: sr.width, h: sr.height };
						coverImg.style.visibility = 'hidden';
					console.log('coverInfo:', JSON.stringify(coverInfo));
					}
					
					// Remove crossorigin, wait for remaining images
					const images = shareContent.querySelectorAll('img');
					for (const img of images) {
						img.removeAttribute('crossorigin');
						if (!img.complete) {
							await new Promise(r => { img.onload = r; img.onerror = r; });
						}
					}
					
					const canvas = await html2canvas(shareContent, {
						width: shareContent.offsetWidth,
						height: shareContent.offsetHeight,
						logging: false,
						useCORS: false,
						allowTaint: false
					});
					
					console.log('compositing cover...');
					// Manually composite cover onto canvas
					if (coverInfo) {
						const ci = new Image();
						await new Promise((resolve) => { ci.onload = resolve; ci.onerror = resolve; ci.src = coverInfo.src; });
						if (ci.complete && ci.naturalWidth) {
							const ctx = canvas.getContext('2d');
							ctx.drawImage(ci, coverInfo.x, coverInfo.y, coverInfo.w, coverInfo.h);
						}
						coverImg.style.visibility = '';
					console.log('composite done');
					}
					
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


