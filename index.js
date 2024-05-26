const express = require('express');
const bodyParser = require('body-parser');
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Express uygulamasını başlatma
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Web3 sağlayıcı ve kontrat ayarları
const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/qV1dWMrg0ozx_N9IfjgNg68dGVN2eczb');

// const contractPath = path.resolve(__dirname, 'build', 'contracts', 'Voting.json');
const contractPath = path.resolve(__dirname, '..', 'e-VotingSystem', 'build', 'contracts', 'Voting.json');
const { abi, networks } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
let votingContract;
let contractAddress;
web3.eth.net.getId().then(networkId => {
    contractAddress = networks[networkId].address;
    votingContract = new web3.eth.Contract(abi, contractAddress); // dışarıda tanımlı olan votingContract'a atama yapıyoruz
}).catch(error => {
    console.log("Error")
    console.error('Error while fetching network id:', error);
});

app.get('/candidates', async (req, res) => {
    try {
        const candidates = await votingContract.methods.getCandidates().call();
        const serializedCandidates = candidates.map(candidate => {
            return {
                name: candidate.name,
                voteCount: candidate.voteCount.toString()
            };
        });
        res.json(serializedCandidates);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/candidatesPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'candidates.html'));
});

app.post('/vote', async (req, res) => {
    try {
        const { candidate, fromAddress, privateKey } = req.body;
        // Web3 kullanarak kullanıcının gönderdiği bilgilerle oy verme işlemi gerçekleştirilir
        const tx = {
            from: fromAddress,
            to: contractAddress,
            data: votingContract.methods.vote(candidate).encodeABI(),
            gas: 2000000
        };
        const gas = await web3.eth.estimateGas(tx);
        const gasPrice = await web3.eth.getGasPrice();
        tx.gas = gas;
        tx.gasPrice = gasPrice;
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
    } catch (error) {
        console.error('Oy verme işlemi sırasında bir hata oluştu:', error);
        res.status(500).json({ success: false, error: error.toString() });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});
app.get('/votePage', (req, res) => {
    res.sendFile(path.join(__dirname, 'voting.html'));
});

// Sunucuyu başlatma
app.listen(port, () => {
    console.log(`Voting app listening at http://localhost:${port}`);
});