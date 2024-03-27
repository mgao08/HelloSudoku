// IIFE
(() => {





window.onload = () => {
   // TODO: remove the display none before committing
   let sections = document.querySelectorAll('section');
   sections.forEach(section => {
      section.setAttribute('style', 'display: none !important');
         /** Used setAttribute cuz need to overwrite important */
   });

   let login  = document.getElementById("login");
   login.setAttribute('style', 'display: flex !important');
};

})();