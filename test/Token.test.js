import { tokens, EVM_REVERT } from './helpers'

require('chai')
.use(require('chai-as-promised'))
.should()

const Token = artifacts.require("./Token");

contract('Token', ([deployer, reciever, exchange]) => {

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

        describe('Success', async () => {
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


        describe('Failure', async () => {
            it('rejects insufficient balance', async () => {
                let invalidAmout
                
                // transfer amount greater than total supply
                invalidAmout = tokens(100000000) //100 million
                await token.transfer(reciever, invalidAmout, { from: deployer }).should.be.rejectedWith(EVM_REVERT);

                //attemp transfer when you have none
                invalidAmout = tokens(10)
                await token.transfer(deployer, invalidAmout, { from: reciever}).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipients', async () => {
                //address 0 (wrong address)
                await token.transfer(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })

    })

    describe('approving tokens', () => {
        let result
        let amount 

        beforeEach(async () => {
            amount = tokens(100)
            result = await token.approve(exchange, amount, { from: deployer})
        })

        describe('Success', () => {
            it('allocate an allowance for delegated token spending on exchange', async () => {
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(amount.toString())
            })

            it('emits an approval event', async () => {
                const log = result.logs[0]
                log.event.should.equal('Approval')
                const event = log.args
                event.owner.should.equal(deployer, 'owner is correct')
                event.spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(amount.toString(), 'value is correct')
    
            })
        })

        describe('Failure', () => {
            it('rejects invalid recipients', async () => {
                //address 0 (wrong address)
                await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })
    })

    describe('delegated token transfers', () => {
        let amount
        let result 

        describe('Success', async () => {

            beforeEach(async () => {
                amount = tokens(100)
                await token.approve(exchange, amount, { from: deployer})
            })

            beforeEach(async ()=> {
                result = await token.transferFrom(deployer, reciever, amount, { from: exchange })
            })
    
            it('transfer token balance', async () => {
                let balanceOf
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                balanceOf = await token.balanceOf(reciever)
                balanceOf.toString().should.equal(tokens(100).toString())
            })

            it('resets the allowance', async () => {
               const allowance = await token.allowance(deployer, exchange)
               allowance.toString().should.equal('0')
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


        describe('Failure', async () => {
            it('rejects insufficient balance', async () => {                
                // transfer amount greater than total supply
                const invalidAmout = tokens(100000000) //100 million
                await token.transferFrom(deployer, reciever, invalidAmout, { from: exchange }).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recipients', async () => {
                //address 0 (wrong address)
                await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected;
            })
        })

    })
})