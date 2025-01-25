// backend/routes/account.js
const express = require('express');
const {authMiddleware}=require('../middleware')
const {Account} =require('../db')
const {mongoose}=require('mongoose')

//how transaction works on mongodb ; a error comes that transaction only works on mongodb replica 

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer", authMiddleware, async (req, res) => {
    // const session = await mongoose.startSession();

    // session.startTransaction();
    const { amount, to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId });

    if (!account || account.balance < amount) {
        // await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to });

    if (!toAccount) {
        // await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform the transfer
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } })

    // Commit the transaction
    // await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    });
});

module.exports = router;