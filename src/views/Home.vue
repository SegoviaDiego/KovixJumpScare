<template>
  <div class="home">
    <youtube :video-id="videoId" ref="youtube"
            @ended="toggleFullScreen(false)"
            @paused="toggleFullScreen(false)"
            @playing="toggleFullScreen(true)"></youtube>
    <div class="actions" v-if="!isFullScreen">
      <br/>
      <input type="text" placeholder="Video id" v-model="videoId">
      <input type="number" placeholder="Random max" v-model="randomMax">
      <input type="number" placeholder="Lucky number" v-model="luckyNumber">
      
      <template v-if="videoId && randomMax && luckyNumber">
        <button v-on:click="startRandomJumpscare()">start Random Jumpscare</button>
      </template>
      <button v-on:click="stopRandomJumpscare()">stop Random Jumpscare</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import { remote , app } from 'electron';

@Component({
  components: {
    HelloWorld,
  }
})
export default class Home extends Vue {
  public videoId: string = 'zI9ysnXh_Ps'; // Example: tlThdr3O5Qo
  public randomMax: number = 50;
  public luckyNumber: number = 25;
  public playerVars: any = { autoplay: 1 }
  public randomLoop: any;
  public isFullScreen: boolean = false;

  get player() {
    const obj: any = this.$refs.youtube;
    return obj.player;
  }

  public toggleFullScreen(isFullScreen: any){
    let bounds:any = remote.getCurrentWindow();
    bounds = bounds.webContents.getOwnerBrowserWindow().getBounds();

    this.isFullScreen = isFullScreen;
    if(isFullScreen){
      this.player.setSize(bounds.width, bounds.height);
    } else {
      this.player.setSize(bounds.width * 0.6, bounds.height * 0.5);
    }
  }

  startRandomJumpscare(){
    this.goInvisible();
    setTimeout(()=>{
      this.triggerJumpScare();
    }, 60000 * 60)
  }

  rollDice(){
    const randomNumber = Math.floor((Math.random() * this.randomMax) + 1);
    if(randomNumber == this.luckyNumber) this.triggerJumpScare();
  }

  triggerJumpScare(){
    this.playVideo();
    this.goVisible();
  }

  goVisible(){
    remote.getCurrentWindow().setFullScreen(true)
    remote.getCurrentWindow().setSkipTaskbar(false);
    remote.getCurrentWindow().center()
    remote.getCurrentWindow().show();
    remote.getCurrentWindow().focus()
  }

  goInvisible(){
    app.dock.hide();
    remote.getCurrentWindow().hide();
    remote.getCurrentWindow().setSkipTaskbar(true);
  }

  stopRandomJumpscare(){
    clearInterval(this.randomLoop);
    this.goVisible();
  }

  playVideo() {
    this.player.playVideo();
  }

  playing() {
    console.log('trolled!!!');
  }
}
</script>

<style scoped lang="scss">
.actions {
  background-color: white;
}
</style>
