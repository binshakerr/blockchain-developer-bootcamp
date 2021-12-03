import { tokens, ETHER_ADDRESS, ether } from './helpers'

require('chai')
.use(require('chai-as-promised'))
.should()

const Exchange = artifacts.require("./Exchange");
const Token = artifacts.require("./Token");

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {

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

    describe('withdrawing tokens', () => {

        let result 
        let amount

        describe('success', () => {

            beforeEach(async () => {
                amount = tokens(10)
                await token.approve(exchange.address, amount, { from: user1})
                await exchange.depositToken(token.address, amount, { from: user1})
                result = await exchange.withdrawToken(token.address, amount, { from: user1})
            })

            it('withdraw token funds', async () => {
                const balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
            })

            it('emits a withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(token.address, 'token is correct')
                event.user.should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            })
        })

        describe('failure', () => {
            it('fails for insufficient balance', async () => {
                await exchange.withdrawToken(token.address, amount, { from: user1}).should.be.rejected
            })

            it('rejects ether withdraws', async () => {
                await exchange.withdrawToken(ETHER_ADDRESS, amount, { from: user1}).should.be.rejected
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

    describe('withdrawing ether', () => {

        let result 
        let amount 

        beforeEach(async () => {
            amount = ether(1)
            await exchange.depositEther({from: user1, value: amount})
        })

        describe('success', () => {

            beforeEach(async () => {
                result = await exchange.withdrawEther(amount, { from: user1 })
            })

            it('withdraw ether funds', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal('0')
            })

            it('emits a withdraw event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token is correct')
                event.user.should.equal(user1, 'user is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            })
        })

        describe('failure', () => {
            it('rejects withdrwas for insufficient balances', async () => {
                await exchange.withdrawEther(ether(100), { from: user1}).should.be.rejected
            })
        })
    })

    describe('fallback', () => {
        it('reverts when ether is sent', async () => {
            await exchange.sendTransaction( { value: 1, from: user1 }).should.be.rejected
        })
    })

    describe('checking balance', () => {
        beforeEach(async () => {
            await exchange.depositEther({ from: user1, value: ether(1)})
        })
        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
            result.toString().should.equal(ether(1).toString())
        })
    })

    describe('making orders', () => {
        let result 

        beforeEach(async () => {
            result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })

        it('tracks the newly created order', async () => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')

            const order = await exchange.orders('1')
            order.id.toString().should.equal('1', "id is correct")
            order.user.should.equal(user1, "user is correct")
            order.tokenGet.should.equal(token.address, "tokenGet is correct")
            order.amountGet.toString().should.equal(tokens(1).toString(), "amount get is correct")
            order.tokenGive.should.equal(ETHER_ADDRESS, "token give is correct")
            order.amountGive.toString().should.equal(ether(1).toString(), "amount give is correct")
            order.timestamp.toString().length.should.be.at.least(1, "timestamp is correct")
        })

        it('emits a order event', async () => {
            const log = result.logs[0]
            log.event.should.equal('Order')
            const event = log.args
            event.id.toString().should.equal('1', "id is correct")
            event.user.should.equal(user1, "user is correct")
            event.tokenGet.should.equal(token.address, "tokenGet is correct")
            event.amountGet.toString().should.equal(tokens(1).toString(), "amount get is correct")
            event.tokenGive.should.equal(ETHER_ADDRESS, "token give is correct")
            event.amountGive.toString().should.equal(ether(1).toString(), "amount give is correct")
            event.timestamp.toString().length.should.be.at.least(1, "timestamp is correct")
        })
    })

    describe('order actions', () => {

        beforeEach(async () => {
            await exchange.depositEther( { from: user1, value: ether(1)})
            await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
        })

        describe('cancelling orders', () => {
            let result 

            beforeEach(async () => {
                result = await exchange.cancelOrder('1', { from: user1})
            })

            describe('success', ()=> {
                it('updates cancelled orders', async () => {
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })

                it('emits a cancel event', async () => {
                    const log = result.logs[0]
                    log.event.should.equal('Cancel')
                    const event = log.args
                    event.id.toString().should.equal('1', "id is correct")
                    event.user.should.equal(user1, "user is correct")
                    event.tokenGet.should.equal(token.address, "tokenGet is correct")
                    event.amountGet.toString().should.equal(tokens(1).toString(), "amount get is correct")
                    event.tokenGive.should.equal(ETHER_ADDRESS, "token give is correct")
                    event.amountGive.toString().should.equal(ether(1).toString(), "amount give is correct")
                    event.timestamp.toString().length.should.be.at.least(1, "timestamp is correct")
                })
            })

            describe('failure', ()=> {
                it('rejects invalid user ids', async() => {
                    const invalidOrderID = 999999
                    await exchange.cancelOrder(invalidOrderID, { from: user1 }).should.be.rejected
                })

                it('rejects unauthorized cancellations', async() => {
                    await exchange.cancelOrder('1', {from: user2 }).should.be.rejected
                })
            })
        })
    })
})