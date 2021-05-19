class ContactForm {
  constructor() {
    if (document.querySelector("body.contact")) {
      this.init();
    }
  }
  toggleConditionalDetails(state) {
    let conditionalDetailsContainer = document.querySelector(
      ".conditional_information"
    );
    if (state == true) {
      conditionalDetailsContainer.classList.add("is-shown");
    } else {
      conditionalDetailsContainer.classList.remove("is-shown");
    }
  }

  removeDomNode(target) {
    target.parentElement.removeChild(target);
  }

  validationError(input, form) {
    input.classList.add('js-validation-error');
    form.classList.add('js-validation-error');
    form.querySelector('button').setAttribute('disabled', true);
  }

  clearValidationError(input, form) {
    input.classList.remove('js-validation-error');
    if (!form.querySelector('js-validation-error')) {
      form.classList.remove('js-validation-error');
      form.querySelector('button').removeAttribute('disabled');

    }
  }
  validateFields(field, form) {
    if (field.getAttribute('type') == "email") {
      if(!this.validateEmail(field.value)) {
        this.validationError(field, form)
      }
      else{
        this.clearValidationError(field, form)
      }
    }
    if (field.getAttribute('type') == "tel") {
      if(!this.validatePhone(field.value)) {
        this.validationError(field, form)
      }
      else{
        this.clearValidationError(field, form)
      }
    }
  }

  validateEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validatePhone(phoneNumber) {
    let re = /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/;
    if(phoneNumber == '') {
      return true
    }
    return re.test(phoneNumber);
  }

  phoneFormatter() {
    document.querySelector('input[type=tel]').addEventListener( 'keyup', (e) => {
      let ph = e.currentTarget.value.replace(/\D/g,'').substring(0,10);
      let deleteKey = (e.keyCode == 8 || e.keyCode == 46); // Backspace and Delete keys
      let len = ph.length;

      if (len==0) {
        ph=ph;
      } else if (len<3) {
        ph='('+ph;
      } else if (len==3) {
        ph = '('+ph + (deleteKey ? '' : ') ');
      } else if (len<6) {
        ph='('+ph.substring(0,3)+') '+ph.substring(3,6);
      } else if (len==6) {
        ph='('+ph.substring(0,3)+') '+ph.substring(3,6)+ (deleteKey ? '' : '-');
      } else {
        ph='('+ph.substring(0,3)+') '+ph.substring(3,6)+'-'+ph.substring(6,10);
      }

      e.currentTarget.value = ph;
    });
  }

  init() {
    if (document.querySelector(".modal")) {
      document.querySelector(".modal button").addEventListener("click", () => {
        this.removeDomNode(document.querySelector(".modal"));
      });
    }
    if (document.querySelector('input[type=tel]')){
      this.phoneFormatter();
    }
    const _this = this;
    this.toggleConditionalDetails(
      document.querySelector("#request_strategy_documents").checked
    );
    document
      .querySelector("#request_strategy_documents")
      .addEventListener("click", () => {
        this.toggleConditionalDetails(
          document.querySelector("#request_strategy_documents").checked
        );
      });
    Array.prototype.forEach.call(document.querySelectorAll('form'), (element) => {
      const _this = this;
      Array.prototype.forEach.call(element.querySelectorAll('input'), function(element){
        element.addEventListener('keyup', function(){
          _this.validateFields(element, this.closest('form'))
        })
      })
    });

  }
}
window.FINE.registerComponent(ContactForm);
