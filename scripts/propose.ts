// command: hh run scripts/propose.ts --network localhost
import { deployments, ethers, network } from "hardhat"
import {
    NEW_STORE_VALUE,
    FUNC,
    PROPOSAL_DESCRIPTION,
    developmentChains,
} from "../helper-hardhat-config"

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
    await proposeTx.wait(1)

    if (developmentChains.includes(network.name)) {
    }
}
propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
