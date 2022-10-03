import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
const VOTER_ADDRESS = "0x29a331Eb62C96448bf6C50484d039340776D27A6";

async function main() {


   //these options come from your .env file
   const options = {
        alchemy: process.env.ALCHEMY_API_KEY,
        infura: process.env.INFURA_API_KEY,
    };
 //console.log({options});

    //once we get the provider we can invoke many provider methods. See ethers documentation
    const provider = ethers.getDefaultProvider("goerli", options);
    //returns a promise so you need to use await
    //gets the last block. visible on the goerli etherscan
    //const lastBlock = await provider.getBlock("latest");
   // console.log({lastBlock});

    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    PROPOSALS.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    //create a random wallet to sign tx
    //const wallet = ethers.Wallet.createRandom();
    const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
    console.log(`Using address ${wallet.address}`);
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers.utils.formatEther(balanceBN));
    console.log(`wallet balance ${balance}`);
    if(balance < 0.01) {
        throw new Error("Not enough ether");
    }
    const ballotFactory = new Ballot__factory(signer);


// const accounts = await ethers.getSigners();

//   const ballotFactory = await ethers.getContractFactory("Ballot");


  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.deployed();
  console.log(`Ballot contract was deployed to the address ${ballotContract.address}`);

  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.utils.parseBytes32String(proposal.name);
    console.log({index, name, proposal});
  }

//   const chairperson = await ballotContract.chairperson();
//   console.log({chairperson});
//   console.log({accounts0: accounts[0].address, accounts1: accounts[1].address});

  let voterStructForAccount1 = await ballotContract.voters(VOTER_ADDRESS);
  console.log({voterStructForAccount1});
  console.log("give right to vote to account 1");
  //this will only work if you call it as teh chairperson aka contract owner
  const giveRightToVoteTx = await ballotContract.giveRightToVote(VOTER_ADDRESS);
  const giveRightToVoteTxReceipt = await giveRightToVoteTx.wait();
  console.log({giveRightToVoteTxReceipt});
  voterStructForAccount1 = await ballotContract.voters(VOTER_ADDRESS)
  console.log({voterStructForAccount1});

//   console.log("casting vote to proposal 0 using account 1");
//   const castVoteTx = await ballotContract.connect(accounts[1]).vote(0);
//   const castVoteTxReceipt = await castVoteTx.wait();
//   console.log({castVoteTxReceipt});
//   const proposal0 = await ballotContract.proposals(0);
//   const name = ethers.utils.parseBytes32String(proposal0.name);
//   console.log({index: 0, name, proposal0});


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