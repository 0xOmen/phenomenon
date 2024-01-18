//import ethers from "front end file"
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress, hardhatWETHAddr } from "./constants.js";
import { erc20_abi } from "./erc20-abi.js";

const connectButton = document.getElementById("connectButton");
const enterGameButton = document.getElementById("depositButton");
const startGameButton = document.getElementById("startGameButton");
const tableData = document.getElementById("data-output");
const playerId = document.getElementById("player-id");
const forceTurnButton = document.getElementById("forceTurnButton");
const attemptMiracleButton = document.getElementById("attemptMiracleButton");
const attemptSmiteButton = document.getElementById("attemptSmiteButton");
const accuseButton = document.getElementById("accuseButton");
const setAllegianceButton = document.getElementById("setAllegiance");
const targetNames = document.getElementById("targetNames");
const priestData = document.getElementById("priest-data");
const claimTicketsButton = document.getElementById("claimTickets");
const resetButton = document.getElementById("reset");
const numberOfPlayers = document.getElementById("nextGamePlayers");
const avatarImage = document.getElementById("avatarImage");
const avatarText = document.getElementById("avatarText");
const buyTicketsButton = document.getElementById("buyButton");
const sellTicketsButton = document.getElementById("sellButton");
const ticketNames = document.getElementById("ticketNames");
const ticketPrice = document.getElementById("ticketPrice");
const ticketModal = document.getElementById("ticketModal");
const buyTrxButton = document.getElementById("sendBuyTrx");
const sellTrxButton = document.getElementById("sendSellTrx");
const errorModal = document.getElementById("errorModal");
const errorOutput = document.getElementById("errorOutput");

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");
const closeErrorModal = document.getElementById("closeErorrModal");

enterGameButton.onclick = enterGame;
startGameButton.onclick = startGame;
forceTurnButton.onclick = forceTurn;
attemptMiracleButton.onclick = attemptMiracle;
attemptSmiteButton.onclick = attemptSmite;
accuseButton.onclick = accuse;
setAllegianceButton.onclick = setAllegiance;
claimTicketsButton.onclick = claimTickets;
resetButton.onclick = reset;
buyTicketsButton.onclick = buyTicketModalUpdate;
sellTicketsButton.onclick = sellTicketModalUpdate;
closeModalBtn.onclick = closeModal;
closeErrorModal.onclick = closeModal;
buyTrxButton.onclick = buyTicketTransaction;
sellTrxButton.onclick = sellTicketTransaction;

connectButton.onclick = connect;

let playerNumber;
let provider, signer, userAddress, contract;
let lastAction = [];

window.onload = (event) => {
  isConnected();
};

async function isConnected() {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  provider = new ethers.providers.Web3Provider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  if (chainId == 8453 || chainId == 31337) {
    if (accounts.length) {
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      contract = new ethers.Contract(contractAddress, abi, signer);
      console.log(`You're connected to: ${accounts[0]}`);
      connectButton.innerHTML = `${accounts[0].substring(
        0,
        6
      )}...${accounts[0].substring(38, 43)} Connected`;
      populateProphets();
      listenForEvents();
    } else {
      console.log("Metamask is not connected");
    }
  } else connectButton.innerHTML = "Change Network to Base";
}

async function connect() {
  if (typeof window.ethereum != undefined) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId == 8453 || chainId == 31337) {
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      contract = new ethers.Contract(contractAddress, abi, signer);
      const accountConnected = `${userAddress.substring(
        0,
        6
      )}...${userAddress.substring(38, 43)} Connected`;
      connectButton.innerHTML = accountConnected;
      console.log("Metamask connected");
      populateProphets();
      listenForEvents();
    } else connectButton.innerHTML = "Change Network to Base";
  } else {
    connectButton.innerHTML = "Metamask not found";
  }
}

async function enterGame() {
  console.log(`Checking erc20 allowance for contract`);
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    console.log(signer);
    try {
      await checkAndSetAllowance(
        signer,
        hardhatWETHAddr,
        contractAddress,
        ethers.utils.parseEther("10000")
      );
      console.log("Approval check completed");
    } catch (error) {
      console.log(error);
    }
    try {
      const entryTx = await contract.enterGame();
      await entryTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

// Fetch the current allowance and update if needed
async function checkAndSetAllowance(
  wallet,
  tokenAddress,
  approvalAddress,
  amount
) {
  // Transactions with the native token don't need approval
  if (tokenAddress === ethers.constants.AddressZero) {
    return;
  }

  //check the erc20 allowance on our smart contract
  const erc20 = new ethers.Contract(tokenAddress, erc20_abi, wallet);
  const allowance = await erc20.allowance(userAddress, approvalAddress);
  if (allowance.lt(amount)) {
    console.log("Needs Allowance increased");
    const approveTx = await erc20.approve(approvalAddress, amount, {
      gasPrice: await wallet.provider.getGasPrice(),
    });
    try {
      await approveTx.wait();
      console.log(`Transaction mined succesfully: ${approveTx.hash}`);
    } catch (error) {
      console.log(`Transaction failed with error: ${error}`);
    }
  }
}

async function listenForEvents() {
  if (typeof window.ethereum != undefined) {
    contract.on("prophetEnteredGame", (from, gameNumber, event) => {
      let entryEvent = {
        from: from,
        gameNumber: gameNumber.toString(),
        eventData: event,
      };
      console.log(JSON.stringify(entryEvent, null, 3));
      const tracking = {
        address: from,
        action: "Entered Game",
      };
      lastAction.push(tracking);
      populateProphets();
    });

    contract.on("miracleAttempted", (isSuccess, prophetNum, event) => {
      let miracleEvent = {
        success: isSuccess,
        prophetNum: prophetNum.toString(),
        eventData: event,
      };
      console.log(JSON.stringify(miracleEvent, null, 3));

      populateProphets();
    });
  }
}

async function populateProphets() {
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    let playerName = "You are not currently a prophet";
    let prophetOutput = "";
    let _priestData = "";

    let currentTurn, targets, prophetNumNameNum, currentTurnNameNum, nameOfTurn;
    let firstAddress;
    const gameStatus = await contract.gameStatus();
    const totalTickets = await contract.totalTickets();
    const tokenBalance = await contract.tokenBalance();
    const game_number = await contract.s_gameNumber();
    document.getElementById("gameNumber").innerHTML =
      `Current Game Number: ${game_number}`;
    const numberOfProphets = await contract.NUMBER_OF_PROPHETS();
    updateButtons(gameStatus, false, numberOfProphets);
    try {
      for (let prophetNum = 0; prophetNum < numberOfProphets; prophetNum++) {
        let prophet;
        try {
          prophet = await contract.prophets(prophetNum);
          console.log(`prophet = ${prophet}`);
          if (prophetNum == 0) {
            currentTurn = await contract.currentProphetTurn(game_number);
            firstAddress = prophet[0].substring(2, 3);
          }
          prophetNumNameNum = getPlayerNameArrayNum(prophetNum, firstAddress);
          currentTurnNameNum = getPlayerNameArrayNum(currentTurn, firstAddress);
          let accolites, highPriests;
          if (totalTickets == 0) {
            accolites = 0;
            highPriests = 0;
          } else {
            accolites = await contract.accolites(prophetNum);
            highPriests = await contract.highPriestsByProphet(prophetNum);
          }
          prophetOutput += getProphetData(
            prophet,
            prophetNum,
            accolites,
            highPriests,
            currentTurn,
            prophetNumNameNum,
            tokenBalance
          );
          if (prophet[0] == userAddress) {
            playerNumber = prophetNum;
            playerName = `You are ${prophetNames[prophetNumNameNum]}`;
            updateButtons(gameStatus, true, numberOfProphets);
            //updatePriestButton();
            if (currentTurn == prophetNum && gameStatus == 1) {
              playerName += ` and it is your turn`;
              updateTurnButtons(prophet[2]);
            } else if (gameStatus == 0) {
              playerName += ` and you are waiting for more players to join`;
            } else if (gameStatus == 3) {
            } else {
              nameOfTurn = prophetNames[currentTurnNameNum];
              playerName += ` and it is ${nameOfTurn}'s turn`;
              if (gameStatus == 1) {
                updateForceButton(nameOfTurn);
              }
              if (prophet[3] == 99) {
                const playerTickets = await contract.ticketsToValhalla(
                  game_number,
                  userAddress
                );
                if (playerTickets == 0) {
                  _priestData = `You are not following a prophet`;
                } else {
                  const allegianceNum = await contract.allegiance(
                    game_number,
                    userAddress
                  );
                  _priestData = `You are High Priest for ${prophetNames[allegianceNum]}`;
                }
              }
            }
          }
          if (prophet[1]) {
            const name = prophetNames[prophetNumNameNum];
            targets += `<option value="${prophetNum}">${name}</option>"`;
          }
        } catch (error) {
          console.log(`${error}`);
          prophetNum += numberOfProphets;
        }
      }
      if (gameStatus == 3) {
        nameOfTurn = prophetNames[currentTurnNameNum];
        playerName += ` and ${nameOfTurn} won`;
        gameEndButtons();
      }
      if (playerName == "You are not currently a prophet" && gameStatus == 1) {
        nameOfTurn = prophetNames[currentTurnNameNum];
        updateForceButton(nameOfTurn);
        const ticketsOwned = await contract.ticketsToValhalla(
          game_number,
          userAddress
        );
        if (ticketsOwned == 0) {
          playerName += ` and you own ${ticketsOwned} tickets`;
          ticketManagementVisible(targets, false);
        } else {
          const allegiantTo = await contract.allegiance(
            game_number,
            userAddress
          );
          const allegianceNameNum = getPlayerNameArrayNum(
            allegiantTo,
            firstAddress
          );
          const allegianceName = prophetNames[allegianceNameNum];
          playerName += ` and you own ${ticketsOwned} tickets of ${allegianceName}`;
          const target = `<option value="${allegiantTo}">${allegianceName}</option>"`;
          ticketManagementVisible(target, true);
        }
      } else if (gameStatus == 1) updatePriestButton();
      tableData.innerHTML = prophetOutput;
      playerId.innerHTML = `${playerName}`;
      targetNames.innerHTML = targets;
      priestData.innerHTML = _priestData;

      if (gameStatus == 0) {
        avatarText.innerHTML = `<strong>Awaiting Game Start<strong/>`;
        avatarImage.src = `chainlink1.jpg`;
      } else if (gameStatus == 2) {
        avatarText.innerHTML = `<strong>Awaiting Oracle Response<strong/>`;
        avatarImage.src = `chainlink1.jpg`;
      } else {
        avatarImage.src = `${prophetImage[currentTurnNameNum]}`;
        avatarText.innerHTML = `Current Turn`;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function ticketManagementVisible(priests, canSell) {
  buyTicketsButton.classList.remove("hidden");
  if (canSell) sellTicketsButton.classList.remove("hidden");
  ticketNames.classList.remove("hidden");
  ticketNames.innerHTML = priests;
}

async function buyTicketModalUpdate() {
  const accolites = await contract.accolites(
    document.getElementById("ticketNames").value
  );
  const nextTicketPrice = await contract.getPrice(accolites, 1);
  console.log(nextTicketPrice);
  ticketPrice.innerHTML = `Next ticket price is ${ethers.utils.formatEther(
    nextTicketPrice
  )} tokens`;
  ticketModal.classList.remove("hidden");
  buyTrxButton.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

async function sellTicketModalUpdate() {
  const accolites = await contract.accolites(
    document.getElementById("ticketNames").value
  );
  const nextTicketPrice = await contract.getPrice(accolites - 1, 1);
  console.log(nextTicketPrice);
  ticketPrice.innerHTML = `Next ticket price is ${ethers.utils.formatEther(
    nextTicketPrice
  )} tokens`;
  ticketModal.classList.remove("hidden");
  sellTrxButton.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

async function closeModal() {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
  buyTrxButton.classList.add("hidden");
  sellTrxButton.classList.add("hidden");
  errorModal.classList.add("hidden");
}

async function buyTicketTransaction() {
  const numTickets = document.getElementById("amount").value;
  const prophetNum = document.getElementById("ticketNames").value;
  const accolites = await contract.accolites(prophetNum);
  const totalPrice = await contract.getPrice(accolites, numTickets);
  console.log(`Checking erc20 allowance of ${hardhatWETHAddr}`);
  if (typeof window.ethereum != undefined) {
    try {
      await checkAndSetAllowance(
        signer,
        hardhatWETHAddr,
        contractAddress,
        totalPrice
      );
      console.log("Approval check completed");
    } catch (error) {
      console.log(error);
    }
    console.log(`Buying ${numTickets} Tickets of ${prophetNum}`);
    try {
      const buyTx = await contract.getReligion(prophetNum, numTickets);
      await buyTx.wait();
      closeModal();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function sellTicketTransaction() {
  const numTickets = document.getElementById("amount").value;
  if (typeof window.ethereum != undefined) {
    console.log(`Selling ${numTickets} Tickets`);
    try {
      const buyTx = await contract.loseReligion(numTickets);
      await buyTx.wait();
      closeModal();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

const prophetNames = [
  "Baal",
  "Cthulhu",
  "Odin",
  "Athena",
  "Marduk",
  "Kek",
  "Vishnu",
  "Zeus",
  "Isis",
  "Ashur",
];

const prophetImage = [
  "./Baal2.jpg",
  "./Cthulu1.jpg",
  "./Odin2.jpg",
  "./Athena2.jpg",
  "./Marduk2.jpg",
  "./Kek.jpg",
  "./Vishnu1.jpg",
  "./Zeus1.jpg",
  "./Isis1.jpg",
  "./Ashur2.jpg",
];

function getProphetData(
  prophet,
  prophetNum,
  accolites,
  highPriests,
  currentTurn,
  nameNum,
  tokenBalance
) {
  const prophetName = prophetNames[nameNum];
  const avatar = prophetImage[nameNum];
  let color, prophetStatus, tokensPerTicket;
  let border = "";
  let action = "unknown";
  if (accolites + highPriests == 0) {
    tokensPerTicket = (tokenBalance * 95) / 100;
  } else {
    tokensPerTicket =
      (tokenBalance * 95) / (parseInt(accolites) + parseInt(highPriests)) / 100;
  }
  const stringTokensPerTicket = Math.round(
    +ethers.utils.formatEther(
      tokensPerTicket.toLocaleString("fullwide", { useGrouping: false })
    )
  ).toString();

  if (prophet[3] == 99) {
    color = "purple";
    prophetStatus = "High Priest";
    tokensPerTicket = 0;
  } else if (prophet[1] == false) {
    color = "red";
    prophetStatus = "Dead";
    tokensPerTicket = 0;
  } else if (prophet[2] == false) {
    color = "orange";
    prophetStatus = "In Jail";
  } else {
    color = "green";
    prophetStatus = "Alive";
  }
  if (prophetNum == currentTurn) {
    border = "solid thin";
  }
  try {
    action = lastAction[currentTurn].action;
  } catch (error) {}

  const answer = `<tr style="background-color: ${color}; outline: ${border}">
            <td><img src=${avatar} width="40" height="40" ></img></td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> ${prophetName} </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> ${prophetStatus} </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px">  ${accolites}  </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px">  ${highPriests}  </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px">  ${stringTokensPerTicket}  </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> ${lastAction[currentTurn].action} </td>
        </tr>`;
  return answer;
}

function getPlayerNameArrayNum(prophetNum, firstAddress) {
  if (isNaN(firstAddress)) {
    return parseInt(prophetNum);
  } else {
    let num = parseInt(prophetNum) + parseInt(firstAddress);
    if (parseInt(num) >= 10) num = parseInt(num) - 10;
    return parseInt(num);
  }
}

async function startGame() {
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.startGame();
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}

async function updateButtons(gameStatus, entered, numOfProphets) {
  let filled;

  if (gameStatus == 0) {
    try {
      filled = await contract.prophets(numOfProphets - 1);
    } catch (error) {
      console.log(error);
    }
    console.log(`filled = ${filled}`);
    if (filled != null) {
      console.log("entered start Game");
      startGameButton.classList.remove("hidden");
    } else {
      if (!entered) enterGameButton.classList.remove("hidden");
      else enterGameButton.classList.add("hidden");
    }
  } else if (gameStatus == 1) {
    enterGameButton.classList.add("hidden");
    startGameButton.classList.add("hidden");
  }
}

function updateForceButton(nameOfTurn) {
  forceTurnButton.classList.remove("hidden");
  forceTurnButton.innerHTML = `Force ${nameOfTurn} to perform Miracle`;
  attemptMiracleButton.classList.add("hidden");
  attemptSmiteButton.classList.add("hidden");
  accuseButton.classList.add("hidden");
  targetNames.classList.add("hidden");
}

function updateTurnButtons(isFree) {
  attemptMiracleButton.classList.remove("hidden");
  attemptSmiteButton.classList.remove("hidden");
  targetNames.classList.remove("hidden");
  if (isFree) accuseButton.classList.remove("hidden");
  forceTurnButton.classList.add("hidden");
}

function updatePriestButton() {
  setAllegianceButton.classList.remove("hidden");
  targetNames.classList.remove("hidden");
}

function gameEndButtons() {
  claimTicketsButton.classList.remove("hidden");
  document.getElementById("claim").classList.remove("hidden");
  resetButton.classList.remove("hidden");
  numberOfPlayers.classList.remove("hidden");
  buyTicketsButton.classList.add("hidden");
  sellTicketsButton.classList.add("hidden");
  ticketNames.classList.add("hidden");
  attemptMiracleButton.classList.add("hidden");
  attemptSmiteButton.classList.add("hidden");
  setAllegianceButton.classList.add("hidden");
  accuseButton.classList.add("hidden");
  targetNames.classList.add("hidden");
}

async function forceTurn() {
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.performMiracle();
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function attemptMiracle() {
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.performMiracle();
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function attemptSmite() {
  const target = document.getElementById("targetNames").value;
  console.log(`target = ${target}`);
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.attemptSmite(target);
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function accuse() {
  const target = document.getElementById("targetNames").value;
  console.log(`target = ${target}`);
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.accuseOfBlasphemy(target);
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function setAllegiance() {
  const target = document.getElementById("targetNames").value;
  console.log(`target = ${target} and playerNumber = ${playerNumber}`);
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.highPriest(playerNumber, target);
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function claimTickets() {
  if (typeof window.ethereum != undefined) {
    try {
      const gameNumber = document.getElementById("claim").value;
      const startTx = await contract.claimTickets(parseInt(gameNumber));
      await startTx.wait();
    } catch (error) {
      console.log(error);
      errorModal.classList.remove("hidden");
      errorOutput.innerHTML = `${error}`;
    }
  }
}

async function reset() {
  const numberOfPlayers = document.getElementById("nextGamePlayers").value;
  if (
    typeof window.ethereum != undefined &&
    numberOfPlayers > 2 &&
    numberOfPlayers < 10
  ) {
    try {
      const startTx = await contract.reset(numberOfPlayers);
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}
