//import ethers from "front end file"
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress, polygonMumbaiLinkAddr } from "./constants.js";
import { erc20_abi } from "./erc20-abi.js";

const connectButton = document.getElementById("connectButton");

connectButton.onclick = connect;

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
  } else {
    connectButton.innerHTML = "Metamask not found";
  }
}
