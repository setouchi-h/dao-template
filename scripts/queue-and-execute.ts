import {
    FUNC,
    MIN_DELAY,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    developmentChains,
} from "../helper-hardhat-config"
import { ethers, deployments, network } from "hardhat"
import { moveTime } from "../utils/move-time"
import { moveBlocks } from "../utils/move-blocks"

export async function queueAndExecute() {
    const args = [NEW_STORE_VALUE]
    const Box = await deployments.get("Box")
    const box = await ethers.getContractAt("Box", Box.address)
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))

    const Governor = await deployments.get("GovernorContract")
    const governor = await ethers.getContractAt("GovernorContract", Governor.address)
    console.log("Queueing...")
    const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)

    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("Executing...")
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash
    )
    await executeTx.wait(1)

    const boxNewValue = await box.retrieve()
    console.log(`New Box Value: ${boxNewValue.toString()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
