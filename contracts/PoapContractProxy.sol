// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract PoapContractProxy {
    address public implementation;
    address public admin; 
    constructor(address _implementation) {
        implementation = _implementation;
        admin = msg.sender; 
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Solo el administrador puede realizar esta accion");
        _;
    }

    receive() external payable {}

    fallback() external payable {
        address _impl = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), _impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    function upgradeImplementation(address _newImplementation) external onlyAdmin {
        implementation = _newImplementation;
    }

    function changeAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }
}
