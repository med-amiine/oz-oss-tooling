// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenizedBond
 * @dev Tokenized bond contract with comprehensive monitoring capabilities
 * for financial institutions using OpenZeppelin OSS Tooling
 */
contract TokenizedBond is ERC20, AccessControl, Pausable, ReentrancyGuard {

    bytes32 public constant MONITOR_ROLE = keccak256("MONITOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    struct PaymentSchedule {
        uint256 dueDate;
        uint256 amount;
        bool paid;
        uint256 paymentType; // 1 = Interest, 2 = Principal
    }

    struct BondDetails {
        uint256 maturityDate;
        uint256 couponRate; // Basis points (e.g., 500 = 5%)
        uint256 faceValue;
        string bondName;
        string bondSymbol;
    }

    // Bond configuration
    BondDetails public bondDetails;
    
    // Payment tracking
    mapping(uint256 => PaymentSchedule) public paymentSchedules;
    uint256 public nextPaymentId;
    
    // Transfer controls
    mapping(address => bool) public whitelistedAddresses;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => uint256) public transferLimits;
    
    // Regulatory controls
    mapping(address => bool) public kycVerified;
    mapping(address => string) public jurisdictions;
    uint256 public maxHoldingLimit;
    
    // Events for monitoring
    event InterestPaymentDue(uint256 indexed paymentId, uint256 dueDate, uint256 amount);
    event PrincipalPaymentDue(uint256 indexed paymentId, uint256 dueDate, uint256 amount);
    event PaymentMade(uint256 indexed paymentId, uint256 amount, address indexed payer);
    event TransferAttempt(address indexed from, address indexed to, uint256 amount, bool blocked);
    event EarlyRedemptionRequested(address indexed holder, uint256 amount);
    event ComplianceViolation(address indexed account, string violationType, string details);
    event BondPaused(address indexed by, string reason);
    event BondUnpaused(address indexed by);
    event WhitelistUpdated(address indexed account, bool whitelisted);
    event BlacklistUpdated(address indexed account, bool blacklisted);
    event TransferLimitUpdated(address indexed account, uint256 limit);

    // Modifiers
    modifier onlyMonitor() {
        require(hasRole(MONITOR_ROLE, msg.sender), "TokenizedBond: monitor role required");
        _;
    }

    modifier onlyTreasury() {
        require(hasRole(TREASURY_ROLE, msg.sender), "TokenizedBond: treasury role required");
        _;
    }

    modifier onlyCompliance() {
        require(hasRole(COMPLIANCE_ROLE, msg.sender), "TokenizedBond: compliance role required");
        _;
    }

    /**
     * @dev Constructor
     * @param _name Bond name
     * @param _symbol Bond symbol
     * @param _faceValue Face value of the bond
     * @param _couponRate Annual coupon rate in basis points
     * @param _maturityDate Maturity date in seconds
     * @param _monitor Monitor address for automated operations
     * @param _treasury Treasury address for payment operations
     * @param _compliance Compliance address for regulatory operations
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _faceValue,
        uint256 _couponRate,
        uint256 _maturityDate,
        address _monitor,
        address _treasury,
        address _compliance
    ) ERC20(_name, _symbol) {
        bondDetails = BondDetails({
            maturityDate: _maturityDate,
            couponRate: _couponRate,
            faceValue: _faceValue,
            bondName: _name,
            bondSymbol: _symbol
        });

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MONITOR_ROLE, _monitor);
        _grantRole(TREASURY_ROLE, _treasury);
        _grantRole(COMPLIANCE_ROLE, _compliance);

        // Initialize payment schedule
        _initializePaymentSchedule();
    }

    /**
     * @dev Initialize payment schedule for the bond
     */
    function _initializePaymentSchedule() internal {
        // Schedule interest payments (semi-annual)
        uint256 interestPaymentAmount = (bondDetails.faceValue * bondDetails.couponRate) / 20000; // Divide by 20000 for semi-annual
        uint256 currentDate = block.timestamp;
        
        for (uint256 i = 0; i < 10; i++) { // 5 years with semi-annual payments
            uint256 paymentDate = currentDate + (i * 180 days);
            if (paymentDate <= bondDetails.maturityDate) {
                paymentSchedules[nextPaymentId] = PaymentSchedule({
                    dueDate: paymentDate,
                    amount: interestPaymentAmount,
                    paid: false,
                    paymentType: 1 // Interest payment
                });
                emit InterestPaymentDue(nextPaymentId, paymentDate, interestPaymentAmount);
                nextPaymentId++;
            }
        }

        // Schedule principal payment at maturity
        paymentSchedules[nextPaymentId] = PaymentSchedule({
            dueDate: bondDetails.maturityDate,
            amount: bondDetails.faceValue,
            paid: false,
            paymentType: 2 // Principal payment
        });
        emit PrincipalPaymentDue(nextPaymentId, bondDetails.maturityDate, bondDetails.faceValue);
        nextPaymentId++;
    }

    /**
     * @dev Override transfer function with compliance checks
     */
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        require(!blacklistedAddresses[to], "TokenizedBond: transfer to blacklisted address");
        require(!blacklistedAddresses[msg.sender], "TokenizedBond: blacklisted sender");
        
        // Check whitelist requirements
        if (!whitelistedAddresses[to] && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            emit TransferAttempt(msg.sender, to, amount, true);
            emit ComplianceViolation(msg.sender, "UNAUTHORIZED_TRANSFER", "Transfer to non-whitelisted address");
            return false;
        }

        // Check transfer limits
        if (transferLimits[msg.sender] > 0 && amount > transferLimits[msg.sender]) {
            emit TransferAttempt(msg.sender, to, amount, true);
            emit ComplianceViolation(msg.sender, "TRANSFER_LIMIT_EXCEEDED", "Amount exceeds transfer limit");
            return false;
        }

        // Check holding limits
        if (balanceOf(to) + amount > maxHoldingLimit && maxHoldingLimit > 0) {
            emit TransferAttempt(msg.sender, to, amount, true);
            emit ComplianceViolation(to, "HOLDING_LIMIT_EXCEEDED", "Would exceed maximum holding limit");
            return false;
        }

        emit TransferAttempt(msg.sender, to, amount, false);
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom function with compliance checks
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        require(!blacklistedAddresses[to], "TokenizedBond: transfer to blacklisted address");
        require(!blacklistedAddresses[from], "TokenizedBond: blacklisted sender");
        
        // Check whitelist requirements
        if (!whitelistedAddresses[to] && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            emit TransferAttempt(from, to, amount, true);
            emit ComplianceViolation(from, "UNAUTHORIZED_TRANSFER", "Transfer to non-whitelisted address");
            return false;
        }

        // Check transfer limits
        if (transferLimits[from] > 0 && amount > transferLimits[from]) {
            emit TransferAttempt(from, to, amount, true);
            emit ComplianceViolation(from, "TRANSFER_LIMIT_EXCEEDED", "Amount exceeds transfer limit");
            return false;
        }

        // Check holding limits
        if (balanceOf(to) + amount > maxHoldingLimit && maxHoldingLimit > 0) {
            emit TransferAttempt(from, to, amount, true);
            emit ComplianceViolation(to, "HOLDING_LIMIT_EXCEEDED", "Would exceed maximum holding limit");
            return false;
        }

        emit TransferAttempt(from, to, amount, false);
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Make a payment (called by monitor or treasury)
     */
    function makePayment(uint256 paymentId) external onlyMonitor nonReentrant {
        PaymentSchedule storage payment = paymentSchedules[paymentId];
        require(!payment.paid, "TokenizedBond: payment already made");
        require(block.timestamp >= payment.dueDate, "TokenizedBond: payment not due yet");

        payment.paid = true;
        emit PaymentMade(paymentId, payment.amount, msg.sender);
    }

    /**
     * @dev Request early redemption
     */
    function requestEarlyRedemption(uint256 amount) external whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "TokenizedBond: insufficient balance");
        require(whitelistedAddresses[msg.sender], "TokenizedBond: only whitelisted addresses can redeem early");
        
        emit EarlyRedemptionRequested(msg.sender, amount);
    }

    /**
     * @dev Pause bond operations (emergency function)
     */
    function pauseBond(string memory reason) external onlyCompliance {
        _pause();
        emit BondPaused(msg.sender, reason);
    }

    /**
     * @dev Unpause bond operations
     */
    function unpauseBond() external onlyCompliance {
        _unpause();
        emit BondUnpaused(msg.sender);
    }

    /**
     * @dev Update whitelist (compliance function)
     */
    function updateWhitelist(address account, bool whitelisted) external onlyCompliance {
        whitelistedAddresses[account] = whitelisted;
        emit WhitelistUpdated(account, whitelisted);
    }

    /**
     * @dev Update blacklist (compliance function)
     */
    function updateBlacklist(address account, bool blacklisted) external onlyCompliance {
        blacklistedAddresses[account] = blacklisted;
        emit BlacklistUpdated(account, blacklisted);
    }

    /**
     * @dev Update transfer limits (compliance function)
     */
    function updateTransferLimit(address account, uint256 limit) external onlyCompliance {
        transferLimits[account] = limit;
        emit TransferLimitUpdated(account, limit);
    }

    /**
     * @dev Update KYC verification status
     */
    function updateKYCStatus(address account, bool verified) external onlyCompliance {
        kycVerified[account] = verified;
    }

    /**
     * @dev Update jurisdiction information
     */
    function updateJurisdiction(address account, string memory jurisdiction) external onlyCompliance {
        jurisdictions[account] = jurisdiction;
    }

    /**
     * @dev Update maximum holding limit
     */
    function updateMaxHoldingLimit(uint256 limit) external onlyCompliance {
        maxHoldingLimit = limit;
    }

    /**
     * @dev Get payment schedule information
     */
    function getPaymentSchedule(uint256 paymentId) external view returns (
        uint256 dueDate,
        uint256 amount,
        bool paid,
        uint256 paymentType
    ) {
        PaymentSchedule storage payment = paymentSchedules[paymentId];
        return (payment.dueDate, payment.amount, payment.paid, payment.paymentType);
    }

    /**
     * @dev Get bond details
     */
    function getBondDetails() external view returns (
        uint256 maturityDate,
        uint256 couponRate,
        uint256 faceValue,
        string memory bondName,
        string memory bondSymbol
    ) {
        return (
            bondDetails.maturityDate,
            bondDetails.couponRate,
            bondDetails.faceValue,
            bondDetails.bondName,
            bondDetails.bondSymbol
        );
    }

    /**
     * @dev Check if address is whitelisted
     */
    function isWhitelisted(address account) external view returns (bool) {
        return whitelistedAddresses[account];
    }

    /**
     * @dev Check if address is blacklisted
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklistedAddresses[account];
    }

    /**
     * @dev Get transfer limit for address
     */
    function getTransferLimit(address account) external view returns (uint256) {
        return transferLimits[account];
    }

    /**
     * @dev Check KYC verification status
     */
    function isKYCVerified(address account) external view returns (bool) {
        return kycVerified[account];
    }

    /**
     * @dev Get jurisdiction for address
     */
    function getJurisdiction(address account) external view returns (string memory) {
        return jurisdictions[account];
    }

    /**
     * @dev Get total number of payments
     */
    function getTotalPayments() external view returns (uint256) {
        return nextPaymentId;
    }

    /**
     * @dev Get overdue payments
     */
    function getOverduePayments() external view returns (uint256[] memory) {
        uint256[] memory overdue = new uint256[](nextPaymentId);
        uint256 count = 0;
        
        for (uint256 i = 0; i < nextPaymentId; i++) {
            PaymentSchedule storage payment = paymentSchedules[i];
            if (!payment.paid && block.timestamp > payment.dueDate) {
                overdue[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = overdue[i];
        }
        
        return result;
    }

    /**
     * @dev Mint tokens (only for treasury role)
     */
    function mint(address to, uint256 amount) external onlyTreasury {
        _mint(to, amount);
    }
} 