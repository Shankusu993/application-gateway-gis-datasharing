const express = require('express');
const axios = require('axios');
const { Gateway, Wallets } = require('fabric-network');
const { FileSystemWallet, X509WalletMixin } = Wallets;
const fs = require('fs');
const path = require('path');
const fabricUtilModule = require('./utils/fabric_utils');
const app = express();
const port = 3000;
let contract;

(async function() {
  let start = new Date().getTime();
  contract = await fabricUtilModule.getContract();
  acl_contract = contract.acl;
  drs_contract = contract.drs;
  let end = new Date().getTime();
  let time_taken = end-start
  console.log("time taken = " + time_taken + " milliseconds")
})()

// const contract = fabricUtilModule.getContract();

app.get('/send-request', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/send-response');
    // The data was responded with
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    // No response data, so we raise a dispute
    console.error(error);
    await drs_contract.submitTransaction('RaiseDispute', 'dispute_002', 'Server1', 'Server2', 'Data not received from Server2');

    console.log('Dispute raised successfully');

    res.send("Error occured, dispute raised successfully, " + "error is the following: " + error);
  }
});

app.get('/send-response', (req, res) => {
    const response = 'Hello from Server 1';
    console.log(response);
    res.send(response);
  });

app.post('/respond-dispute', async (req, res) => {
    await fabricUtilModule.RespondToDispute(drs_contract, 'dispute_001', 'The response data');
    console.log('responded to dispute');
    var response = {
      status  : 200,
      success : 'Responded to Dispute Successfully'
    }
    res.send(response)
});

app.get('/get-dispute', async (req, res) => {
  let dispute = await fabricUtilModule.GetDispute(drs_contract, 'dispute_001');
  console.log(dispute);
  res.send(dispute)
});

app.post('/confirm-dispute-resolution', async (req, res) => {
  await fabricUtilModule.ConfirmResolution(drs_contract, 'dispute_001');
  console.log('Dispute resolved successfully');
  var response = {
    status  : 200,
    success : 'Resolved Dispute Successfully'
  }
  res.send(response)
});

app.listen(port, () => {
  console.log(`Server 1 running on port ${port}`);
});
