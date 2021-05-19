<template lang="pug">
  .modal--container(ref='modal')
    transition(name='modal' :duration='{enter: 1000 , leave: 1000}')
      BaseContainer.modal(v-show='showModal')
        .modal--overlay(@click='dismissModal')
        .modal--wrapper
          .modal--inner(v-scroll-lock='showModal')
            BaseButton(noStyles @click.native='dismissModal').modal--close_button
              InlineLocalSvg(src='~/assets/svgs/close-icon.svg')
              span.screen-reader-only Close Dialog
            .modal--content
              slot
            BaseButton(@click.native='backNavigate' no-styles v-if='$store.state.showBackButton').previous_link
              InlineLocalSvg(src='~/assets/svgs/slideshow-icon.svg')
              span.return_link--text Back 
                span.u--lgup to Previous
            BaseButton(@click.native='dismissModal' no-styles).return_link
              span.return_link--text View {{ destination }}
              InlineLocalSvg(src='~/assets/svgs/slideshow-icon.svg')
</template>

<script>
export default {
  data() {
    return {
      showModal: false
    }
  },
  props: {
    destination: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.showModal = true
      document.querySelector('body').classList.add('modal--visible')
    })
  },
  beforeDestroy() {
    this.showModal = false
    document.querySelector('body').classList.remove('modal--visible')
  },
  methods: {
    backNavigate(e) {
      e.preventDefault()
      this.$router.go(-1)
    },
    dismissModal() {
      this.showModal = false
      setTimeout(() => {
        // if the route is the root level slug, we know it's a media item
        if(this.$route.matched[0].path == '/:slug') {
          this.$router.push('/media')
        } else {
          this.$router.push(this.$route.matched[0].path)
        }
      }, 500)
      if (this.$store.state.showBackButton == false) {
        this.$store.commit('setShowBackButton', true)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  width: 100%;
  z-index: 120;
}
.modal--close_button {
  height: 27px;
  width: 27px;
  color: $c-grey;
  float: right;
  z-index: 5;
  margin-right: 40px;
  margin-top: 40px;
  svg {
    width: 100%;
    height: 100%;
  }
}
.modal--overlay {
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  width: 100vw;
  background: rgba(0, 0, 0, 0.6);
}
.modal--wrapper {
  position: absolute;
  top: 0;
  height: 100%;
  left: 0;
  background: $c-white;
  // Below is for debugging modals to see grid lines
  // background: rgba($c-white, 0.75);
  width: susy-span(12 of 12);
  @include media('<md') {
    max-width: 450px;
  }
  @include media-grid('>=md', $susy-24) {
    width: susy-span(20 of 24);
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(19 of 24);
  }
}
.modal--inner {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  // scrollbar-width: none;
  // &::-webkit-scrollbar {
  //   display: none;
  // }
}
.modal--content {
  padding-top: 100px;
  padding-left: susy-span(2 of 12);
  padding-right: susy-span(2 of 12);
  @include v-spacing($size: xl, $type: margin, $pos: bottom);
  @include media-grid('>=md', $susy-24) {
    padding-left: susy-span(2 of 20);
    padding-right: susy-span(2 of 20);
  }
  @include media-grid('>=wide', $susy-24) {
    padding-left: susy-span(2 wide of 19);
    padding-right: susy-span(1 wide of 19);
  }
}

.modal-enter-active {
  transition: opacity 0.5s;
  .modal--wrapper {
    transition: margin-left 0.5s;
    transition-delay: 0.25s;
  }
}
.modal-leave-active {
  transition: opacity 0.5s;
  transition-delay: 0.25s;
  .modal--wrapper {
    transition: margin-left 0.5s;
  }
}

.modal-enter,
.modal-leave-to {
  opacity: 0;
  .modal--wrapper {
    margin-left: -100vw;
  }
}
.modal-enter-to,
.modal-leave {
  opacity: 1;
  .modal--wrapper {
    margin-left: 0vw;
  }
}

.previous_link, .return_link {
  display: block;
  @include v-spacing($size: lg, $type: margin, $pos: bottom);
  svg {
    @include media('<md') {
      height: 31px;
      width: 68px;
    }
    height: 61px;
    width: 128px;
  }
  .return_link--text {
    @include underline-styles;
  }
}
.previous_link {
  float: left;
  
}
 .return_link {
   float: right;
   svg {
     transform: rotate(180deg);
   }
 }

</style>
