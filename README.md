# Module2_Avalanche

Sure, here's a README file that explains how to set up and use the provided smart contract and frontend application.

```markdown
# Metacrafters ATM DApp

This project is a decentralized application (DApp) that simulates an ATM, allowing the owner to deposit and withdraw ETH. The DApp is built using Solidity for the smart contract and React for the frontend.

## Prerequisites

To run this project, you need to have the following installed:

- Node.js and npm
- Hardhat
- MetaMask extension in your browser

## Smart Contract

The smart contract is written in Solidity and allows only the owner to deposit and withdraw funds.

### Contract: Assessment.sol

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        require(msg.sender == owner, "You are not the owner of this account");

        balance += _amount;

        assert(balance == _previousBalance + _amount);

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        emit Withdraw(_withdrawAmount);
    }
}
```

### Deploying the Contract

1. Initialize Hardhat project:

    ```bash
    npx hardhat
    ```

2. Create a script to deploy the contract in `scripts/deploy.js`:

    ```javascript
    async function main() {
        const Assessment = await ethers.getContractFactory("Assessment");
        const assessment = await Assessment.deploy(0); // Initial balance
        await assessment.deployed();
        console.log("Assessment deployed to:", assessment.address);
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

3. Run the deployment script:

    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```

## Frontend

The frontend is built using React and ethers.js to interact with the deployed smart contract.

### Setting Up the Frontend

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a file `artifacts/contracts/Assessment.sol/Assessment.json` and add the ABI of the deployed contract.

3. Update the contract address in `index.js`:

    ```javascript
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    ```

### Running the Frontend

1. Start the development server:

    ```bash
    npm run dev
    ```

2. Open the browser and go to `http://localhost:3000`.

### Using the DApp

1. Connect your MetaMask wallet.
2. Deposit or withdraw ETH (only the owner can perform these actions).
3. View the transaction history and balance.
