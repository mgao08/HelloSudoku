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
   active: [0, 0],
   cell: null,
   
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

const serverURL = 'http://localhost:3000';

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
      fillGamePaneGrid("daily");

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
const loginWith = async () => {
   // Append login functions here
   const loginUsername = document.querySelector("#login-username").value;
   const loginPassword = document.querySelector("#login-password").value;

   const res = await fetch(`${serverURL}/users/signin`, {
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json',
         username: loginUsername,
         password: loginPassword
      }
   });
   const userInfo = await res.json();
   userInfo.username = loginUsername;
   userInfo.password = loginPassword;
   localStorage.setItem('userInfo', JSON.stringify(userInfo));
   const rememberme = document.querySelector("#rememberme");
   localStorage.setItem('rememberMe', rememberme.checked);
   toSection('dashboard');
}


const register = async () => {
   const registerUsername = document.querySelector("#register-username").value;
   const registerPassword = document.querySelector("#register-password").value;
   const registerPasswordRepeat = document.querySelector("#register-password-repeat").value;
   
   if (registerPassword !== registerPasswordRepeat) {
      // TODO: 
      console.log('passwords do not match');
      return;
   }

   const res = await fetch(`${serverURL}/users/signup`, {
      method: 'POST',
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         username: registerUsername,
         password: registerPassword
      })
   });
   const userInfo = await res.json();
   localStorage.setItem('userInfo', JSON.stringify(userInfo));

   toSection('dashboard');
}

// TODO: admin functions
const adminControl = async (cmd) => {
   switch (cmd) {
      case 'role':
         {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const target = JSON.parse(localStorage.getItem('target'));

            const res = await fetch(`${serverURL}/users/changeRole`, {
               method: 'POST',
               headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                  username: userInfo.username,
                  password: userInfo.password,
               },
               body: JSON.stringify({
                  target: target.username
               })
            });
            const response = await res.json();
            localStorage.setItem('target', JSON.stringify(response));
         }
         break;

      case 'export':
         alert('Export user data as json(or whatever) format');
         break;

      case 'delete':
         {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const target = JSON.parse(localStorage.getItem('target'));
            if (target) {
               const res = await fetch(`${serverURL}/users/delete`, {
                  method: 'DELETE',
                  headers: {
                     'Accept': 'application/json, text/plain, */*',
                     'Content-Type': 'application/json',
                     username: userInfo.username,
                     password: userInfo.password,
                  },
                  body: JSON.stringify({
                     target: target.username
                  })
               });;
               if (res.status === 200) {
                  alert('successfully deleted');
                  localStorage.removeItem('target');
               } else {
                  `could not delete the user ${target.username}`;
               }
            }
            else alert('No user to delete.');
         }
         break;

      default:;
   }
}

const searchUsername = document.querySelector("#searchUsername");
searchUsername.addEventListener('keydown', async event => {
   if (event.key === 'Enter') {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch(`${serverURL}/users/search/${searchUsername.value}`, {
         headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            username: userInfo.username,
            password: userInfo.password
         }
      });
      const searchResult = await res.json(); // TODO: show this search result in the result
      localStorage.setItem('target', JSON.stringify(searchResult));
   }
});

// Fill the select level grid
// TODO: connect game id with grid cells
const fillLevelsGrid = () => {
   const ROW_NUM = 5, COL_NUM = 5; /** 5x5 grid */
   let levelsGrid = document.querySelectorAll('.levelsGrid');
   levelsGrid.forEach(grid => {
      for (let r = ROW_NUM - 1; r >= 0; r--) {
         let row = document.createElement('div');
         row.classList.add('col-12', 'row', 'm-auto', 'p-0');

         for (let c = COL_NUM; c > 0; c--) {
            let levelNum = r * ROW_NUM + c;
            let col = document.createElement('div');
            col.classList.add('col', 'p-0');
            let lvlLink = document.createElement('a');
            lvlLink.innerHTML = `&nbsp;${levelNum}&nbsp;`;

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
               const puzzle_id = (difficulty - 1) * 25 + levelNum;
               setupGameboard(puzzle_id);
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
         const num = r * COL_NUM + c
         col.innerHTML = `<button class="btn">${num}</button>`;
         col.onclick = (evt) => {
            const row = currentGame.active[0];
            const col = currentGame.active[1];
            const cell = currentGame.cell;
            const cellContent = currentGame.puzzle[row][col];
            const solution = currentGame.solution[row][col];
            if (cellContent !== solution) {
               cell.innerHTML = num;
               console.log(cell.innerHTML)
               currentGame.puzzle[row][col] = num;
               if (currentGame.solution[row][col] === num) {
                  currentGame.cell.classList.add("correct");
                  currentGame.cell.classList.remove("incorrect");
               } else {
                  currentGame.cell.classList.add("incorrect");
               }
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
const fillGamePaneGrid = async puzzle_id => {
   let res;

   if (puzzle_id === "daily") {
      res = await fetch(`${serverURL}/sudoku/puzzleOfTheDay`);
   } else {
      res = await fetch(`${serverURL}/sudoku/${puzzle_id}`);
   }
   
   const response = await res.json();
   const puzzle = response.board;
   const solution = response.solution;
   const difficulty = response.difficulty;

   currentGame.id = puzzle_id;
   currentGame.puzzle = puzzle;
   currentGame.solution = solution;

   const ROW_NUM = 9, COL_NUM = 9;
   let dest = document.querySelector('#gamePaneGrid');
   dest.querySelectorAll(".gamePaneRow").forEach(e => e.remove());

   for (let r = 0; r < ROW_NUM; r++) {
      let row = document.createElement('div');
      row.classList.add('row', 'gamePaneRow');

      for (let c = 0; c < COL_NUM; c++) {
         let col = document.createElement('div');
         col.classList.add('col', 'px-0', 'gamePaneCol');
         col.innerHTML = `<button class='btn'>${puzzle[r][c] ? puzzle[r][c] : ""}</button>`;
         col.childNodes[0].onclick = (evt) => {
            setVisualActive(r, c);
            evt.target.classList.add("active");
            currentGame.active = [r, c];
            currentGame.cell = col.childNodes[0];
         }
         row.append(col);
      }
      dest.append(row);
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
const setupGameboard = puzzle_id => {
   
   toSection('gamePane');
   let startBtn = document.querySelector('#startGame');
   startBtn.style.cssText = 'opacity: 1';
   fillGamePaneGrid(puzzle_id);
}

// Guest Login
// TODO: setup guest authentication conditions
const guestLogin = () => {
   setupGameboard(); // TODO: replace with daily sudoku id/token

   // TODO: disable all section links for guest access
   // TODO: once the game has won, any further operation bring them to entry section
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
      register();
   };

   let loginBtn = document.querySelector('#loginBtn');
   loginBtn.onclick = (evt) => {
      evt.preventDefault();
      loginWith();
   };

   const logoutBtn = document.querySelector("#logout");
   logoutBtn.onclick = (evt) => {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('target');
      localStorage.removeItem('rememberMe');
      toSection('entry');
   }

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

   // Continue as guest event listener
   let guestLoginBtn = document.querySelector('#guestLogin');
   guestLoginBtn.onclick = () => { guestLogin() };
};


window.onload = () => {
   setup();
   const rememberMe = localStorage.getItem('rememberMe');
   const userInfo = localStorage.getItem('userInfo');
   if (rememberMe) {
      if (userInfo) 
         toSection('daily'); // TODO: Change it back to dashboard after finishing with daily sudoku 
      else 
         toSection('entry');
   } else {
      toSection('entry');
   }
};

})();