// command: hh run scripts/propose.ts --network localhost
import { deployments, ethers, network } from "hardhat"
import {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    developmentChains,
    VOTING_DELAY,
    proposalsFile,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import * as fs from "fs"

export async function propose(args: any[], functionToCall: string, proposalDescrition: string) {
    const Governor = await deployments.get("GovernorContract")
    const governor = await ethers.getContractAt("GovernorContract", Governor.address)
    const Box = await deployments.get("Box")
    const box = await ethers.getContractAt("Box", Box.address)
    const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
    console.log(`Proposing Description: \n ${proposalDescrition}`)
    const proposeTx = await governor.propose(
        [box.address],
        [0],
        [encodedFunctionCall],
        proposalDescrition
    )
    const proposeReceipt = await proposeTx.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1)
    }

    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    // save the proposalId to proposals.json
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
    proposals[network.config.chainId!.toString()].push(proposalId.toString())
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals))

    // The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`)
    // The block number the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
