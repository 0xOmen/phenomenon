export const contractAddress = "0x90118d110B07ABB82Ba8980D1c5cC96EeA810d2C";
export const hardhatWETHAddr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_interval",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_entranceFee",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "_numProphets",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "_gameToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Game__AddressIsEliminated",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__AlreadyRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__Full",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__NotAllowed",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__NotEnoughTicketsOwned",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__NotInProgress",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__NotOpen",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__OutOfTurn",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__ProphetIsDead",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__ProphetNotFree",
    type: "error",
  },
  {
    inputs: [],
    name: "Game__ProphetNumberError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bool",
        name: "isSuccess",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "targetIsAlive",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "currentProphetTurn",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
    ],
    name: "accusation",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
    ],
    name: "accuseOfBlasphemy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
    ],
    name: "attemptSmite",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_gameNumber",
        type: "uint256",
      },
    ],
    name: "claimTickets",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "nextProphetTurn",
        type: "uint256",
      },
    ],
    name: "currentTurn",
    type: "event",
  },
  {
    inputs: [],
    name: "enterGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "numTicketsBought",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "totalPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "gainReligion",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "gameNumber",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokensPerTicket",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "currentProphetTurn",
        type: "uint256",
      },
    ],
    name: "gameEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "GAME_NUMBER",
        type: "uint256",
      },
    ],
    name: "gameStarted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_prophetNum",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_ticketsToBuy",
        type: "uint256",
      },
    ],
    name: "getReligion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_senderProphetNum",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
    ],
    name: "highPriest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_ticketsToSell",
        type: "uint256",
      },
    ],
    name: "loseReligion",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bool",
        name: "isSuccess",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "currentProphetTurn",
        type: "uint256",
      },
    ],
    name: "miracleAttempted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "enum Phenomenon.GameState",
        name: "_status",
        type: "uint8",
      },
    ],
    name: "ownerChangeGameState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_destination",
        type: "address",
      },
    ],
    name: "ownerTokenTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "performMiracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "gameNumber",
        type: "uint256",
      },
    ],
    name: "prophetEnteredGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_target",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "numTicketsSold",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "totalPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "religionLost",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "_numberOfPlayers",
        type: "uint16",
      },
    ],
    name: "reset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "target",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "isSuccess",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "currentProphetTurn",
        type: "uint256",
      },
    ],
    name: "smiteAttempted",
    type: "event",
  },
  {
    inputs: [],
    name: "startGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "ticketsClaimed",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokensSent",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "gameNumber",
        type: "uint256",
      },
    ],
    name: "ticketsClaimed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "accolites",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allegiance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "currentProphetTurn",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAME_NUMBER",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gameStatus",
    outputs: [
      {
        internalType: "enum Phenomenon.GameState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwnerTokenBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "supply",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_playerNum",
        type: "uint256",
      },
    ],
    name: "getTicketShare",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "highPriestsByProphet",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "NUMBER_OF_PROPHETS",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "prophetList",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "prophets",
    outputs: [
      {
        internalType: "address",
        name: "playerAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isAlive",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isFree",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "args",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "prophetsRemaining",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "ticketsToValhalla",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokensPerTicket",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalTickets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
