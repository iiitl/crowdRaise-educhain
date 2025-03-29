const { Ignition, ethers } = require("ignition");
const path = require("path");
const fs = require("fs");
const { run } = require("hardhat"); 

async function main() {
    const ignition = new Ignition();
    await ignition.initialize();

    const contractPath = path.join(__dirname, "../../artifacts/contracts/StudyDAO.sol/StudyDAO.json");

    if (!fs.existsSync(contractPath)) {
        console.error("Contract artifact not found. Make sure to compile the contract first.");
        process.exit(1);
    }

    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const contractABI = contractArtifact.abi;
    const contractBytecode = contractArtifact.bytecode;

    const deployer = (await ethers.getSigners())[0];
    console.log(`Deploying contract with the address: ${deployer.address}`);

    if (!process.env.ADMIN_ADDRESS) {
        console.error("ADMIN_ADDRESS environment variable is not defined. Please set it before running the script.");
        process.exit(1);
    }

    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, deployer);

    const constructorParams = [
        process.env.ADMIN_ADDRESS,
    ];

    console.log("Deploying the StudyDAO contract...");

    try {
        const contract = await contractFactory.deploy(...constructorParams);
        console.log("Deployment transaction sent. Waiting for confirmation...");
        await contract.deployed();
        console.log(`StudyDAO contract deployed at address: ${contract.address}`);
    } catch (error) {
        console.error("Error during contract deployment:", error);
        process.exit(1);
    }

    try {
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: constructorParams,
        });
        console.log("Contract verified successfully.");
    } catch (error) {
        console.error("Error during contract verification:", error);
    }

    console.log(`Contract deployed at: ${contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Unexpected error:", error);
        process.exit(1);
    });