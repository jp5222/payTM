const express=require('express');
const router=express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');// for hashing and salting
const {z}=require('zod');
const {user}=require('../db')

module.exports=router;
app.post('/signup',async (req,res)=>{
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
    
        await user.create({
            username:username,
            firstName: firstName ,
            lastName:lastName,
            password: hashedpass
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