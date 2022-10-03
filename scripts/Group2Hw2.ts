import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const VOTER_ADDRESS = "0x29a331Eb62C96448bf6C50484d039340776D27A6";

async function main() {

  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: process.env.INFURA_API_KEY,
  };

  const provider = ethers.getDefaultProvider("goerli", options);
  //connect to Metamask wallet using seed phrase
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  console.log(`Using address ${wallet.address}`);
  const signer = wallet.connect(provider);
  //make sure wallet contains ether
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  if(balance < 0.01) {
    throw new Error("Not enough ether");
  }
  //Deploy Ballot contract
  console.log("Deploying Ballot contract");
  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.deployed();
  console.log(`Ballot contract was deployed to the address ${ballotContract.address}`);

  //Print out the proposals assigned to deployed Ballot contract
  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.utils.parseBytes32String(proposal.name);
    console.log({index, name, proposal});
  }

  //Print out the ballot chairperson
  const chairperson = await ballotContract.chairperson();
  console.log({chairperson});

  //Give right to vote
  let voterStructForAccount1 = await ballotContract.voters(VOTER_ADDRESS);
  console.log({voterStructForAccount1});
  console.log("give right to vote to account 1");
  //this will only work if you call it as the chairperson 
  const giveRightToVoteTx = await ballotContract.giveRightToVote(VOTER_ADDRESS);
  const giveRightToVoteTxReceipt = await giveRightToVoteTx.wait();
  console.log({giveRightToVoteTxReceipt});
  voterStructForAccount1 = await ballotContract.voters(VOTER_ADDRESS)
  console.log({voterStructForAccount1});

//Cast votes
// const wallet2 = ethers.Wallet.fromMnemonic(process.env.MNEMONIC2 ?? "");
// //console.log(`Using address ${wallet.address}`);
// const signer2 = wallet2.connect(provider);

//   console.log("casting vote to proposal 0 using account 1");
//   const castVoteTx = await ballotContract.connect(signer2).vote(0);
//   const castVoteTxReceipt = await castVoteTx.wait();
//   console.log({castVoteTxReceipt});
//   const proposal0 = await ballotContract.proposals(0);
//   const name = ethers.utils.parseBytes32String(proposal0.name);
//   console.log({index: 0, name, proposal0});

//   console.log("Query winning proposal");
//   const winningProposal = await ballotContract.winnerName();
//   console.log(`Winning proposal: ${winningProposal}`);



}

function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});