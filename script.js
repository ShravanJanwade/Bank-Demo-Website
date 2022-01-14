'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const intlBalance = function (trans, acc) {
  const option = {
    style: 'currency',
    currency: acc.currency,
  };
  const locale = navigator.language;
  const amount = new Intl.NumberFormat(locale, option).format(trans);
  return amount;
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const now = new Date(acc.movementsDates[i]);
    const date = now.getDate();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const displayDate = `${date}/${month}/${year}, ${hours}:${min}:${sec}`;
    const amount = intlBalance(mov, acc);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${amount}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${intlBalance(acc.balance, acc)}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${intlBalance(incomes, acc)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const withDrawal = Math.abs(out);
  labelSumOut.textContent = `${intlBalance(withDrawal, acc)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${intlBalance(interest, acc)}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    setInterval(() => {
      labelDate.textContent = dispDate();
    }, 1000);
    if (timer) {
      clearInterval(timer);
    }
    timer = logOut(100);
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    const displayDate = dispDate();
    currentAccount.movementsDates.push(displayDate);
    setTimeout(() => updateUI(currentAccount), 4000);
    clearInterval(timer);
    timer = logOut(100);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    const displayDate = dispDate();
    currentAccount.movementsDates.push(displayDate);

    // Update UI
    setTimeout(() => updateUI(currentAccount), 4000);
    clearInterval(logOut);
    clearInterval(timer);
    timer = logOut(100);
  }
  inputLoanAmount.value = '';
});
const dispDate = function () {
  const now = new Date();
  const options = {
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  };
  const locale = currentAccount.locale;
  const displayDate = new Intl.DateTimeFormat(locale, options).format(now);
  return displayDate;
};
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const logOut = function (time) {
  const tick = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(Number.MAX_SAFE_INTEGER);
// // const a = 1481790510950150793257309288940n;
// // const a = BigInt(195018501350159135902480840812094801859015015901051050151515);
// const a = 1857914n * 154n ** 22n;
// console.log(a);
// console.log(typeof a);

//Dates and Times

// const date = new Date();
// console.log(date);

// console.log(new Date('27 April,2001'));
// console.log(new Date(2022, 3, 27, 5, 12, 27, 11));
// console.log(new Date(2022, 3, 32));
// console.log(new Date(0));

// currentAccount = account1;

// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// const now = new Date();
// const date = now.getDate();
// const month = `${now.getMonth() + 1}`.padStart(2, '0');
// const year = now.getFullYear();
// const hours = now.getHours();
// const min = now.getMinutes();
// const sec = now.getSeconds();

// labelDate.textContent = `${date}/${month}/${year}, ${hours}:${min}:${sec}`;
// console.log(new Intl.DateTimeFormat('en-IN').format(now));

// const locale = navigator.language;
// console.log(locale);

// const units = {
//   style: 'currency',
//   currency: 'USD',
//   useGrouping: true,
// };
// const num = 164897410978;
// console.log(num);
// console.log(new Intl.NumberFormat('en-IN', units).format(num));
// console.log(new Intl.NumberFormat('en-US', units).format(num));
// console.log(new Intl.NumberFormat('de-DE', units).format(num));

// setTimeout(() => console.log('Here is your pizza🍕'), 5000);
// console.log('Your Order will be Deleviered Soon');

// setInterval(() => {
//   const date = new Date();
//   console.log(date);
// }, 1000);
