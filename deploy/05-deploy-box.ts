import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { ethers } from "hardhat"

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    log("Deploying Box...")
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
    })

    const timeLockContract = await get("TimeLock")
    const timeLock = await ethers.getContractAt("TimeLock", timeLockContract.address)
    const boxContract = await ethers.getContractAt("Box", box.address)
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)
    await transferOwnerTx.wait(1)
    log("YOU DUN IT!!!")
}

export default deployBox

deployBox.tags = ["all", "box"]
