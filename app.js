const express=require("express");
const http=require("http")
const rl=require('readline')
const crypto=require("crypto")
const app= express();
const server=http.createServer(app)
const socket=require('socket.io')
const io=socket(server);
io.on("connection",(socket)=>{
    console.log(`client with id ${socket.id}.connected`)
    const readline=rl.createInterface({
        input:process.stdin,
        output:process.stdout
    });
    readline.question("",(data)=>{
        socket.emit("data",data)
    })
    const {publicKey,privateKey}=crypto.generateKeyPairSync("rsa",{
        modulusLength:2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          }
    })
    console.log("Server public key",publicKey)
    socket.emit("ServerPublicKey",publicKey)
    socket.on("ClientPublicKey",(publicKey)=>{
        console.log("Received Public key:",publicKey)
    
    const clientPublicKey=crypto.createPublicKey(publicKey)
    readline.on('line',(data)=>{
        const encryptedMessage=crypto.publicEncrypt({
            key:clientPublicKey,
            oaepHash:"sha1"
        },
        Buffer.from(data))
        console.log("Send Encrypted Message",encryptedMessage)
        socket.emit("encryptedmsg",encryptedMessage)
    })
    
    })
    socket.on('encryptedmsg',(data)=>{
        console.log("Received Encrypted Message:",data)
        const decryptedMessage=crypto.privateDecrypt({
            key:privateKey,
            oaepHash:"sha1"
        },
        Buffer.from(data))
        console.log("Decrypted Message:",decryptedMessage.toString())
    })
    
    socket.on('data',(data)=>{
        console.log(data)
    })
    
    socket.on("disconnect",()=>{
        console.log("client disconected")
    })
    
})
server.listen(3000,()=>{
    console.log("Server is listening")
})

