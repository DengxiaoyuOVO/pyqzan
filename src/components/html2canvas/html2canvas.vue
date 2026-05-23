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
					const canvas = await html2canvas(el, {
						useCORS: true,
						allowTaint: false
					});
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
