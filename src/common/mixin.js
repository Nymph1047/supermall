import {debounce} from "./utils";

export const itemListenerMixin = {
    data() {
      return {
          itemImgListener: null
      }
    },
    mounted() {
        let newRefresh = debounce(this.$refs.scroll.refresh,100)

        this.itemImgListener = () => {
            newRefresh()
        }
        this.$bus.$on('itemImgLoad',this.itemImgListener)
    }
}
