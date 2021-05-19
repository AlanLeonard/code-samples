<template lang="pug">
  ThePage
    PageHeader(:introduction='portfolioLandingPage.introduction')


    LoadMoreData(
      ref='loadMore'
      :query='tileQuery'
      :filters='["status", "sector", "caseStudy", "company"]'
      :per-page='12'
      @updatedResults='tileObserver'
      v-slot='{ items: companies, totalPages, nextPage, prevPage, currentPage, currentFilters, setFilter, resetFilters, getToProp, setPage}'
    )
      div
        .portfolio_filters
          FilterBar
            .base_filter.base_filter-dropdown
              label.base_filter--label
                BaseTypoSubscript Sector
                ElSelect(
                  ref='sectorSelect'
                  v-model='currentFilters["sector"]'
                  placeholder="Showing All"
                  :disabled='currentFilters.company != undefined'
                  :popper-append-to-body='false'
                  @input='blurSelect("sectorSelect")'
                )
                  ElOption(
                    :value='undefined'
                  ) Showing All
                  ElOption(
                    v-for='sector in sectors'
                    :key='sector.id'
                    :value='sector.slug'
                    :label='sector.name'
                  )

            .base_filter.base_filter-dropdown
              label.base_filter--label
                BaseTypoSubscript Status
                ElSelect(
                  ref='statusSelect'
                  v-model='currentFilters["status"]'
                  placeholder="Showing All"
                  :disabled='currentFilters.company != undefined'
                  :popper-append-to-body='false'
                  @input='blurSelect("statusSelect")'
                )
                  ElOption(
                    :value='undefined'
                  ) Showing All
                  ElOption(
                    v-for='status in statuses'
                    :key='status.id'
                    :value='status.slug'
                    :label='status.name'
                  )
            .base_filter.base_filter-dropdown
              label.base_filter--label
                BaseTypoSubscript Company
                ElSelect(
                  ref='companySelect'
                  v-model='currentFilters["company"]'
                  placeholder="Showing All"
                  :popper-append-to-body='false'
                  @input='blurSelect("companySelect")'
                )
                  ElOption(
                    :value='undefined'
                  ) Showing All
                  ElOption(
                    v-for='company in companiesFilters'
                    :key='company.id'
                    :value='company.slug'
                    :label='company.name'
                  )

            .base_filter.base_filter-checkbox
              input(type='checkbox' v-model='currentFilters["caseStudy"]' id='case_study')
              label(for='case_study').base_filter--label
                BaseTypoText(variant='4') Case Study
            .reset_button
              BaseButton(no-styles @click.native='resetFilters(currentFilters)' style='display:inline-block')
                BaseTypoSubscript Reset Filters

        //- If we have tiles to display
        BaseContainer(v-if='companies && companies.length')
          .company_grid
            .company_item(ref='companyitem' v-for='(item, index) in companies')
              CompanyTile(aspect-ratio='404:311' :caseStudy='item.caseStudy' :companyName='item.name' :image='item.tileImage' :logo='item.logo' :logoWhite='item.logoWhite' :slug='item.slug' :statusDescription='item.statusDescription' :key='item.id')
        //- Empty results message
        .no_results(v-else)
          | No portfolio items found
        .load_more(ref='loaderTrigger' style='text-align: center')
          BaseLink(v-if='nextPage' replace :to='getToProp({ page: nextPage })') Load More
    //- Router renders modal here within this HOC
    portal(to='modal' v-if='mounted')
      nuxt-child(:key="$route.params.slug")
    nuxt-child(:key="$route.params.slug" v-else)
</template>

<script>
import pageQuery from '~/gql/pages/portfolio/index'
import tileQuery from '~/gql/pages/portfolio/indexTiles'

import FilterBar from '~/components/FilterBar'
import PageHeader from '~/components/PageHeader'
import CompanyTile from '~/components/CompanyTile'
import LoadMoreData from '~/components/helpers/LoadMoreData'

import ElSelect from 'element-ui/lib/select'
import ElOption from 'element-ui/lib/option'

export default {
  components: {
    FilterBar,
    PageHeader,
    CompanyTile,
    LoadMoreData,
    ElSelect,
    ElOption
  },
  head() {
    return this.$setHead({
      title: this.portfolioLandingPage.derivedSeoTitle,
      description: this.portfolioLandingPage.derivedSeoDescription,
      ogTitle: this.portfolioLandingPage.derivedSocialMediaTitle,
      ogDescription: this.portfolioLandingPage.derivedSocialMediaDescription,
      ogFaeImage: this.portfolioLandingPage.derivedSocialMediaImage
    })
  },
  mounted() {
    this.mounted = true;
    this.tileObserver();
    this.loadMoreObserver();
  },
  watch: {
    // Watch for any changes to the query parameters
    '$route.query.company': async function(newParams, oldParams) {
      if (this.$route.query.company != undefined) {
        this.$route.query.sector = undefined
        this.$route.query.status = undefined
        this.$route.query.caseStudy = undefined
      }
    }
  },
  async asyncData({ app, params, query, error }) {
    const apolloQuery = app.apolloProvider.defaultClient.query
    const baseData = await loadBaseData(apolloQuery, params, query, error)
    return { ...baseData }
  },
  data() {
    return {
      mounted: false,
      loading: true,
      portfolioLandingPage: {},
      sectors: [],
      statuses: [],
      companiesFilters: [],
      tileQuery
    }
  },
  methods: {
    blurSelect(item) {
      setTimeout(() => {
        this.$refs[item].blur()
      }, 20)
    },
    loadMoreObserver() {
      if(this.$refs.loaderTrigger) {
        let options= {
          threshold: [0, 1]
        }
        let callback = (entries, observer) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              if(this.$refs.loadMore.paginatedItems.nextPage) {
                this.$refs.loadMore.setPage(this.$refs.loadMore.paginatedItems.nextPage )
              }
            }
          })
        }
        this.observer = new IntersectionObserver(callback, options);
        this.observer.observe(this.$refs.loaderTrigger)
      }
    },
    tileObserver() {
      if(this.$refs.companyitem) {
        this.loading = false;
        this.target= this.$refs.companyitem
        let options = {
          threshold: [0, 0.25, 1.0]
        }
        let callback = (entries, observer) => {
          entries.forEach((entry, index) => {
            if(entry.intersectionRatio >= 0.25) {
              entry.target.classList.add('company_item--showing')
              entry.target.style.setProperty('--index', index)
              setTimeout(() => {
                entry.target.removeAttribute('style')
                entry.target.classList.add('company_item--shown')
                this.observer.unobserve(entry.target)
              }, 1000)
            }
          })
        }

        this.observer = new IntersectionObserver(callback, options);
        this.target.forEach(element => {
          this.observer.observe(element)
        })
      }
    }
  }
}

async function loadBaseData(apolloQuery, routeParams, query, errorFunc) {
  let gqlQuery = await apolloQuery({
    query: pageQuery
  })
  return {
    portfolioLandingPage: gqlQuery.data.portfolioLandingPage,
    sectors: gqlQuery.data.sectors,
    statuses: gqlQuery.data.statuses,
    companiesFilters: gqlQuery.data.companiesFilters,
    companiesPage: gqlQuery.data.companiesPage
  }
}
</script>

<style lang="scss" scoped>
.reset_button {
  @include media('<md') {
    width: 100%;
  }
  grid-column: 4 / 5;
  text-align: right;
  color: $c-light-grey;
  @include media-grid('<=filter-lg') {
    grid-column: 2 / 3;
  }
}
::v-deep .base_tile-fixed_aspect .base_image img {
  object-fit: contain;
}

.portfolio_filters ::v-deep .filter_bar--inner {
  width: susy-span(10 of 12);
  margin: 0 auto;
  @include media-grid('>=md', $susy-24) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: susy-span(22 of 24);
    column-gap: susy-gutter(1 of 24);
    row-gap: 0
  }
  @include media-grid('>=filter-lg', $susy-24) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(20 of 24);
  }
}
_:-ms-fullscreen,
:root .portfolio_filters ::v-deep .filter_bar--inner {
  display: flex;
  justify-content: space-around;
}
_:-ms-fullscreen,
:root .base_filter-dropdown {
  flex-basis: susy-span(5 of 10);
  max-width: susy-span(5 of 10);
  @include media-grid('>=md', $susy-24) {
    flex-basis: susy-span(11 of 22);
    max-width: susy-span(11 of 22);
  }
  @include media-grid('>=lg', $susy-24) {
    flex-basis: susy-span(7 of 22);
    max-width: susy-span(7 of 22);
  }
}
_:-ms-fullscreen,
:root .base_filter-checkbox {
  @include media-grid('>=lg', $susy-24) {
    flex-basis: susy-span(7 of 22);
    max-width: susy-span(7 of 22);
  }
}
.company_grid {
  margin: 0 auto;
  @include v-spacing($size: xl, $type: padding, $pos: bottom);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: susy-gutter(1 of 12);
  row-gap: susy-gutter(1 of 12);
  width: susy-span(10 of 12);
  @include media-grid('>=md', $susy-24) {
    width: susy-span(22 of 24);
    column-gap: susy-gutter(1 of 24);
    row-gap: susy-gutter(1 of 24);
  }
  @include media-grid('>=lg', $susy-24) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @include media-grid('>=wide', $susy-24) {
    width: susy-span(20 of 24);
  }
  .company_item {
    width: 100%;
    opacity: 0;
    &--shown {
      opacity: 1;
      animation: none;
    }
    &--showing {
      animation: slide-in 0.5s;
      animation-fill-mode: forwards;
      animation-delay: calc(0.15s * var(--index))
    }
  }
}
_:-ms-fullscreen,
:root .company_grid {
  display: flex;
  flex-wrap: wrap;
  @include media('<lg') {
    justify-content: space-between;
  }

}
_:-ms-fullscreen,
:root .company_item {
  flex-basis: susy-span(5 of 10);
  max-width: susy-span(5 of 10);
  flex-shrink: 0;
  margin-bottom: susy-gutter(1 of 10);
  @include media-grid('>=md', $susy-24) {
    flex-basis: susy-span(11 of 22);
    max-width: susy-span(11 of 22);
    margin-bottom: susy-gutter(1 of 22);
  }
  @include media-grid('>=lg', $susy-24) {
    flex-basis: susy-span(7 of 22);
    max-width: susy-span(7 of 22);
    margin-right: susy-gutter(1 of 22);
    margin-bottom: 20px;
    &:nth-of-type(3n) {
      margin-right: 0;
    }
  }
  @include media-grid('>=wide', $susy-24) {
    margin-right: 10px;
    margin-bottom: 10px;
    flex-basis: susy-span(6.66 of 20);
    max-width: susy-span(6.66 of 20);
    &:nth-of-type(3n) {
      margin-right: 0;
    }
  }
}
.base_filter {
  display: flex;
  align-items: center;
}
.base_filter--label {
  width: 100%;
}
.base_filter-checkbox {
  position: relative;
  width: 100%;
  border-bottom: 1px solid $c-light-grey;
  .typo_text.typo_text-variant_4 {
    font-size: 16px;
  }
  &:hover {
    color: $c-gold;
    border-bottom-color: $c-gold;
    .base_filter--label:after {
      border-color: $c-gold;
    }
  }
  &:focus-within {
    border-bottom-color: $c-gold;
  }
  
  input[type='checkbox'] {
    opacity: 0;
    position: absolute;
    right: 100vw;
  }
  .base_filter--label {
    @include media('<lg') {
      padding-top: 20px;
    }
    @include media('>=lg') {
      padding-top: 15px;
    }
    cursor: pointer;
    &:after {
      position: absolute;
      right: 0;
      bottom: -1px;
      content: '';
      display: block;
      width: 48px;
      height: 48px;
      border: 1px solid $c-light-grey;
      color: $c-grey;
      background-image: url('~assets/images/flag-icon-grey.png');
      background-repeat: no-repeat;
      background-size: 45%;
      transition: background 0.3s;
      background-position: 50% 50%;
    }
  }
  input[type='checkbox']:checked + .base_filter--label:after {
    border-color: $c-gold;
    background-color: $c-grey;
    background-image: url('~assets/images/flag-icon-white.png');
    color: $c-white;
  }
  input[type='checkbox']:focus + .base_filter--label {
    color: $c-gold;
    &:after {
      border-color: $c-gold;
    }
  }
}
.no_results {
  margin: auto;
  @include v-spacing($size: lg, $type: padding, $pos: top);
  @include v-spacing($size: xl, $type: padding, $pos: bottom);
  text-align: center;
  .t--center {
    display: inline-block;
  }
  .t--center:after {
    @include t-text-4;
    overflow: hidden;
    position: absolute;
    display: inline-block;
    vertical-align: bottom;
    animation: ellipsis steps(4,end) 900ms infinite;
    content: "\2026"; /* ascii code for the ellipsis character */
    width: 0px;
  }
}
.load_more {
  text-align: center;
  ::v-deep .base_link--wrap {
    @include v-spacing($size: lg, $type: margin, $pos: bottom);
  }

}
@keyframes ellipsis {
  to {
    width: 1em;
  }
}


</style>
