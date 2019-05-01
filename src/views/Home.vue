<template>
  <div class="home">
    <video class="videoPlayer" id="videoPlayer">
      <!-- <source src="name-of-the-wind-animated.mp4" type="video/mp4"> -->
    </video>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { remote, ipcRenderer } from 'electron';

@Component({})
export default class Home extends Vue {

  created(){
    ipcRenderer.on('readyToPlay', (event: any, src: any) => {
      console.log(`Playing video file from "${src}"`);
      const videoPlayer: any = document.getElementById("videoPlayer");
      videoPlayer.src = `file:///${src}`;
      videoPlayer.oncanplaythrough = () => {
        console.log('Can play through');
        videoPlayer.play();
        ipcRenderer.send('asustovix');
      }
    });

    ipcRenderer.send('readyToPlay');
    console.log('Ready to play');
  }
}
</script>

<style scoped lang="scss">
.home {
  min-width: 100%; 
  min-height: 100%;
  .videoPlayer {
    min-width: 100%; 
    min-height: 100%;
  }
}
</style>
