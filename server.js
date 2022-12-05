const http = require('http');
const express = require('express')

const app = express()
const server = http.createServer()








const PORT = process.env.PORT || 3000

server.listen(PORT, ()=>{
    console.log(`${PORT}`);
})