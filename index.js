//import ethers from "front end file"
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress, polygonMumbaiLinkAddr } from "./constants.js";
import { erc20_abi } from "./erc20-abi.js";

const connectButton = document.getElementById("connectButton");
const enterGameButton = document.getElementById("depositButton");
const startGameButton = document.getElementById("startGameButton");
const setGameButton = document.getElementById("setGameButton");
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

enterGameButton.onclick = enterGame;
startGameButton.onclick = startGame;
setGameButton.onclick = setStart;
forceTurnButton.onclick = forceTurn;
attemptMiracleButton.onclick = attemptMiracle;
attemptSmiteButton.onclick = attemptSmite;
accuseButton.onclick = accuse;
setAllegianceButton.onclick = setAllegiance;
claimTicketsButton.onclick = claimTickets;
resetButton.onclick = reset;

connectButton.onclick = connect;

let playerNumber;

window.onload = (event) => {
  isConnected();
};

async function isConnected() {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  if (accounts.length) {
    console.log(`You're connected to: ${accounts[0]}`);
    connectButton.innerHTML = `${accounts[0].substring(
      0,
      6
    )}...${accounts[0].substring(38, 43)} Connected`;
    populateProphets();
  } else {
    console.log("Metamask is not connected");
  }
}

async function connect() {
  if (typeof window.ethereum != undefined) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    const accountConnected = `${userAddress.substring(
      0,
      6
    )}...${userAddress.substring(38, 43)} Connected`;
    connectButton.innerHTML = accountConnected;
    console.log("Metamask connected");
    populateProphets();
  } else {
    connectButton.innerHTML = "Metamask not found";
  }
}

async function enterGame() {
  console.log(`Checking erc20 allowance for contract`);
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(signer);
    try {
      await checkAndSetAllowance(
        signer,
        polygonMumbaiLinkAddr,
        contractAddress,
        100000000000000
      );
      console.log("Approval check completed");
    } catch (error) {
      console.log(error);
    }
    const contract = new ethers.Contract(contractAddress, abi, signer);
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

  const erc20 = new ethers.Contract(tokenAddress, erc20_abi, wallet);
  //check the erc20 allowance on our smart contract
  const allowance = await erc20.allowance(
    await wallet.getAddress(),
    approvalAddress
  );
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

async function populateProphets() {
  if (typeof window.ethereum != undefined) {
    //Finds node endpoint in Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    let playerName = "You are not registered";
    const contract = new ethers.Contract(contractAddress, abi, signer);
    let prophetOutput = "";
    let _priestData = "";
    let prophetNum = 0;
    let currentTurn, targets;
    let checkNextProphet = true;
    let firstAddress;
    const gameStatus = await contract.gameStatus();
    const totalTickets = await contract.totalTickets();
    updateButtons(gameStatus, totalTickets);
    //If we make NUMBER_OR_PLAYERS public we can make this smarter
    try {
      while (checkNextProphet) {
        let prophet;
        try {
          prophet = await contract.prophets(prophetNum);
          console.log(`prophet = ${prophet}`);
          if (prophetNum == 0) {
            currentTurn = await contract.currentProphetTurn();
            firstAddress = prophet[0].substring(2, 3);
          }
          let accolites;
          if (totalTickets == 0) {
            accolites = 0;
          } else accolites = await contract.accolites(prophetNum);
          prophetOutput += getProphetData(
            prophet,
            prophetNum,
            accolites,
            currentTurn,
            gameStatus,
            firstAddress
          );
          if (prophet[0] == userAddress) {
            playerNumber = prophetNum;
            playerName = `You are ${getPlayerName(prophetNum, firstAddress)}`;
            if (currentTurn == prophetNum && gameStatus != 3) {
              if (totalTickets != 0) {
                playerName += ` and it is your turn`;
                updateTurnButtons();
              }
            } else if (gameStatus == 3) {
            } else {
              const nameOfTurn = getPlayerName(currentTurn, firstAddress);
              playerName += ` and it is ${nameOfTurn}'s turn`;
              updateForceButton(nameOfTurn);
              if (prophet[3] == 99) {
                updatePriestButton();
                _priestData = "You are High Priest for ???";
              }
            }
          } else {
            if (prophet[1]) {
              const name = getPlayerName(prophetNum, firstAddress);
              targets += `<option value="${prophetNum}">${name}</option>"`;
            }
          }
        } catch (error) {
          checkNextProphet = false;
        }

        prophetNum++;
      }
      if (gameStatus == 3) {
        const nameOfTurn = getPlayerName(currentTurn, firstAddress);
        playerName += ` and ${nameOfTurn} won`;
        gameEndButtons();
      }
      tableData.innerHTML = prophetOutput;
      playerId.innerHTML = `${playerName}`;
      targetNames.innerHTML = targets;
      priestData.innerHTML = _priestData;
      //avatarImage.innerHTML = `<img src=${prophetImage[currentTurn]} width="100" height="100"></img>`;
      avatarImage.src = `${prophetImage[currentTurn]}`;
    } catch (error) {
      console.log(error);
    }
  }
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
  currentTurn,
  gameStatus,
  firstAddress
) {
  const prophetName = getPlayerName(prophetNum, firstAddress);
  const avatar = prophetImage[prophetNum];
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
            <td style="text-align: center; padding-right: 5px; padding-left: 5px"> Unknown </td>
        </tr>`;
  return answer;
}

function getPlayerName(prophetNum, firstAddress) {
  console.log(`firstAddress = ${firstAddress}`);
  console.log(`prophetNum = ${prophetNum}`);
  if (isNaN(firstAddress)) {
    console.log(`entered non number area`);
    return prophetNames[parseInt(prophetNum)];
  } else {
    let num = parseInt(prophetNum) + parseInt(firstAddress);
    console.log(`entered number area`);
    if (parseInt(num) >= 10) num = parseInt(num) - 10;

    console.log(`num = ${num}`);
    return prophetNames[parseInt(num)];
  }
}

async function startGame() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const startTx = await contract.startGame();
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}

async function setStart() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const startTx = await contract.setStart();
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}

function updateButtons(gameStatus, totalTickets) {
  if (gameStatus == 0) {
    enterGameButton.classList.remove("hidden");
    startGameButton.classList.remove("hidden");
  } else if (gameStatus == 1) {
    if (totalTickets == 0) {
      setGameButton.classList.remove("hidden");
    } else {
    }
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

function updateTurnButtons() {
  attemptMiracleButton.classList.remove("hidden");
  attemptSmiteButton.classList.remove("hidden");
  targetNames.classList.remove("hidden");
  accuseButton.classList.remove("hidden");
  forceTurnButton.classList.add("hidden");
}

function updatePriestButton() {
  setAllegianceButton.classList.remove("hidden");
  targetNames.classList.remove("hidden");
}

function gameEndButtons() {
  claimTicketsButton.classList.remove("hidden");
  resetButton.classList.remove("hidden");
  numberOfPlayers.classList.remove("hidden");
}

async function forceTurn() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const startTx = await contract.forceTurn();
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}

async function attemptMiracle() {
  if (typeof window.ethereum != undefined) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const startTx = await contract.claimTickets();
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const startTx = await contract.reset(numberOfPlayers);
      await startTx.wait();
    } catch (error) {
      console.log(error);
    }
  }
}
