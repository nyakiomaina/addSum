solc = require("solc");
fs = require("fs");
Web3 = require("web3");
//set up http provider
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
//read the content of the smart contract
fileContent = fs.readFileSync("add.sol").toString();
console.log(fileContent);
var input = {
    language: "Solidity",
    sources: {
      'add.sol': {
        content: fileContent
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

var output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log("Output: ",output);
ABI = output.contracts["add.sol"]["add"].abi;
bytecode = output.contracts["add.sol"]["add"].evm.bytecode.object;
console.log("Bytecode: ",bytecode);
console.log("ABI ",ABI);

contract = new web3.eth.Contract(ABI);
var defaultAccount;
web3.eth.getAccounts().then((accounts)=>{
    console.log("Accounts: ",accounts);
    defaultAccount = accounts[0];
    console.log("Default Account: ",defaultAccount);
    contract
    .deploy({data:bytecode})
    .send({from: defaultAccount, gas:500000})
    .on("receipt",(receipt)=>{
        console.log("Contract Address: ",receipt.contractAddress);
    })
    .then((addContract)=>{
            addContract.methods.getSum().call((err, sum)=>{
                console.log("Initial Sum: ",sum);
            })

            addContract.methods.sum(4,7).send({ from:defaultAccount}, ()=>{
                addContract.methods.getSum().call((err,sum)=>{
                    console.log("Final Sum: ",sum);

            });

        });
            
    });
});