import { tokens } from './helpers'

require('chai')
.use(require('chai-as-promised'))
.should()

const Token = artifacts.require("./Token");

contract('Token', ([deployer, reciever]) => {

    let token
    const name = 'Eslam Token'
    const symbol = 'ESS'
    const decimals = '18'
    const totalSupply = tokens(1000000)

    beforeEach(async ()=> {
        token = await Token.new()
    })

    describe('deployment', () => {

        it('Tracks the name', async () => {
            const result = await token.name()
            result.should.equal(name)
        })

        it('Tracks the symbol', async () => {
            const result = await token.symbol()
            result.should.equal(symbol)
        })

        it('Tracks the decimals', async () => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
        })

        it('Tracks the total supply', async () => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply.toString())
        })

        it('Assigns total supply to the balance', async () => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply.toString())
        })
    })


    describe('sending tokens', () => {
        let amount
        let result 

        beforeEach(async ()=> {
            amount = tokens(100)
            result = await token.transfer(reciever, amount, { from: deployer })
        })

        it('transfer token balance', async () => {
            let balanceOf
            balanceOf = await token.balanceOf(deployer)
            balanceOf.toString().should.equal(tokens(999900).toString())
            balanceOf = await token.balanceOf(reciever)
            balanceOf.toString().should.equal(tokens(100).toString())
        })

        it('emits a transfer event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Transfer')
            const event = log.args
            event.from.should.equal(deployer, 'sender is correct')
            event.to.should.equal(reciever, 'reciever is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')

        })
    })
})