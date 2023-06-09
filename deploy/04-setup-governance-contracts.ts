import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
// @ts-ignore
import { ethers } from "hardhat"
import { ADDRESS_ZERO } from "../helper-hardhat-config"

const setupGovernanceContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre
    const { log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const governorContract = await get("GovernorContract")
    const governor = await ethers.getContractAt("GovernorContract", governorContract.address)
    const timeLockContract = await get("TimeLock") // deployer call the contract
    const timeLock = await ethers.getContractAt("TimeLock", timeLockContract.address)

    log("Setting up roles...")
    const proposerRole = await timeLock.PROPOSER_ROLE()
    const executorRole = await timeLock.EXECUTOR_ROLE()
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timeLock.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO) // everyone can execute
    await executorTx.wait(1)
    const revokeTx = await timeLock.revokeRole(adminRole, deployer) // deployerの権限を剥奪
    await revokeTx.wait(1)
    // Now, anything the timelock wants to do has to go through the governance process!

    log("-------------------------------------------------")
}

export default setupGovernanceContracts

setupGovernanceContracts.tags = ["all"]
