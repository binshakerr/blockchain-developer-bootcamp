pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Token {

    using SafeMath for uint;

    //variables     
    string public name = 'Eslam Token';
    string public symbol = 'ESS';
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf; 

    //Events
    event Transfer(address indexed from, address indexed to, uint256 value);


    constructor() {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0)); //valid address
        require(balanceOf[msg.sender] >= _value); // enough balance
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

}
