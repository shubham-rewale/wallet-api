// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  const [deployer] = await ethers.getSigners();
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Currency_Token = await hre.ethers.getContractFactory("Currency_Token");
  const Currency_Token_Contract = await Currency_Token.connect(deployer).deploy(
    "DOLLAR",
    "$"
  );

  // await Currency_Token_Contract.deployed();

  console.log(
    "Currency_Token_Contract deployed to:",
    Currency_Token_Contract.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
