// SPDX-License-Identifier: MIT

pragma solidity >=0.8.14;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 

contract DevToken is ERC20{

    mapping(address => uint256) balances;

    constructor() ERC20("DevToken", "DevToken") {
    }

    function claim(address claimer, uint amount) public {
        _mint(claimer, amount);
    }
    
}
