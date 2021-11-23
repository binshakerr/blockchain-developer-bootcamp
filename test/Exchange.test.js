import { tokens, ETHER_ADDRESS, ether } from './helpers'

require('chai')
.use(require('chai-as-promised'))
.should()

const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

contract('Exchange', ([deployer, feeAccount, user1]) => {

    let exchange
    let token 
    const feePercent = 10

    beforeEach(async ()=> {
        token = await Token.new()
        token.transfer(user1, tokens(100), {from: deployer})

        exchange = await Exchange.new(feeAccount, feePercent)
    })

    describe('deployment', () => {
        it('tracks the fee account', async () => {
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })

        it('tracks the fee percent', async () => {
            const result = await exchange.feePercent()
            result.toString().should.equal(feePercent.toString())
        })
    })

    describe('depositing tokens', () => {

        let result 
        let amount

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1})
                result = await exchange.depositToken(token.address, amount, { from: user1})
            })

            it('tracks token deposit', async () => {
                let balance
                //check exchange token balance
                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(amount.toString())
                //check tokens on exchange
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token is correct')
                event.user.should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })

        describe('failure', () => {
            it('fails when no tokens are approved', async () => {
                await exchange.depositToken(token.address, amount, { from: user1}).should.be.rejected
            })

            it('rejects ether deposits', async () => {
                await exchange.depositToken(ETHER_ADDRESS, amount, { from: user1}).should.be.rejected
            })
        })
    })


    describe('depositing ether', () => {

        let result 
        let amount 

        describe('success', () => {

            beforeEach(async () => {
                amount = ether(1)
                result = await exchange.depositEther({ from: user1, value: amount })
            })

            it('tracks ether deposit', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a deposit event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token is correct')
                event.user.should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })
    })

    describe('fallback', () => {
        it('reverts when ether is sent', async () => {
            await exchange.sendTransaction( { value: 1, from: user1 }).should.be.rejected
        })
    })
})