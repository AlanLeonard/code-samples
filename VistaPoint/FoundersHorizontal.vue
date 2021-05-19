<template lang="pug">
  .horizontal_scroll_container
      transition(name='progress')
        .panel_progress(ref='progress' v-show='!hideProgressBar')
          BaseContainer
            ul.list_reset
              li.panel_progress_item(v-for='(phase, index) in phases' :class='`${currentPhaseIndex == index ? "panel_progress_item--active" : ""}`')
                BaseLink(:href='phase.slug' @click.prevent='scrollToPanel($event, phase.slug)' start-blank).panel_progress_item--name {{phase.name}}
      .horizontal_scroll_container--inner(:style='`transform: translate3d(${horizontalPosition}px, 0, 0)`' ref='scrollContainer' )
        .panel.panel--opening
          BaseContainer
            .opening--left
              .opening--left--inner
                BaseTypoHeader(variant='8' display-block ) For Founders
                BaseTypoHeader(variant='2' tag='h3' style='margin-bottom: 30px;') {{forFoundersPage.displayNameContent}}
                BaseTypoParagraph {{forFoundersPage.introductionContent}}
            .opening--right(:style='`background-image: url(${forFoundersPage.image.assetUrl})`')
              .opening--right--inner
                ul.list_reset
                  li(v-for='phase in phases').phase_list_item
                    BaseTypoHeader(variant='8' display-block ) {{phase.chapterNumber}}
                    BaseLink(:href='phase.slug' @click.prevent='scrollToPanel($event, phase.slug)' no-underline)
                      BaseTypoHeader(variant='4' display-block) {{phase.name}}
                BaseLink(href="#" ref='scroll_trigger' @click.prevent='triggerScroll()' button-styles).scroll_trigger Scroll

        .panel.panel--phase(v-for='(phase, index) in phases' :ref='phase.slug' :data-panel-index='index')
          .panel_intro
            BaseTypoHeader(variant='8' tag='div' displayBlock) {{phase.chapterNumber}}
            BaseTypoHeader(variant='2' displayBlock) {{phase.name}}
            BaseTypoParagraph {{phase.body}}

          .panel_perspectives(v-if='phase.perspectives.length')
            BaseTypoHeader(variant='8' tag='div' displayBlock).perspectives_eyebrow VPA Perspectives
            ul.list_reset
              li(v-for='perspective in phase.perspectives')
                BaseLink(:to='{name: "perspectives-detail", params: {slug: perspective.slug}}' no-underline)
                  BaseTypoHeader(variant='5' tag='h3') {{perspective.shortTitle || perspective.title}}

          .panel_stories(v-if='phase.sellSideStories.length')
            ul.list_reset
              li(v-for='story in phase.sellSideStories')
                SellSideTile(:backgroundColor='`#${story.backgroundColor}`' :title='story.title' :author='story.author' :path='`/${story.phases[0].slug}/${story.slug}`' :authorDescription='story.authorDescription' :image='story.authorReferenceImage')
        .panel.panel--closing
          Hero(:image='teamLandingImage.image' :headline='forFoundersPage.closingStatement' link='/team')

</template>

<script>
import normalizeWheel from 'normalize-wheel'
import { mapRange } from '~/lib/ui-utils'

import SellSideTile from '~/components/SellSideTile'
import Hero from '~/components/Hero'
export default {
  components: {
    SellSideTile,
    Hero
  },

  props: {
    phases: {
      type: Array,
      required: true
    },
    forFoundersPage: {
      type: Object,
      required: true
    },
    teamLandingImage: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      totalWidth: 0,
      horizontalPosition: 0,
      lastTouch: null,
      tX: 0,
      currentPhaseIndex: null,
      hideProgressBar: false
    }
  },
  methods: {
    setTotalWidth() {
      let percentage = 0
      if (this.totalWidth > 0) {
        percentage = -this.horizontalPosition / this.totalWidth
        this.totalWidth = 0
      }
      this.$refs.scrollContainer.children.forEach(element => {
        this.totalWidth += element.getBoundingClientRect().width
      })
      this.totalWidth -= window.innerWidth
      if (percentage !== 0) {
        this.horizontalPosition = -(this.totalWidth * percentage)
      }
    },
    processMovement(amount) {
      let movement = (-0 + amount) * 0.5 * 8
      movement = mapRange(movement, -100, 100, -40, 40)
      if (
        this.horizontalPosition + movement <= this.startX &&
        this.horizontalPosition + movement >= -this.totalWidth
      ) {
        this.horizontalPosition += movement
      } else if (this.horizontalPosition + movement > this.startX) {
        this.horizontalPosition = this.startX
      } else if (this.horizontalPosition + movement < -this.totalWidth) {
        this.horizontalPosition = -this.totalWidth
      }
    },
    handleKeypress(e) {
      if(e.code == 'ArrowLeft' || e.code == 'ArrowUp') {
        this.processMovement(100)
      }
      else if(e.code == 'ArrowRight' || e.code == 'ArrowDown') {
        this.processMovement(-100)
      }
    },
    handleScroll(e) {
      const normalizedEvent = normalizeWheel(e)
      let movement = (-normalizedEvent.pixelX + -normalizedEvent.pixelY) * 0.5 * 8
      movement = mapRange(movement, -100, 100, -40, 40)
      if (
        this.horizontalPosition + movement <= this.startX &&
        this.horizontalPosition + movement >= -this.totalWidth
      ) {
        this.horizontalPosition += movement
      } else if (this.horizontalPosition + movement > this.startX) {
        this.horizontalPosition = this.startX
      } else if (this.horizontalPosition + movement < -this.totalWidth) {
        this.horizontalPosition = -this.totalWidth
      }
    },
    handleTouchStart(e) {
      this.lastTouch = e.touches[0].screenX
    },

    handleTouchMove(e) {
      const movement = e.touches[0].screenX - this.lastTouch
      this.lastTouch = e.touches[0].screenX
      if (
        this.horizontalPosition + movement <= this.startX &&
        this.horizontalPosition + movement >= -this.totalWidth
      ) {
        this.horizontalPosition = this.horizontalPosition + movement * 2
      }
    },
    triggerScroll() {
      this.$refs.scrollContainer.style.transition = 'transform 1s'
      this.horizontalPosition = -window.innerWidth
      setTimeout(() => {
        this.$refs.scrollContainer.style.transition = 'none'
      }, 1000)
    },
    scrollToPanel(event, slug) {
      const element = this.$refs[slug]
      this.$refs.scrollContainer.style.transition = 'transform 1s'
      this.horizontalPosition = -element[0].offsetLeft
      setTimeout(() => {
        this.$refs.scrollContainer.style.transition = 'none'
      }, 1000)
      if (this.$route.params.phaseSlug != slug) {
        history.replaceState(null, null, slug)
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$mq == 'lg' || this.$mq == 'wide') {
        document.querySelector('.site_header--root').appendChild(this.$refs.progress)
        this.$nuxt.$on('resetFoundersPosition', () => {
          setTimeout(() => {
            this.$refs.scrollContainer.style.transition = 'transform 1s'
            this.horizontalPosition = 0
          }, 1200)
          setTimeout(() => {
            this.$refs.scrollContainer.style.transition = 'none'
          }, 2200)
        })
        document.body.style.overflow = 'hidden'
        document.querySelector('.site_wrap').classList.add('site_theme--horizontal')
        window.addEventListener('wheel', this.handleScroll, false)
        window.addEventListener('touchstart', this.handleTouchStart, false)
        window.addEventListener('touchmove', this.handleTouchMove, false)
        window.addEventListener('keydown', this.handleKeypress)
        this.startX = 0
        window.addEventListener('resize', this.setTotalWidth)
        this.setTotalWidth()
        if (this.$route.path !== '/for-founders') {
          setTimeout(() => {
            this.scrollToPanel(null, this.$route.path.replace('/', ''))
          }, 1000)
        }
      }
      this.horizontalPosition = this.startX
      this.cX = this.horizontalPosition
    })
    this.elements = document.querySelectorAll('.panel--phase .panel_intro')
    this.phaseObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting === true && entries[0].intersectionRatio >= 0.5) {
          if (entries[0].target.parentElement.attributes.getNamedItem('data-panel-index')) {
            const index = entries[0].target.parentElement.attributes.getNamedItem(
              'data-panel-index'
            ).value
            this.currentPhaseIndex = index
          } else {
            this.currentPhaseIndex = null
          }
        }
      },
      {
        threshold: [0.5, 0.9, 1]
      }
    )
    this.elements.forEach(element => {
      this.phaseObserver.observe(element)
    })
    this.closingPanel = document.querySelector('.panel--closing')
    this.closingPanelObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting === true) {
          this.hideProgressBar = true
        } else {
          this.hideProgressBar = false
        }
      },
      {
        threshold: [0.1, 0.9, 1]
      }
    )
    this.closingPanelObserver.observe(this.closingPanel)
  },
  beforeDestroy() {
    this.elements.forEach(element => {
      this.phaseObserver.unobserve(element)
    })
    window.removeEventListener('keydown', this.handleKeypress)
    window.removeEventListener('resize', this.setTotalWidth)
    this.closingPanelObserver.unobserve(this.closingPanel)
    document.body.style.overflow = ''
    this.$refs.progress.remove()
    this.$nuxt.$off('resetFoundersPosition')
  }
}
</script>

<style lang="scss" scoped>
.horizontal_scroll_container {
  overflow-x: hidden;
  overflow-y: hidden;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  &--inner {
    flex-wrap: nowrap;
    height: 100%;
    display: flex;
  }
}
.panel {
  min-width: 100%;
  flex-shrink: 0;
}
.panel--opening {
  padding-top: 100px;
  overflow: hidden;
  ::v-deep .container {
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: space-between;
    height: 100%;
    @include media-grid('>=lg') {
      width: calc(100% + 200px);
      margin-right: 0;
      margin-left: 0;
      padding-right: 100px;
      padding-left: 100px;
      box-sizing: content-box;
    }
  }
  .phase_list_item {
    margin-bottom: 30px;
    &:first-of-type {
      position: relative;
    }
    ::v-deep .base_link {
      &:hover,
      &:focus {
        color: $c-jade;
      }
    }
  }
  .scroll_trigger {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  .opening--left {
    padding-top: 75px;
    @include media-grid('>=lg') {
      @include susy-use($susy-desktop) {
        width: susy-span(7 of 18);
        display: flex;
        align-items: flex-start;
      }
    }
    &--inner {
      min-height: 70vh;
    }
    .typo_paragraph {
      padding-right: 60px;
    }
  }
  .opening--right {
    height: 100%;
    background-size: cover;

    @include media-grid('>=lg') {
      @include susy-use($susy-desktop) {
        width: susy-span(11 of 18);
        padding-right: 100px;
        box-sizing: content-box;
        margin-right: -100px;
        height: calc(100% - 50px);
        padding-top: 75px;
        display: flex;
        align-items: flex-start;
      }
    }
    .opening--right--inner {
      @include media-grid('>=lg') {
        @include susy-use($susy-desktop) {
          width: susy-span(11 of 11);
          margin-left: susy-span(1 wide of 11);
        }
      }
    }
  }
}
.panel--closing {
  .hero_container {
    max-height: 100%;
    overflow: hidden;
    max-width: 100%;
    height: 100%;
  }
  ::v-deep .hero_caption {
    top: 175px;
  }
}
.panel--phase {
  display: flex;
  align-items: stretch;
  .panel_intro {
    > * {
      max-width: 580px;
    }
    width: 50vw;
    padding-left: 5vw;
    padding-right: 5vw;
    padding-top: 175px;
  }
  ::v-deep h2.typo_header {
    margin-bottom: 30px;
  }
  .panel_perspectives {
    padding-top: 175px;
    background: rgba($c-mint, 0.3);
    width: 50vw;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    ul {
      min-height: 60vh;
    }
    li {
      margin-bottom: 30px;
    }
    @include media-grid('>=lg') {
      @include susy-use($susy-desktop) {
        padding-left: susy-span(0.5 of 18);
        padding-right: susy-span(0.5 of 18);
      }
    }
    ::v-deep .typo_header {
      display: inline;
    }
    ::v-deep .base_link:hover,
    ::v-deep .base_link:focus {
      outline: 0;
      color: $c-jade;
    }
  }
  .panel_stories {
    ul {
      height: 100%;
      display: flex;
      align-items: stretch;
      li {
        height: 100%;
      }
      ::v-deep .sell_side_tile {
        height: 100%;
        padding-top: 175px;
        width: 40vw;
        min-width: 600px;
        display: flex;
        align-items: flex-start;
        .sell_side_tile--inner {
          min-height: 60vh;
        }
      }
    }
  }
}
.perspectives_eyebrow {
  margin-bottom: 30px;
}
.panel_progress {
  position: fixed;
  top: 0;
  z-index: 111;
  left: 25vw;
  right: 25vw;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: top 0.3s;
  .panel_progress_item--name {
    ::v-deep .base_link {
      padding-top: 100px;
    }
  }
  &:hover {
    .panel_progress_item--name {
      opacity: 1;
    }
  }

  ul {
    display: flex;
    justify-content: space-between;
    position: relative;
    width: 100%;
    margin: 0 auto;
    &:before {
      content: '';
      display: block;
      position: absolute;
      height: 1px;
      right: 0;
      left: 0;
      background: $c-jade;
      top: calc(50% - 1px);
      z-index: -1;
    }
  }
}
header:hover + .the_page .panel_progress_item--name {
  opacity: 1;
  animation: none !important;
}
.panel_progress_item {
  height: 9px;
  width: 9px;
  background: $c-white;
  border: 1px solid $c-jade;
  border-radius: 50%;
  position: relative;
  &--active {
    background: $c-jade;
    .panel_progress_item--name {
      color: $c-black;
      opacity: 1;
    }
  }
  &--name {
    opacity: 0;
    top: 15px;
    position: absolute;
    width: 150px;
    left: 50%;
    text-align: center;
    transition: color 0.3s, opacity 0.3s;
    transform: translateX(-50%);
    color: $c-jade;
  }
}
@keyframes panel-progress-fade {
  0% {
    opacity: inherit;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.progress-enter-active,
.progress-leave-active {
  transition: all 0.4s;
}
.progress-enter,
.progress-leave-to {
  top: -100px;
  opacity: 0;
}
</style>
