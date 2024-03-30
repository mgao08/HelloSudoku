// IIFE
(() => {

// setup active nav link visual effects
const setActiveNavlink = (name) => {
   let navlinks = document.querySelectorAll('.nav-link');
   navlinks.forEach(link => {
      link.innerText.toLowerCase().includes(name) ?
         link.parentNode.classList.add('active') : link.parentNode.classList.remove('active');
   });
};

// switch section function
const toSection = (text) => {
   let sections = document.querySelectorAll('section');
   sections.forEach(section => {
      section.setAttribute('style', 'display: none !important');
         /** Used setAttribute cuz need to overwrite important */
   });

   let dest = text.toLowerCase();
   console.log(dest);
   if (dest.includes("dashboard")) {
      dest = "dashboard";  /** corresponding id */
      setActiveNavlink('dashboard');

   } else if (dest.includes("daily")) {
      dest = "gamePane";
      setActiveNavlink('daily');

   } else if (dest.includes("select")) {
      dest = "selectLevel";
      setActiveNavlink('select');

   } else if (dest.includes("register")) {
      dest = "register";

   } else if (dest.includes("admin")) {
      dest = "admin";
      setActiveNavlink('admin');

   } else if (dest.includes("entry") || dest.includes("log out")) {
      dest = "entry";

   } else {
      dest = "login";
   }

   // hide nav menu if under vw 1200px
   if (window.innerWidth < 1200) {
      document.getElementById('navList').classList.remove("show");
   }
   document.getElementById(dest).setAttribute('style', 'display: flex !important');
};


// login function
const loginWith = (dummy) => {
   // Append login functions here


   toSection('dashboard');
}


// register function
const registerWith = (dummy) => {
   // Append login functions here


   loginWith('auto login with new username & password');
}


// collection of setup statements that needs to be run onload
const setup = () => {
   // setup event listeners for links for section switch
   let sectionLinks = document.querySelectorAll('.sectionLink');
   sectionLinks.forEach(link => {
      link.onclick = () => {
         toSection(link.innerText);
      }
   });

   // prevent form button from submitting onclick
   let modalTrigger = document.querySelector('#registerBtn');
   modalTrigger.onclick = (evt) => {
      evt.preventDefault();
   };

   // login & register event handlers
   let registerBtn = document.querySelector('#continueRegister');
   registerBtn.onclick = (evt) => {
      evt.preventDefault();
      registerWith('dummy data');
   }

   let loginBtn = document.querySelector('#loginBtn');
   loginBtn.onclick = (evt) => {
      evt.preventDefault();
      loginWith('dummy data');
   };
};


window.onload = () => {

   setup();
   toSection('entry');
};

})();