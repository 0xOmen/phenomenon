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

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");

//sendBuyTrx.disabled = true;
//sendSellTrx.disabled = true;

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
buyTrxButton.onclick = buyTicketTransaction;
sellTrxButton.onclick = sellTicketTransaction;

connectButton.onclick = connect;

let playerNumber;
let provider, signer, userAddress, contract;

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
        100000000000000
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

async function listenForStart() {
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    contract._addEventListener
      .gameStarted()
      .on("data", function (event) {
        // Handle the received event data
        console.log(event);
        populateProphets();
      })
      .on("error", function (error) {
        // Handle errors
        console.error(error);
      });
  }
}

async function populateProphets() {
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    let playerName = "You are not currently a prophet";
    let prophetOutput = "";
    let _priestData = "";

    let currentTurn, targets, prophetNumNameNum, currentTurnNameNum;
    let firstAddress;
    const gameStatus = await contract.gameStatus();
    const totalTickets = await contract.totalTickets();
    const game_number = await contract.GAME_NUMBER();
    const numberOfProphets = await contract.NUMBER_OF_PROPHETS();
    updateButtons(gameStatus, totalTickets);
    //If we make NUMBER_OR_PLAYERS public we can make this smarter
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
            firstAddress
          );
          if (prophet[0] == userAddress) {
            playerNumber = prophetNum;
            playerName = `You are ${prophetNames[prophetNumNameNum]}`;
            if (currentTurn == prophetNum && gameStatus == 1) {
              playerName += ` and it is your turn`;
              updateTurnButtons(prophet[2]);
            } else if (gameStatus == 3) {
            } else {
              const nameOfTurn = prophetNames[currentTurnNameNum];
              playerName += ` and it is ${nameOfTurn}'s turn`;
              updateForceButton(nameOfTurn);
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
            updatePriestButton();
          }
          if (prophet[1]) {
            const name = prophetNames[prophetNumNameNum];
            targets += `<option value="${prophetNum}">${name}</option>"`;
          }
        } catch (error) {
          prophetNum += numberOfProphets;
        }
      }
      if (gameStatus == 3) {
        const nameOfTurn = prophetNames[currentTurnNameNum];
        playerName += ` and ${nameOfTurn} won`;
        gameEndButtons();
      }
      if (playerName == "You are not currently a prophet" && gameStatus == 1) {
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
      }
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
    } catch (error) {
      console.log(error);
    }
  }
  closeModal();
}

async function sellTicketTransaction() {
  const numTickets = document.getElementById("amount").value;
  if (typeof window.ethereum != undefined) {
    console.log(`Selling ${numTickets} Tickets`);
    try {
      const buyTx = await contract.loseReligion(numTickets);
      await buyTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
  closeModal();
}

const prophetNames = [
  "Baal",
  "Cthulu",
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
  firstAddress
) {
  const prophetName = prophetNames[nameNum];
  const avatar = prophetImage[nameNum];
  let color, prophetStatus;
  let border = "";

  if (prophet[3] == 99) {
    color = "purple";
    prophetStatus = "High Priest";
  } else if (prophet[1] == false) {
    color = "red";
    prophetStatus = "Dead";
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

  const answer = `<tr style="background-color: ${color}; outline: ${border}">
            <td><img src=${avatar} width="40" height="40" ></img></td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> ${prophetName} </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> ${prophetStatus} </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px">  ${accolites}  </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px">  ${highPriests}  </td>
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> Unknown </td>
        </tr>`;
  return answer;
}

function getPlayerNameArrayNum(prophetNum, firstAddress) {
  console.log(`firstAddress = ${firstAddress}`);
  console.log(`prophetNum = ${prophetNum}`);
  if (isNaN(firstAddress)) {
    console.log(`entered non number area`);
    return parseInt(prophetNum);
  } else {
    let num = parseInt(prophetNum) + parseInt(firstAddress);
    console.log(`entered number area`);
    if (parseInt(num) >= 10) num = parseInt(num) - 10;

    console.log(`num = ${num}`);
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

function updateButtons(gameStatus, totalTickets) {
  if (gameStatus == 0) {
    enterGameButton.classList.remove("hidden");
    if (totalTickets == 0) {
      startGameButton.classList.remove("hidden");
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
    }
  }
}

async function setAllegiance() {
  const target = document.getElementById("targetNames").value;
  console.log(`target = ${target}`);
  if (typeof window.ethereum != undefined) {
    try {
      const startTx = await contract.highPriest(playerNumber, target);
      await startTx.wait();
    } catch (error) {
      console.log(error);
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
