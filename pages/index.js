import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [amountToDeposit, setAmountToDeposit] = useState("");
  const [amountToWithdraw, setAmountToWithdraw] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  };

  const connectAccount = async () => {
    try {
      if (!ethWallet) {
        alert("MetaMask wallet is required to connect");
        return;
      }

      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);
        getATMContract();
        getBalance();
        setError(null);
      } else {
        setError("No accounts found.");
      }
    } catch (error) {
      setError("Error connecting to MetaMask: " + error.message);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  };

  const getBalance = async () => {
    try {
      if (atm) {
        setLoading(true);
        const balanceBigNumber = await atm.getBalance();
        const balance = ethers.utils.formatUnits(balanceBigNumber, "ether"); // Convert to string with fixed decimal places
        setBalance(balance);
        setLoading(false);
      }
    } catch (error) {
      setError("Error fetching balance: " + error.message);
      setLoading(false);
    }
  };  

  const deposit = async () => {
    try {
      if (atm) {
        setLoading(true);
        const tx = await atm.deposit(ethers.utils.parseEther(amountToDeposit));
        await tx.wait();
        getBalance();
        addToTransactionHistory("Deposit", parseFloat(amountToDeposit));
        setAmountToDeposit("");
        setLoading(false);
      }
    } catch (error) {
      setError("Error depositing: " + error.message);
      setLoading(false);
    }
  };

  const withdraw = async () => {
    try {
      if (atm) {
        setLoading(true);
        const tx = await atm.withdraw(ethers.utils.parseEther(amountToWithdraw));
        await tx.wait();
        getBalance();
        addToTransactionHistory("Withdraw", -parseFloat(amountToWithdraw));
        setAmountToWithdraw("");
        setLoading(false);
      }
    } catch (error) {
      setError("Error withdrawing: " + error.message);
      setLoading(false);
    }
  };

  const addToTransactionHistory = (action, amount) => {
    const newTransaction = {
      action,
      amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory([newTransaction, ...transactionHistory]);
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
<main className="container">
  <header>
    <h1>Welcome to the Metacrafters ATM!</h1>
  </header>
  {error && <p className="error">{error}</p>}
  {loading && <p>Loading...</p>}
  {!account && (
    <button className="connect-button" onClick={connectAccount}>
      Connect to MetaMask
    </button>
  )}
  {account && (
    <div className="user-info">
      <p>Your Account: {account}</p>
      <p>Your Balance: {balance}</p>
      <div className="input-container">
        <input
          type="text"
          value={amountToDeposit}
          onChange={(e) => setAmountToDeposit(e.target.value)}
          placeholder="Amount to deposit"
        />
        <button className="deposit-btn" onClick={deposit}>Deposit</button>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={amountToWithdraw}
          onChange={(e) => setAmountToWithdraw(e.target.value)}
          placeholder="Amount to withdraw"
        />
        <button className="withdraw-btn" onClick={withdraw}>Withdraw</button>
      </div>
    </div>
  )}
  <div className="transaction-history">
    <h2>Transaction History</h2>
    <ul>
      {transactionHistory.map((transaction, index) => (
        <li key={index}>
          {transaction.action} - {transaction.amount} ETH ({transaction.timestamp})
        </li>
      ))}
    </ul>
  </div>
  <style jsx>{`
    .container {
      text-align: center;
      padding: 20px;
      background-color: #f0f0f0;
    }
    .error {
      color: red;
    }
    .connect-button {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #00FFFF;
      color: white;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
    }
    .user-info {
      margin-top
      : 20px;
    }
    .input-container {
      margin-top: 20px;
    }
    .input-container input {
      padding: 10px;
      margin-right: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    }
    .buttons {
      margin-top: 20px;
    }
    .buttons button {
      margin: 5px;
      padding: 10px 20px;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }
    .deposit-btn {
      background-color: #4CAF50; /* Green */
      color: white;
    }
    .deposit-btn:hover {
      background-color: #45a049;
    }
    .withdraw-btn {
      background-color: #f44336; /* Red */
      color: white;
    }
    .withdraw-btn:hover {
      background-color: #d32f2f;
    }
    .transaction-history {
      margin-top: 30px;
    }
    .transaction-history ul {
      list-style-type: none;
      padding: 0;
    }
    .transaction-history li {
      margin-bottom: 5px;
    }
  `}</style>
</main>
);
}
