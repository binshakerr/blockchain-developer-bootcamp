const { resolve } = require("any-promise");
const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
const tokens = (n) => ether(n)
const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");
const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {
    
    try {        
        console.log('seed exchange script is running...')

        //fetch accounts from wallet
        const accounts = await web3.eth.getAccounts()

        //fetch deployed token
        const token = await Token.deployed()
        console.log('Token fetched', token.address)

        //fetch deployed exchange
        const exchange = await Exchange.deployed()
        console.log('Exchange fetched', exchange.address)

        //give tokens to account1
        const sender = accounts[0]
        const receiver = accounts[1]
        let amount = web3.utils.toWei('10000', 'ether') //10000 token
        await token.transfer(receiver, amount, { from: sender })
        console.log(`Transfered ${amount} tokens from ${sender} to ${receiver}`)

        //setup exchange users
        const user1 = accounts[0]
        const user2 = accounts[1]

        //user1 deposit ether
        amount = 1
        await exchange.depositEther({from: user1, value: ether(amount)})
        console.log(`Deposited ${amount} ether from ${user1}`)

        //user2 approves tokens
        amount = 10000
        await token.approve(exchange.address, tokens(amount), { from: user2 })
        console.log(`Approved ${amount} tokens from ${user2}`)

        //user2 deposit tokens
        await exchange.depositToken(token.address, tokens(amount), {from: user2})
        console.log(`Deposited ${amount} tokens from ${user2}`)

        //seed a cancelled order
        //==================================================================================//

        //user1 makes ordet to get tokens
        let result 
        let orderID
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
        console.log(`Made order from ${user1}`)

        //user1 cancels order
        orderID = result.logs[0].args.id
        await exchange.cancelOrder(orderID, { from: user1 })
        console.log(`Cancelled order from ${user1}`)


        //seed filled order
        //==================================================================================//

        //user1 makes order
        result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1})
        console.log(`Made order from ${user1}`)

        //user2 fills order
        orderID = result.logs[0].args.id
        await exchange.fillOrder(orderID, { from: user2 })
        console.log(`Filled order from ${user2}`)

        //wait 1 second
        await wait(1)
        

        //user1 makes another order
        result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), { from: user1})
        console.log(`Made order from ${user1}`)

        //user2 fills order
        orderID = result.logs[0].args.id
        await exchange.fillOrder(orderID, { from: user2 })
        console.log(`Filled order from ${user2}`)

        //wait 1 second
        await wait(1)

        //user1 makes final order
        result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), { from: user1})
        console.log(`Made order from ${user1}`)

        //user2 fills order
        orderID = result.logs[0].args.id
        await exchange.fillOrder(orderID, { from: user2 })
        console.log(`Filled order from ${user2}`)

         //wait 1 second
         await wait(1)



         //seed open orders
         //========================================================================//

        //user1 makes 10 orders
        for(let i=1;i<=10;i++){
            result = await exchange.makeOrder(token.address, tokens(10*i), ETHER_ADDRESS, ether(0.01), { from: user1})
            console.log(`Made order from ${user1}`)
            await wait(1)
        }

        //user2 makes 10 orders
        for(let i=1;i<=10;i++){
            result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10*i), { from: user2})
            console.log(`Made order from ${user2}`)
            await wait(1)
        }
    }

    catch(error) {
        console.log(error)
    }

    callback()
}