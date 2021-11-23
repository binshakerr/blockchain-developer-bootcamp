pragma solidity ^0.8.0;

import './Token.sol';
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Exchange {

    using SafeMath for uint;

    //variables
    address public feeAccount; // the account that recieves exchange fees
    uint256 public feePercent; // fee percentage
    address constant ETHER = address(0); // store ether in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;

    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount); 
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);  
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    fallback() external {
        revert();
    }
}