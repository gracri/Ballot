import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = "0xAbf721225eB82Aefa25319C963c1b73537D48796";


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

  //Query winning proposal
  console.log("Query winning proposal");
  const winningProposal = await ballotContract.winnerName();
  const name = ethers.utils.parseBytes32String(winningProposal);
	console.log("name:", name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});