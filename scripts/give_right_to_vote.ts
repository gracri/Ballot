import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0xC7cc3cE29BD7294B6B7CBD1aBe6AAeFa72961faB";
const ADDRESSES = ["0xE754320fc86A53cAc4585E019FC35cDD486C09c1", "0xB92403d3b806880cD9dc953DF5277c42cDe1aB6C"];

async function main() {

  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: process.env.INFURA_API_KEY,
  };

  const provider = ethers.getDefaultProvider("goerli", options);
  //connect to Metamask wallet using seed phrase
  const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  const signer = wallet.connect(provider);
  //make sure wallet contains ether
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  if(balance < 0.01) {
    throw new Error("Not enough ether");
  }
  //Get the deployed contract
  const ballotFactory = new Ballot__factory(signer);
  const ballotContract = await ballotFactory.attach(CONTRACT_ADDRESS);

  //give right to vote. Can only be called by the chairperson
  console.log("give right to vote to authorized addresses");  
  for (let index = 0; index < ADDRESSES.length; index++) {
    const giveRightToVoteTx = await ballotContract.giveRightToVote(ADDRESSES[index]);
    const giveRightToVoteTxReceipt = await giveRightToVoteTx.wait();
    console.log({giveRightToVoteTxReceipt});
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});