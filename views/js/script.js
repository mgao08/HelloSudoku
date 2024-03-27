// IIFE
(() => {

// general use modal toggler

// collection of setup statements that needs to be run onload
const setup = () => {
   // prevent form button from submitting onclick
   let modalTrigger = document.querySelector('#registerBtn');
   modalTrigger.onclick = (evt) => {
      evt.preventDefault();
   };
   let registerBtn = document.querySelector('#continueRegister');
   registerBtn.onclick = () => {
      console.log("Continue with register process");
   }
}


window.onload = () => {
   // TODO: remove the display none before committing
   let sections = document.querySelectorAll('section');
   sections.forEach(section => {
      section.setAttribute('style', 'display: none !important');
         /** Used setAttribute cuz need to overwrite important */
   });

   let login = document.getElementById("login");
   // login.setAttribute('style', 'display: flex !important');
   let register = document.getElementById("register");
   register.setAttribute('style', 'display: flex !important');

   setup();
};

})();