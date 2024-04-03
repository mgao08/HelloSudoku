// IIFE
(() => {

// Global vars
let currentGame = {
   id: null,
   puzzle: null,  /** 9x9 2D arr */
   solution: null,   /** 9x9 2D arr */
   time: 0,    /** hh:mm:ss format */
   score: 0,
   blanks: 0,  /** number of blanks in the puzzle */
   moves: 0,   /** number of moves user took */
   gameStatus: 'none',   /** 'ongoing' || 'paused' || 'none' */
   
   reset: function() {
      this.id = null;
      this.puzzle = null;
      this.solution = null;
      this.time = null;
      this.score = null;
      this.gameStatus = 'none';

      let pauseMask = document.querySelector('#paused');
      pauseMask.classList.remove('show');
      let startBtn = document.querySelector('#startGame');
      startBtn.style.cssText = 'opacity: 1; display: inline-block;';
   },

   start: function() {
      let startBtn = document.querySelector('#startGame');
      startBtn.style.cssText = 'opacity: 0;';
      setTimeout(() => {
         startBtn.style.cssText = 'display: none;';
      }, 2e2);

      // TODO: Start timer & score calculation

      this.gameStatus = 'ongoing';
   },

   pause: function() {
      if (this.gameStatus == 'ongoing') {
         let pauseMask = document.querySelector('#paused');
         pauseMask.classList.add('show');
         this.gameStatus = 'paused';
      }
   },

   checkWin: function() {
      if (this.moves >= this.blanks) {
         for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
               if (this.puzzle[r][c] != this.solution[r][c]) {
                  return false;
               }

               // TODO: handle win conditions (score calculation, user data update, currentGame status update, pass time & score into won mask)
               

               // display won messages
               document.querySelector('#won').classList.add("show");
            }
         }

      } else {
         return false;
      }
   }
};


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
   if (dest.includes("dashboard")) {
      dest = "dashboard";  /** corresponding id */
      setActiveNavlink('dashboard');

   } else if (dest.includes("daily")) {
      dest = "gamePane";
      setActiveNavlink('daily');

   } else if (dest.includes("game")) {
      dest = "gamePane";
      setActiveNavlink('select');

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


// TODO: login function
const loginWith = (dummy) => {
   // Append login functions here


   toSection('dashboard');
}


// TODO: register function
const registerWith = (dummy) => {
   // Append login functions here


   loginWith('auto login with new username & password');
}

// TODO: admin functions
const adminControl = (cmd) => {
   switch (cmd) {
      case 'role':
         alert('Change role of users and update database');
         break;

      case 'export':
         alert('Export user data as json(or whatever) format');
         break;

      case 'delete':
         alert('Delete user from database & logout');
         break;

      default:;
   }
}

// Fill the select level grid
// TODO: connect game id with grid cells
const fillLevelsGrid = () => {
   const ROW_NUM = 5, COL_NUM = 5; /** 5x5 grid */
   let levelsGrid = document.querySelectorAll('.levelsGrid');
   levelsGrid.forEach(grid => {
      for (let r = ROW_NUM; r >= 0; r--) {
         let row = document.createElement('div');
         row.classList.add('col-12', 'row', 'm-auto', 'p-0');

         for (let c = COL_NUM; c > 0; c--) {
            let levelNum = r * ROW_NUM + c;
            let col = document.createElement('div');
            col.classList.add('col', 'p-0');
            let lvlLink = document.createElement('a');
            lvlLink.innerHTML = `&nbsp;${levelNum}&nbsp;`;
            // TODO: connect each lvlLink with a game id from API

            // TODO: redirecting features goes here
            lvlLink.onclick = () => {
               let difficulty = grid.id.toLowerCase();
               if (difficulty.includes('easy')) {
                  difficulty = 1;
               } else if (difficulty.includes('medium')) {
                  difficulty = 2;
               } else if (difficulty.includes('hard')) {
                  difficulty = 3;
               }

               let loading = document.getElementById('settingUp');
               loading.setAttribute('style', 'display: flex !important;');
               setTimeout(() => {
                  loading.setAttribute('style', 'display: none !important;');
               }, 2e3);

               console.log(`Go To Level ${difficulty} - ${levelNum}`);
               setupGameboard();
            };

            col.append(lvlLink);
            row.prepend(col);
         }

         grid.prepend(row);
      }

   });
}

// Fill number 1-9 panel
const fillNumberPanel = () => {
   const ROW_NUM = 3, COL_NUM = 3;
   let dest = document.querySelector('#numberPanel');
   
   for (let r = 0; r < ROW_NUM; r++) {
      let row = document.createElement('div');
      row.classList.add('col-4', 'col-lg-12', 'p-0', 'd-flex', 'flex-row');

      for (let c = 1; c <= COL_NUM; c++) {
         let col = document.createElement('div');
         col.classList.add('col-4', 'p-0');
         col.innerHTML = `<button class="btn">${r * COL_NUM + c}</button>`;
         col.onclick = (evt) => {
            if (evt.target.classList.contains("active")) {
               evt.target.classList.remove("active");

            } else {
               let allNum = document.querySelectorAll('#numberPanel button');
               allNum.forEach(num => {
                  num.classList.remove("active");
               });
               evt.target.classList.toggle("active");
            }
         }
         
         row.append(col);
      }

      dest.append(row);
   }
};

// Handle the pen & pencil switch visual effect
const penSwitch = () => {
   let switches = document.querySelectorAll('#penSwitch button');
   switches.forEach(btn => {
      btn.onclick = (evt) => {
         switches.forEach(btn => {btn.classList.remove("active")});
         evt.target.classList.add("active");
         updateStepInfo(`Switched to${evt.target.innerText.toLowerCase()}.`);
      }
   });
}

// Fill game panel 9x9 grid
const fillGamePaneGrid = (gameId) => {
   const ROW_NUM = 9, COL_NUM = 9;
   let dest = document.querySelector('#gamePaneGrid');

   // If there is already a grid
   if (dest.childNodes.length >= ROW_NUM) {
      for (let r = 0; r < ROW_NUM; r++) {
         let row = dest.childNodes[r+3];  // first 3 children are start game button elements

         for (let c = 0; c < COL_NUM; c++) {
            let col = row.childNodes[c];
            col.innerHTML = `<button class='btn'>${9-c}</button>`;   // TODO: replace with API data
            col.childNodes[0].onclick = (evt) => {
               if (evt.target.classList.contains("active")) {
                  setVisualActive(-1, -1);   // clear all visual effects
                  evt.target.classList.remove("active");
               } else {
                  setVisualActive(r, c);
                  evt.target.classList.add("active");
               }
            }
         }
      }

   // If there is no existed grid
   } else {
      for (let r = 0; r < ROW_NUM; r++) {
         let row = document.createElement('div');
         row.classList.add('row', 'gamePaneRow');

         for (let c = 0; c < COL_NUM; c++) {
            let col = document.createElement('div');
            col.classList.add('col', 'px-0', 'gamePaneCol');
            col.innerHTML = `<button class='btn'>${c+1}</button>`;   // TODO: replace with API data
            col.childNodes[0].onclick = (evt) => {
               if (evt.target.classList.contains("active")) {
                  setVisualActive(-1, -1);   // clear all visual effects
                  evt.target.classList.remove("active");
               } else {
                  setVisualActive(r, c);
                  evt.target.classList.add("active");
               }
            }
            row.append(col);
         }
         dest.append(row);
      }
   }
}

// Set visual effects for selected grid cell & row/column
const setVisualActive = (rowNum, colNum) => {
   let allCol = document.querySelectorAll('.gamePaneCol');
   let counter = 0;
   allCol.forEach(Col => {
      Col.childNodes[0].classList.remove("active", "subActive");

      let crntCol = counter % 9, crntRow = Math.floor(counter / 9);
      let crntBlockCol = Math.floor(crntCol / 3), crntBlockRow = Math.floor(crntRow / 3);

      if ((crntCol == colNum) || (crntRow == rowNum) ||
         ((crntBlockCol == Math.floor(colNum / 3)) && (crntBlockRow == Math.floor(rowNum / 3)))) {
         Col.childNodes[0].classList.add("subActive");
      }
      counter++;
   });
};

// Update the game pane card footer (info section)
const updateStepInfo = (text) => {
   let info = document.querySelector("#stepInfo");
   info.innerText = text;
}

// Setup Game Board
const setupGameboard = (gameId) => {
   
   toSection('gamePane');
   let startBtn = document.querySelector('#startGame');
   startBtn.style.cssText = 'opacity: 1';
   fillGamePaneGrid(gameId);
}

// collection of setup statements that needs to be run onload
const setup = () => {
   // setup event listeners for links for section switch
   let sectionLinks = document.querySelectorAll('.sectionLink');
   sectionLinks.forEach(link => {
      link.onclick = () => {
         if (currentGame.gameStatus != 'none') {
            currentGame.pause();
            link.setAttribute('data-bs-toggle', "modal");
            link.setAttribute('data-bs-target', "#confirmRedirect");
            link.click();

            let leaveBtn = document.querySelector('#leaveAnyways');
            leaveBtn.onclick = () => {
               currentGame.reset();
               toSection(link.innerText);
            }

            link.removeAttribute('data-bs-toggle');
            link.removeAttribute('data-bs-target');

         } else {
            toSection(link.innerText);
         }

      }
   });

   // pause game when navList in expanded under small screen size
   let navbarToggler = document.querySelector('.navbar-toggler');
   navbarToggler.onclick = () => {
      currentGame.pause();
   };

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
   };

   let loginBtn = document.querySelector('#loginBtn');
   loginBtn.onclick = (evt) => {
      evt.preventDefault();
      loginWith('dummy data');
   };

   // Toggle admin search result display & button transform
   let resultToggle = document.querySelector('#toggleResult');
   resultToggle.onclick = () => {
      let status = resultToggle.ariaExpanded;
      /** aria-expanded value is string, NOT boolean */
      if (status == "true") {
         resultToggle.style.cssText = 'background-color: var(--bs-white); color: var(--bs-success); margin-top: 0;';
         resultToggle.innerText = "Hide Result";

      } else if (status == "false") {
         resultToggle.style.cssText = 'background-color: var(--bs-success); color: var(--bs-white); margin-top: 20vh;';
         resultToggle.innerText = "Display Result";
      }
   }

   // Event Listeners for admin user control buttons
   let changeRole = document.getElementById('changeRole');
   changeRole.onclick = () => {adminControl('role')};
   let exportData = document.getElementById('exportData');
   exportData.onclick = () => {adminControl('export')};
   let deleteUser = document.getElementById('deleteUser');
   deleteUser.onclick = () => {adminControl('delete')};

   // Fill the select levels grids
   fillLevelsGrid();
   // Fill the number panel & pen switch game tool
   fillNumberPanel();
   penSwitch();

   // Event listeners for revert & hint
   // TODO: replace by actual features
   let revertLastStep = document.querySelector("#revertLastStep");
   revertLastStep.onclick = () => {alert("Revert Last Step")};
   let hint = document.querySelector("#hint");
   hint.onclick = () => {alert("Get a hint")};

   // Start Game button toggle itself
   let startGameBtn = document.querySelector('#startGame');
   startGameBtn.onclick = () => {currentGame.start();};

   // Winning condition buttons event listener
   let wonToDashboard = document.querySelector('#wonToDashboard');
   wonToDashboard.onclick = () => {
      // TODO: append user data update functions here
      document.querySelector('#won').classList.remove("show");
      toSection('dashboard');
   };
   let wonToSelect = document.querySelector('#wonToSelect');
   wonToSelect.onclick = () => {
      // TODO: append user data update functions here
      document.querySelector('#won').classList.remove("show");
      toSection('selectLevel');
   }
};


window.onload = () => {

   setup();
   toSection('entry');
};

})();