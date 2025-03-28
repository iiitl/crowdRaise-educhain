const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying StudyDAO contract...");

    const StudyDAO = await ethers.getContractFactory("StudyDAO");

    const studyDAO = await StudyDAO.deploy();
    await studyDAO.waitForDeployment();

    const contractAddress = await studyDAO.getAddress();
    console.log(`StudyDAO deployed to: ${contractAddress}`);

    saveFrontendFiles(studyDAO, "StudyDAO");
}

function saveFrontendFiles(contract, name) {
    const contractsDir = path.join(__dirname, "../src/contract_data/");

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(contractsDir, `${name}-address.json`),
        JSON.stringify({ address: contract.target }, null, 2)
    );

    const contractArtifact = artifacts.readArtifactSync(name);
    fs.writeFileSync(
        path.join(contractsDir, `${name}.json`),
        JSON.stringify(contractArtifact, null, 2)
    );

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
