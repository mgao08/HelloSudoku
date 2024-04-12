(() => {

const serverURL = 'http://localhost:3000';

// Global vars
let currentGame = {
   id: null,
   puzzle: null,  /** 9x9 2D arr */
   solution: null,   /** 9x9 2D arr */
   cells: [],
   score: 0,
   blanks: -1,  /** number of blanks in the puzzle */
   moves: [],   /** user move history */
   gameStatus: 'none',   /** 'ongoing' || 'paused' || 'none' */
   active: [0, 0],
   timerInterval: null,
   startTime: null,
   
   reset: function() {
      this.id = null;
      this.puzzle = null;
      this.solution = null;
      this.cells = [];
      this.score = 0;
      this.blanks = -1;
      this.moves = [];
      this.gameStatus = 'none';
      active = [0, 0];
      clearInterval(this.timerInterval);
      timerInterval = null;
      startTime = null;
      const scores = document.querySelectorAll('.score');
      scores.forEach(x => x.innerHTML = currentGame.score);
      const times = document.querySelectorAll('.time');
      times.forEach(x => x.innerHTML = "00:00:00");

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
      const startTime = Date.now();
      currentGame.startTime = startTime;
      const updateTime = () => {
         const timer = document.querySelectorAll(".time");
         const totalSeconds = Math.round((Date.now() - startTime)/1000);
         const time = processTimeFormat(totalSeconds)
         timer.forEach(x => x.innerHTML = time);
      }   
      const interval = setInterval(updateTime, 500);
      currentGame.timerInterval = interval;

      this.gameStatus = 'ongoing';
   },

   pause: function() {
      if (this.gameStatus == 'ongoing') {
         let pauseMask = document.querySelector('#paused');
         pauseMask.classList.add('show');
         this.gameStatus = 'paused';
      }
   },

   checkWin: async function() {
      // TODO: user data update, currentGame status update
      // display won messages
      if (this.blanks === 0) {
         document.querySelector('#won').classList.add("show");
         clearInterval(currentGame.timerInterval);
         currentGame.timerInterval = null;
         const playtime = Math.round((Date.now() - currentGame.startTime) / 1000);
         const userInfo = JSON.parse(localStorage.getItem('userInfo'));

         if (userInfo.role === 'member' || userInfo.role === 'admin') {
            const record = {
               username: userInfo.username,
               score: currentGame.score,
               playtime,
               timestamp: new Date(),
            }
   
            const res = await fetch(`${serverURL}/sudoku/record`, {
               method: 'POST',
               headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                  username: userInfo.username,
                  password: userInfo.password,
               },
               body: JSON.stringify({
                  record,
               }),
            });
            const response = await res.json();
   
            if (response.acknowledged) {
               displayUserStatistics();
            }
         }
      }
   },

   undo: function() {
      if (this.moves.length) {
         const lastMove = this.moves.pop();
         const { row, col, before, after, blanksBefore, correct } = lastMove;
         const cell = this.cells[row][col];
         currentGame.blanks = blanksBefore;
         currentGame.puzzle[row][col] = before;
         cell.innerHTML = before;
         cell.classList.remove('incorrect');
         cell.classList.remove('correct');
         if (correct === true) {
            cell.classList.add('correct');
         } else if (correct === false) {
            cell.classList.add('incorrect');
         }
         cell.click();
      }
   },

   hint: function() {
      let row;
      let col;

      for (let r = 0; r < 9; r++) {
         for (let c = 0; c < 9; c++) {
            if (this.puzzle[r][c] !== this.solution[r][c]) {
               col = c;
               row = r;
               break
            }
         }

         if (col !== undefined) break;
      }

      const cell = this.cells[row][col];
      const solution = this.solution[row][col];
      cell.classList.add("correct");
      cell.classList.remove("incorrect");
      this.blanks--;
      cell.innerHTML = solution;
      this.puzzle[row][col] = solution;
      cell.click();
      this.checkWin();
   }
};

// Convert time in seconds to be HH:MM:SS format
const processTimeFormat = (totalSeconds) => {
   const hours = Math.floor(totalSeconds/3600).toString().padStart(2,'0');
   const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2,'0');
   const seconds = (totalSeconds % 60).toString().padStart(2,'0');
   return `${hours}:${minutes}:${seconds}`;
}

// Convert JS date object into Month Date, Year format
const processDateFormat = (dateObj) => {
   let result = "";
   const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
   let monthStr = months[dateObj.getMonth()];
   result += monthStr + " ";

   let date = dateObj.getDate();
   result += date;

   switch (date) {
      case 1:
         result += "st";
         break;
      case 2:
         result += "nd";
         break;
      case 3:
         result += "rd";
         break;
      default:
         result += "th";
         break;
   }
   result += ", ";
   result += dateObj.getFullYear();

   return result;
}

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


const login = async (loginUsername, loginPassword) => {

   const res = await fetch(`${serverURL}/users/signin`, {
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json',
         username: loginUsername,
         password: loginPassword
      }
   });

   if (res.statusText == "Unauthorized") {
      document.querySelector('#loginErr').innerText = "Username and password do not match";
      return;
   }

   const userInfo = await res.json();
   userInfo.username = loginUsername;
   userInfo.password = loginPassword;
   localStorage.setItem('userInfo', JSON.stringify(userInfo));
   const rememberme = document.querySelector("#rememberme");
   localStorage.setItem('rememberMe', rememberme.checked);

   toSection('dashboard');

   // Remove disabled attribute for sectionlinks if previous login was guest
   let sectionLinks = document.querySelectorAll('nav .sectionLink');
   sectionLinks.forEach(link => {
      link.classList.remove("disabled");
      link.style.display = 'block';
   });

   // Hide admin panel section link if not logged in as admin
   if (userInfo.role == "admin") {
      let toAdmin = document.querySelector('#toAdmin');
      toAdmin.style.display = 'block';
   } else {
      let toAdmin = document.querySelector('#toAdmin');
      toAdmin.style.display = 'none';
   }

   fillUserInfo(userInfo);
}

/**
 * 
 * @param userInfo the fetched user information from login function
 */
const fillUserInfo = async () => {
   const userInfo = JSON.parse(localStorage.getItem('userInfo'));
   const res = await fetch(`${serverURL}/sudoku/records/${userInfo.username}`, {
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json',
         username: userInfo.username,
         password: userInfo.password,
      }
   });

   const response = await res.json();
   const { totalPlaytime, highestScore, games, gamesLast7days } = processRecords(response);

   let usernameSpan = document.querySelectorAll('.username');
   usernameSpan.forEach(span => {
      span.innerText = userInfo.username;
   })

   document.querySelector('#registerDate').innerText = processDateFormat(new Date(userInfo.registrationDate));
   document.querySelector('#highestScore').innerText = highestScore;
   document.querySelector('#levelsPassed').innerText = games;
   document.querySelector('#levelsPastWeek').innerText = gamesLast7days;
   document.querySelector('#avgTime').innerText = processTimeFormat(totalPlaytime);
}

/**
 * 
 * Handle user registration features & input validation
 */
const register = async () => {
   const registerUsername = document.querySelector("#register-username").value;
   const registerPassword = document.querySelector("#register-password").value;
   const registerPasswordRepeat = document.querySelector("#register-password-repeat").value;
   
   let errMsg = document.querySelector('#registerErr');
   if (registerUsername == "") {
      errMsg.innerText = "Username is required";
      return;

   } else if (registerPassword == "") {
      errMsg.innerText = "Password is required";
      return;

   } else if (registerPassword !== registerPasswordRepeat) {
      errMsg.innerText = "The passwords do not match, please try again";
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

   login(registerUsername, registerPassword);
}

// Admin functions
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
         const target = JSON.parse(localStorage.getItem('target'));
         exportUserData(target, `${target.username}-hellosudoku.txt`, 'text/plain');
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

// Allow display result when pressing enter on the input field
const searchUsername = document.querySelector("#searchUsername");
searchUsername.addEventListener('keydown', async event => {
   if (event.key === 'Enter') {
      document.querySelector('#toggleResult').click();
   }
});

// Download user data as text file
const exportUserData = (data, filename, type) => {

   let file = new Blob([JSON.stringify(data)], {type: type});
   let a = document.createElement("a");
   url = URL.createObjectURL(file);

   a.href = url;
   a.download = filename;
   document.body.appendChild(a);
   a.click();

   document.body.removeChild(a);
   window.URL.revokeObjectURL(url);
}

// TODO: also record the last logged in time
const searchUser = async () => {
   const userInfo = JSON.parse(localStorage.getItem('userInfo'));
   const res = await fetch(`${serverURL}/users/search/${searchUsername.value}`, {
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json',
         username: userInfo.username,
         password: userInfo.password
      }
   });
   const searchResult = await res.json(); 
   localStorage.setItem('target', JSON.stringify(searchResult));

   const recordsRes = await fetch(`${serverURL}/sudoku/records/${searchResult.username}`, {
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json',
         username: userInfo.username,
         password: userInfo.password,
      }
   });

   const response = await recordsRes.json();
   const { totalPlaytime, highestScore, games, gamesLast7days } = processRecords(response);
   
   // TODO: check last logged in parameter name
   document.querySelector('#resultUsername').innerText = searchResult.username;
   document.querySelector('#resultRole').innerHTML = `Role: ${searchResult.role}<br>
                                                      Last logged in: ${searchResult.lastLoggedIn}`;
   document.querySelector('#resultOthers').innerHTML = `Registered since: ${processDateFormat(new Date(searchResult.registrationDate))}<br>
                                                         Highest score: ${highestScore}<br>
                                                         Levels passed: ${games}<br>
                                                         Levels passed past week: ${gamesLast7days}<br>
                                                         Total play time: ${processTimeFormat(totalPlaytime)}`;
}

const processRecords = records => {
   const games = records.length;
   let totalPlaytime = 0;
   let highestScore = 0;
   let gamesLast7days = 0;
   
   records.map(x => {
      totalPlaytime += x.playtime;
   
      if (x.score > highestScore) {
         highestScore = x.score;
      }
   
      const now = new Date();
      const recordTime = new Date(x.timestamp);
      const sevenDaysAgo = now.getTime() - (7*24*60*60*1000);
      if (recordTime < sevenDaysAgo) {
         gamesLast7days++;
      }
   });

   return {
      totalPlaytime,
      highestScore, 
      games,
      gamesLast7days,
   }
}

// Fill the select level grid
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
   let grid = document.querySelector('#numberPanel');
   
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
            const cell = currentGame.cells[row][col];
            const cellContent = currentGame.puzzle[row][col];
            const solution = currentGame.solution[row][col];
            if (cellContent !== solution) {
               cell.innerHTML = num;
               currentGame.puzzle[row][col] = num;
               const move = {
                  row,
                  col,
                  before: cellContent ? cellContent : "",
                  after: num,
                  blanksBefore: currentGame.blanks,
                  correct: cellContent ? cellContent === solution : null
               }
               if (currentGame.solution[row][col] === num) {
                  cell.classList.add("correct");
                  cell.classList.remove("incorrect");
                  currentGame.blanks--;
                  currentGame.score++;
                  const scores = document.querySelectorAll('.score');
                  scores.forEach(x => x.innerHTML = currentGame.score);
               } else {
                  currentGame.cells[row][col].classList.add("incorrect");
               }
               currentGame.moves.push(move);
               currentGame.checkWin()
            }
         }
         row.append(col);
      }

      grid.append(row);
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

   currentGame.blanks = puzzle.flat().filter(x => !x).length;


   const ROW_NUM = 9, COL_NUM = 9;
   let grid = document.querySelector('#gamePaneGrid');
   grid.querySelectorAll(".gamePaneRow").forEach(e => e.remove());
   currentGame.cells = [];

   for (let r = 0; r < ROW_NUM; r++) {
      let row = document.createElement('div');
      row.classList.add('row', 'gamePaneRow');
      const cells = [];

      for (let c = 0; c < COL_NUM; c++) {
         let col = document.createElement('div');
         col.classList.add('col', 'px-0', 'gamePaneCol');
         col.innerHTML = `<button class='btn'>${puzzle[r][c] ? puzzle[r][c] : ""}</button>`;
         col.childNodes[0].onclick = (evt) => {
            setVisualActive(r, c);
            evt.target.classList.add("active");
            currentGame.active = [r, c];
         }
         row.append(col);
         cells.push(col.childNodes[0]);
      }
      grid.append(row);
      currentGame.cells.push(cells);
   }            
   setVisualActive(0, 0);
   const firstCell = grid.querySelector(".gamePaneRow").childNodes[0].childNodes[0];
   firstCell.classList.add("active");
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
const setupGameboard = (puzzle_id) => {
   
   toSection('daily');
   let startBtn = document.querySelector('#startGame');
   startBtn.style.cssText = 'opacity: 1';
   fillGamePaneGrid('daily');
}

// Guest Login
const guestLogin = () => {
   const userInfo = {
      role: "guest",
   }
   localStorage.setItem('userInfo', JSON.stringify(userInfo));

   document.querySelector('#top-banner .username').innerText = "Guest_4105";
   // Disable all section links except logout & daily sudoku
   let sectionLinks = document.querySelectorAll("nav .sectionLink");
   sectionLinks.forEach(link => {
      if (link.id !== "logout" && !link.innerText.includes("Daily")) {
         link.classList.add("disabled");
         link.parentNode.style.display = 'none';
      }
   });
   // TODO: once the game has won, any further operation bring them to entry section
   
   setupGameboard();

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
      const loginUsername = document.querySelector("#login-username").value;
      const loginPassword = document.querySelector("#login-password").value;

      if (loginUsername == "") {
         document.querySelector('#loginErr').innerText = "Username is required";
         return;

      } else if (loginPassword == "") {
         document.querySelector('#loginErr').innerText = "Password is required";
         return;
      }

      login(loginUsername, loginPassword);
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
         searchUser();
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
   let revertLastStep = document.querySelector("#revertLastStep");
   revertLastStep.onclick = () => currentGame.undo();
   let hint = document.querySelector("#hint");
   hint.onclick = () => currentGame.hint();

   // Start Game button toggle itself
   let startGameBtn = document.querySelector('#startGame');
   startGameBtn.onclick = () => {currentGame.start();};

   // Winning condition buttons event listener
   let wonToDashboard = document.querySelector('#wonToDashboard');
   wonToDashboard.onclick = () => {
      // TODO: append user data update functions here
      document.querySelector('#won').classList.remove("show");
      currentGame.reset();
      toSection('dashboard');
   };
   let wonToSelect = document.querySelector('#wonToSelect');
   wonToSelect.onclick = () => {
      // TODO: append user data update functions here
      document.querySelector('#won').classList.remove("show");
      currentGame.reset();
      toSection('selectLevel');
   }

   // Continue as guest event listener
   let guestLoginBtn = document.querySelector('#guestLogin');
   guestLoginBtn.onclick = () => { guestLogin() };
};

// TODO: delete if fillUserData worked well
// const displayUserStatistics = async () => {
//    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//    if (userInfo.role === 'member' || userInfo.role === 'admin') {
//       const res = await fetch(`${serverURL}/sudoku/records/${userInfo.username}`, {
//          headers: {
//             'Accept': 'application/json, text/plain, */*',
//             'Content-Type': 'application/json',
//             username: userInfo.username,
//             password: userInfo.password,
//          }
//       });

//       const response = await res.json();
//       const { totalPlaytime, highestScore, games, gamesLast7days } = processRecords(response);

//       console.log(processTimeFormat(totalPlaytime), ': Total Playtime');
//       console.log(highestScore, 'Highest score');
//       console.log(games, 'Conquered number of sudokus');
//       console.log(gamesLast7days, 'Conquered number of sudokus in the last 7 days');
//    }
// }

window.onload = () => {
   setup();
   
   const userInfo = localStorage.getItem('userInfo');
   const rememberMe = localStorage.getItem('rememberMe');
   if (rememberMe && userInfo) {
      // Hide admin panel section link if not logged in as admin
      if (userInfo.role == "admin") {
         let toAdmin = document.querySelector('#toAdmin');
         toAdmin.style.display = 'block';
      } else {
         let toAdmin = document.querySelector('#toAdmin');
         toAdmin.style.display = 'none';
      }
      toSection('dashboard');

   } else {
      toSection('entry');
   }
};

})();