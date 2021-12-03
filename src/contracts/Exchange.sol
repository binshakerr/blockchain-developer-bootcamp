pragma solidity ^0.8.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract Exchange {
    using SafeMath for uint256;

    //variables
    address public feeAccount; // the account that recieves exchange fees
    uint256 public feePercent; // fee percentage
    address constant ETHER = address(0); // store ether in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping (uint256 => bool) public orderCancelled;
    mapping (uint256 => bool) public orderFilled;

    //Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade (
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public payable {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    fallback() external {
        revert();
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender); //my order
        require(_order.id == _id); //correct id 
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
    }

    function fillOrder(uint256 _id) public {
      require(_id > 0 && _id <= orderCount);
      require(!orderFilled[_id]);
      require(!orderCancelled[_id]);
      _Order storage _order = orders[_id];
      _trade(_order);
      orderFilled[_order.id] = true;
    }

    function _trade(_Order storage _order) internal {
        //fee paid by user who fill the order (msg.sender)
        //fee deducted from amountGet
        uint256 _feeAmount = _order.amountGive.mul(feePercent).div(100);

        //execute trade 
        tokens[_order.tokenGet][msg.sender] = tokens[_order.tokenGet][msg.sender].sub(_order.amountGet.add(_feeAmount));
        tokens[_order.tokenGet][_order.user] = tokens[_order.tokenGet][_order.user].add(_order.amountGet);
        tokens[_order.tokenGet][feeAccount] = tokens[_order.tokenGet][feeAccount].add(_feeAmount);
        tokens[_order.tokenGive][_order.user] = tokens[_order.tokenGive][_order.user].sub(_order.amountGive);
        tokens[_order.tokenGive][msg.sender] = tokens[_order.tokenGive][msg.sender].add(_order.amountGive);

        //emit trade event
        emit Trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, msg.sender, block.timestamp);
    }

}


struct _Order {
    uint256 id;
    address user;
    address tokenGet;
    uint256 amountGet;
    address tokenGive;
    uint256 amountGive;
    uint256 timestamp;
}
