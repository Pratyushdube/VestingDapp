// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract Counter {

    address public owner;
    mapping(address => VestingSchedule) public vestingSchedules; // Mapping named vestingSchedules
    // Contract for a basic vesting application 

    // Events are crucial for off-chain monitoring and debugging
    event VestingScheduleCreated(address indexed user, uint256 totalAmount, uint256 startTime, uint256 duration, uint256 cliffDuration);
    event ETHClaimed(address indexed user, uint256 amountClaimed);  // Keep track of already claimed amounts.


    struct VestingSchedule{
        uint256 totalAmount;     // Total Amount Vested, in ETH
        uint256 startTime;       // Timestamp when vesting begins
        uint256 duration;        // Total vesting duration in seconds
        uint256 cliffDuration;   // Duration of the cliff period in seconds (before claiming starts)
        uint256 claimedAmount;   // Amount of ETH already claimed by the user (in wei)
        bool exists;             // To check if a schedule has been set for a user

    }

    constructor(){
        owner = msg.sender;     // The one who deployed the contract is the owner
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "Only the owner can create a Vesting Schedule");
        _;          // _; specifies the function that the modifier has been applied to, if we write before then the function would be executed first then modifier checked.
        
    }

    // Allow an admin to create a vesting schedule for a user 
    // (with parameters like total amount, start time, duration, and cliff).
    function createVestingSchedule(address _user, uint256 _duration, uint256 _cliffDuration) public payable onlyOwner {
        // Can only be called by the admin bcoz created custom Access Modifier onlyOwner
        require(_user != address(0), "Invalid address");    // If user is not a valid address
        require(msg.value > 0, "Amount to vest must be greater than zero"); // ETH must be sent to create a vesting schedule
        require(_duration > 0, "Duration must be greater than zero"); // Prevents division by zero later
        require(_cliffDuration <= _duration, "Cliff duration cannot exceed total duration"); // Cliff must be within duration
        
        VestingSchedule storage myVestingSchedule = vestingSchedules[_user];    // Create a new VestingSchedule struct object
        

        require(!vestingSchedules[_user].exists, "Vesting schedule already exists for this user");
        //  Create a Vesting Schedule for the user:   IF not exists already
        myVestingSchedule.totalAmount = msg.value;              // Set the total amount of ETH to vest, in wei to be vested.
        myVestingSchedule.startTime =  block.timestamp;      //Set the start time as blocks timestamp
        myVestingSchedule.cliffDuration = _cliffDuration;  // Set the cliffDuration for the user
        myVestingSchedule.duration = _duration;            // Set the duration of the vesting schedule (in seconds) 
        myVestingSchedule.exists = true; 
        myVestingSchedule.claimedAmount = 0;

        emit VestingScheduleCreated(_user, msg.value, block.timestamp, _duration, _cliffDuration);
    }


    // Allow users to check how much they’ve vested at any point.
    function checkVestedAmount(address _user) view public returns (uint256) {

        // Get the current vested amount from blockchain (Read only)
        
        VestingSchedule storage myVestingSchedule = vestingSchedules[_user];
        require(myVestingSchedule.exists, "No vesting schedule found for this user"); // Ensure schedule exists before checking vestedamount

        if(block.timestamp < (myVestingSchedule.startTime + myVestingSchedule.cliffDuration)){  // If Currently in cliffDuration
            return 0;
        } 
        else if (block.timestamp >= (myVestingSchedule.startTime + myVestingSchedule.duration)) {   // Final Maturity of vested amount
            return (myVestingSchedule.totalAmount - myVestingSchedule.claimedAmount) ;
        } 
        else{                                                                            // After Cliff and before Maturity Duration
            uint256 currDuration = (block.timestamp - myVestingSchedule.startTime);
            uint256 currAmount = currDuration * (myVestingSchedule.totalAmount / myVestingSchedule.duration); 
            
            return currAmount- myVestingSchedule.claimedAmount;
        }

    }

    // Allow users to claim their vested amount.
    function claimBalance(address _user) public {
        // Claim balance from the contract.
        VestingSchedule storage myVestingSchedule = vestingSchedules[_user];
        require(block.timestamp >= (myVestingSchedule.startTime + myVestingSchedule.cliffDuration), "No amount to claim yet, still in cliff");
        
        uint claimableAmount = checkVestedAmount(_user);
        if(claimableAmount > 0){
                myVestingSchedule.claimedAmount += claimableAmount;
                payable(msg.sender).transfer(claimableAmount);
                myVestingSchedule.exists = false;
            }
        else { 
            revert("No amount to claim");
        }
    }

    

}