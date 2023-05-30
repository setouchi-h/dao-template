import * as fs from "fs"
import { VOTING_PERIOD, developmentChains, proposalsFile } from "../helper-hardhat-config"
import { network, ethers, deployments } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"

const index = 0

async function vote(proposalIndex: number) {
    const Governor = await deployments.get("GovernorContract")
    const governor = await ethers.getContractAt("GovernorContract", Governor.address)

    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    const proposalId = proposals[network.config.chainId!][proposalIndex]
    // 0 = Against, 1 = For, 2 = Abstain
    const voteWay = 1
    const reason = "I like a do da cha cha"
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)
    await voteTxResponse.wait(1)

    if (developmentChains.includes(network.name)) {
        // disable voting
        await moveBlocks(VOTING_PERIOD + 1)
    }

    console.log("Voted! Ready to go!")

    const proposalState = await governor.state(proposalId)
    // 4 is success
    console.log(`Current Proposal State: ${proposalState}`)
}

vote(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
