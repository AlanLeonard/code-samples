class Table {
  toggleOverlay() {
    document.querySelector('body').classList.toggle('body-overlay');
  }

  ready() {
    const self = this;
    Array.prototype.forEach.call(document.querySelectorAll('.data_jump'), function(element, e) {
      element.addEventListener('click', function(e){
        e.preventDefault();
        const clonedNode = element.nextElementSibling.cloneNode(true);
        clonedNode.classList.toggle('strategy_detail--selected');
        self.toggleOverlay();
        document.querySelector('body').appendChild(clonedNode);
        document.querySelector('.strategy_detail--selected .tray_return').addEventListener('click', function(e){
          e.preventDefault();
          self.toggleOverlay();
          document.querySelector('.strategy_detail--selected').parentNode.removeChild(document.querySelector('.strategy_detail--selected'))
        });
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-mobile-tray]'), function(element, e) {
      element.addEventListener('click', function(e){
        e.stopPropagation();
        if(window.innerWidth <= 1075) {
          self.toggleOverlay();
          const clonedNode = element.cloneNode(true);
          clonedNode.classList.toggle('funds_info--shown');
          document.querySelector('body').appendChild(clonedNode);
          document.querySelector('.funds_info--shown .tray_return').addEventListener('click', function(e){
            e.preventDefault();
            self.toggleOverlay();
            document.querySelector('.funds_info--shown').parentNode.removeChild(document.querySelector('.funds_info--shown'))
          });
        }
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-has-footnotes=true]'), function(element, e) {
      element.addEventListener('click', function(e){
        e.preventDefault();
        if(this.matches('tr')) {
          this.querySelector('.data_table-data--footnote_indicator').classList.toggle('data_table-data--footnote_indicator-shown')
          this.nextElementSibling.querySelector('.data_table-footnotes').classList.toggle('data_table-footnotes--shown');
        }
        else {
          self.toggleOverlay();
          const clonedNode = this.nextElementSibling.querySelector('.data_table-footnotes').cloneNode(true);
          clonedNode.classList.toggle('data_table-footnotes--shown');
          document.querySelector('body').appendChild(clonedNode);
          document.querySelector('.data_table-footnotes--shown .tray_return').addEventListener('click', function(e){
            e.preventDefault();
            self.toggleOverlay();
            document.querySelector('.data_table-footnotes--shown').parentNode.removeChild(document.querySelector('.data_table-footnotes--shown'))
          });
        }
      });
    });
  }
}

window.FINE.registerComponent(Table);