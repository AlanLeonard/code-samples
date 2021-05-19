<template lang="pug">
  .sell_side_slides_container
    .sell_side_slides_controls
      BaseButton(@click.native='reverseSlide' no-styles).sell_side_slides--prev
        .u--offscreen Previous Story
        InlineLocalSvg(src='~/assets/svgs/arrow.svg')
      BaseTypoHeader(variant='6' tag='div') {{currentIndex + 1 }} / {{ stories.length }}
      BaseButton(@click.native='advanceSlide' no-styles).sell_side_slides--next
        .u--offscreen Next Story
        InlineLocalSvg(src='~/assets/svgs/arrow.svg')
    BaseContainer(ref='carousel')
      transition-group(:name='slideTransitionType' tag='div' class='sell_side_slides')
        SellSideTile(:backgroundColor='`#${stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].backgroundColor}`' :path='`/${stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].phases[0].slug}/${stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].slug}`' :title='stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].title' :author='stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].author' :authorDescription='stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].authorDescription' :image='stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].authorReferenceImage' :key='stories[currentIndex - 1 >= 0 ? currentIndex - 1 : stories.length - 1].slug') 
        SellSideTile(:backgroundColor='`#${stories[currentIndex].backgroundColor}`' :path='`/${stories[currentIndex].phases[0].slug}/${stories[currentIndex].slug}`' :title='stories[currentIndex].title' :author='stories[currentIndex].author' :authorDescription='stories[currentIndex].authorDescription' :image='stories[currentIndex].authorReferenceImage' :key='stories[currentIndex].slug') 
        SellSideTile(:backgroundColor='`#${stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].backgroundColor}`' :path='`/${stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].phases[0].slug}/${stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].slug}`' :title='stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].title' :author='stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].author' :authorDescription='stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].authorDescription' :image='stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].authorReferenceImage' :key='stories[currentIndex + 1 < stories.length ? currentIndex + 1 : 0].slug') 
</template>

<script>
import SellSideTile from '~/components/SellSideTile'
import throttle from 'lodash/throttle'

export default {
  components: {
    SellSideTile
  },
  data() {
    return {
      currentIndex: 0,
      direction: '',
      mouseMoving: null,
      lastTouch: null,
      tX: 0
    }
  },
  computed: {
    slideTransitionType() {
      if (this.direction == 'next') {
        return 'sellside-tiles-adv'
      } else {
        return 'sellside-tiles-prev'
      }
    }
  },
  props: {
    stories: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.carousel = this.$refs.carousel.$el
    this.carousel.addEventListener('touchstart', throttle(this.handleTouchStart.bind(this), 300))
    this.carousel.addEventListener('touchmove', throttle(this.handleTouchMove.bind(this), 300))
    this.carousel.addEventListener('mousedown', throttle(this.handleClickStart.bind(this), 300))
    this.carousel.addEventListener('mouseup', throttle(this.handleClickEnd.bind(this), 300))
  },
  beforeDestroy() {
    this.carousel.removeEventListener('touchstart', this.handleTouchStart)
    this.carousel.removeEventListener('touchmove', this.handleTouchMove)
    this.carousel.removeEventListener('mousedown', this.handleClickStart)
    this.carousel.removeEventListener('mouseup', this.handleClickEnd)
  },

  methods: {
    advanceSlide() {
      this.direction = 'next'
      if (this.currentIndex + 1 < this.stories.length) {
        this.currentIndex += 1
      } else {
        this.currentIndex = 0
      }
    },
    reverseSlide() {
      this.direction = 'prev'
      if (this.currentIndex - 1 >= 0) {
        this.currentIndex -= 1
      } else {
        this.currentIndex = this.stories.length - 1
      }
    },
    handleTouchStart(e) {
      this.lastTouch = e.touches[0].screenX
    },
    handleTouchMove(e) {
      const movement = e.touches[0].screenX - this.lastTouch
      this.tX += movement * 3
      this.lastTouch = e.touches[0].screenX
      if (movement < -100) {
        this.$emit('blockPropagation')
        this.advanceSlide()
      }
      if (movement > 100) {
        this.$emit('blockPropagation')
        this.reverseSlide()
      }
    },
    handleClickStart(e) {
      this.mouseMoving = true
      this.carousel.addEventListener('mousemove', throttle(this.handleMouseMove.bind(this), 300))
      this.lastClick = e.screenX
      e.preventDefault()
      e.stopPropagation()
    },
    handleMouseMove(e) {
      if (this.mouseMoving == true) {
        const movement = e.screenX - this.lastClick
        this.tX += movement * 3
        this.lastClick = e.screenX
        if (movement < -100) {
          this.$emit('blockPropagation')
          this.advanceSlide()
        }
        if (movement > 100) {
          this.$emit('blockPropagation')
          this.reverseSlide()
        }
      }
    },
    handleClickEnd(e) {
      e.preventDefault()
      e.stopPropagation()
      this.carousel.removeEventListener('mousemove', this.handleMouseMove)
      this.mouseMoving = false
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .sell_side_tile {
  position: relative;
  user-select: none;
  @include media-grid('>=lg') {
    padding-top: 100px;
  }
}
.sell_side_slides_controls {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 20px;
  right: 50%;
  transform: translateX(50%);
  z-index: 5;
}
::v-deep .base_button {
  position: relative;
  display: inline-block;
  padding: 2px 5px;
  svg {
    height: 12px;
    width: 13px;
  }
  &.sell_side_slides--next {
    transform: scaleX(-1);
    transform-origin: 50% 50%;
  }
}
.sell_side_slides {
  display: flex;
  transform: translateX(-83%);
  position: relative;
  @include media-grid('>=md') {
    transform: translateX(-66.5%);
  }
  @include media-grid('>=lg') {
    transform: translateX(-24.5%);
  }
  ::v-deep .sell_side_tile {
    flex-shrink: 0;
  }
}
.sell_side_slides_container {
  overflow: hidden;
  width: 100%;
  position: relative;
  margin-bottom: 60px;
  @include media-grid('>=md') {
    margin-bottom: 100px;
  }
  @include media-grid('>=lg') {
    margin-bottom: 120px;
  }
}
.sellside-tiles-adv-enter-active,
.sellside-tiles-adv-leave-active,
.sellside-tiles-prev-enter-active,
.sellside-tiles-prev-leave-active {
  transition: transform 0.37s;
}
.sellside-tiles-adv-leave-active {
  position: absolute;
  height: 100%;
}
.sellside-tiles-prev-leave-active {
  position: absolute;
  height: 100%;
  left: 100%;
}
.sellside-tiles-adv-enter,
.sellside-tiles-prev-leave-to {
  transform: translateX(100%);
}
.sellside-tiles-adv-leave-to,
.sellside-tiles-prev-enter {
  transform: translateX(-100%);
}

.sellside-tiles-adv-move,
.sellside-tiles-prev-move {
  transition: transform 0.4s;
}
</style>