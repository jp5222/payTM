const express=require('express');
const router=express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');// for hashing and salting
const {z}=require('zod');
const {user,Account}=require('../db')
import { JWT_SECREST } from '../config';
import {authMiddleware} from '../middleware'

const reqbody=z.object({
    username:z.string().min(6).max(50),
    firstName:z.string().min(3).max(25),
    lastName:z.string().min(3).max(25),
    password:z.string().min(6).max(20)
    .refine((password)=> /[a-z]/.test(password),{
        message:"user must provide a small alphbet charcter",
    })
    .refine((password)=>/[A-Z]/.test(password),{
        message:"user must provide a capital alphbet charcter",
    })
    .refine((password)=>/[0-9]/.test(password),{
        message:"user must provide a digit",
    })
    .refine((password)=>/[!@#$%^&*~`?/\\]/.test(password),{
        message:"user must provide a special charcter"
    })
    
})

router.post('/signup',async (req,res)=>{
    const bodyparse  =  reqbody.safeParse(req.body)
    if(!bodyparse.success){
        res.status(400).json({
            message:"invalid data given",
            error:bodyparse.error.issues[0].message,
        })
        return 
    }
    
    try {
        const username = req.body.username;
        const firstName = req.body.firstName;
        const lastName=req.body.lastName;
        const password = req.body.password;
        
        const hashedpass = await bcrypt.hash(password, 5); //hashed password
        
        const User=await user.create({
            username:username,
            firstName: firstName ,
            lastName:lastName,
            password: hashedpass
        })
        const userId=await User._id;
        await Account.create({
            userId,
            balance:1000
        })
        
        res.status(200).json({
            message: "you are signed up "
        })
        
    } catch (e) {
        res.status(404).json({
            message: "User already exists"
        })
    }
})
router.post('/signin',async (req,res)=>{
    const password = req.body.password;
    const username = req.body.username;
    const founduser = await user.findOne({
        username
    })

    const ress = await bcrypt.compare(password, founduser.password);
    
    if (founduser && ress) {
        let token = jwt.sign({
            _id: founduser._id.toString()
        }, JWT_SECREST)
        res.send({
            token: token
        })
    } else {
        res.status(404).send({
            message: "invalid credientals"
        })
    }
})
router.put('/update', authMiddleware,async (req,res)=>{
    const bodyparse  =  reqbody.safeParse(req.body)
    if(!bodyparse.success){
        res.status(400).json({
            message:"invalid data given",
            error:bodyparse.error.issues[0].message,
        })
        return 
    }
    await user.updateOne({_id:req.userId},req.body);

    res.json({
        message: "Updated successfully"
    })

})

router.get('/bulk',async (req,res)=>{
    const filter = req.query.filter || "";

    const Users = await user.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })
    res.json({
        User: Users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports=router;