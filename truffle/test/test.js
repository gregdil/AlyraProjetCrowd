const Staking = artifacts.require("Staking");
const DevToken = artifacts.require("DevToken");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");

contract("Staking", (accounts) => {
  const owner = accounts[0];
  const staker = accounts[1];
  const newStaker = accounts[2];
  const oldStaker = accounts[3];
  const nonStaker = accounts[4];
  const annualRewardRate = new BN(150);
  const cooldown = new BN(10);
  const minimumReward = new BN(0);

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let StakingInstance;

  // ----------- ACTIVE POOL --------------//

  describe("Active Pool", () => {
    let dateOfFirstStackForNewStaker;
    let dateOfFirstStackForStaker;
    let dateOfFirstStackForOldStaker;
    let dateOfLastStackForNewStaker;
    let dateOfLastStackForStaker;
    let dateOfLastStackForOldStaker;
    before(async () => {
      let tokenContract = await DevToken.deployed();
      let tokenAddress = tokenContract.address;
      StakingInstance = await Staking.new(
        annualRewardRate,
        cooldown,
        minimumReward,
        tokenAddress,
        { from: owner }
      );
      await StakingInstance.stake({
        from: newStaker,
        value: web3.utils.toWei("5", "ether"),
        gas: 1000000,
      });

      dateOfFirstStackForNewStaker = Date.now() / 1000;
      dateOfLastStackForNewStaker = Date.now() / 1000;

      await StakingInstance.stake({
        from: staker,
        value: web3.utils.toWei("10", "ether"),
        gas: 1000000,
      });

      dateOfFirstStackForStaker = Date.now() / 1000;

      await StakingInstance.stake({
        from: staker,
        value: web3.utils.toWei("10", "ether"),
        gas: 1000000,
      });

      dateOfLastStackForStaker = Date.now() / 1000;

      await StakingInstance.stake({
        from: oldStaker,
        value: web3.utils.toWei("10", "ether"),
        gas: 1000000,
      });

      dateOfFirstStackForOldStaker = Date.now() / 1000;

      await StakingInstance.unstake({ from: oldStaker });

      await StakingInstance.stake({
        from: owner,
        value: web3.utils.toWei("10", "wei"),
        gas: 1000000,
      });
    });

    // -------------- GETTER --------------- //

    it("should show staker", async () => {
      const storedData = await StakingInstance.getStaker(newStaker, {
        from: newStaker,
      });
      expect(storedData).to.be.true;
    });

    it("should show staker balance", async () => {
      const storedData = await StakingInstance.getStakedAmount(nonStaker, {
        from: newStaker,
      });
      expect(new BN(storedData.totalStaked)).to.be.bignumber.equal(new BN(0));
    });

    it("should show cooldown", async () => {
      const storedData = await StakingInstance.getRemainingCooldown(newStaker, {
        from: newStaker,
      });
      expect(new BN(storedData)).to.be.bignumber.equal(new BN(10));
    });

    it("should show number of stakers in the pool", async () => {
      const storedData = await StakingInstance.getStakersInPool({
        from: newStaker,
      });
      expect(new BN(storedData)).to.be.bignumber.equal(new BN(3));
    });

    it("should show last deposit or claim", async () => {
      const storedData = await StakingInstance.getlastDepositOrClaim(
        newStaker,
        {
          from: newStaker,
        }
      );
      expect(new BN(storedData)).to.be.bignumber.equal(
        new BN(dateOfLastStackForNewStaker)
      );
    });

    it("should show all time harvest", async () => {
      const storedData = await StakingInstance.getAllTimeHarvest(newStaker, {
        from: newStaker,
      });
      expect(new BN(storedData)).to.be.bignumber.equal(new BN(0));
    });

    it("should show first time deposit", async () => {
      const storedData = await StakingInstance.getFirstTimeDeposit(newStaker, {
        from: newStaker,
      });
      expect(new BN(storedData)).to.be.bignumber.equal(
        new BN(dateOfFirstStackForNewStaker)
      );
    });

    // --------------- NEW STAKER --------------- //

    //Expect

    it("should store total staked for newStaker", async () => {
      const storedData = await StakingInstance.stakers(newStaker, {
        from: newStaker,
      });
      expect(new BN(storedData.totalStaked / 1e18)).to.be.bignumber.equal(
        new BN(5)
      );
    });

    it("should store pool balance", async () => {
      const storedData = await StakingInstance.poolBalance({
        from: newStaker,
      });
      expect(new BN(storedData / 1e18)).to.be.bignumber.equal(new BN(25));
    });

    it("should store last deposit or claim date for newStaker", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(dateOfLastStackForNewStaker)
      );
    });

    it("should store first time deposit for newStaker", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(new BN(storedData.firstTimeDeposit)).to.be.bignumber.equal(
        new BN(dateOfFirstStackForNewStaker)
      );
    });

    it("should newStaker stored exist", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(storedData.exists).to.be.true;
    });

    it("should newStaker is stocked in the array", async () => {
      const storedData = await StakingInstance.stakerList(0);
      expect(storedData).to.be.equal(newStaker);
    });

    // -------------- STAKER -------------- //
    // Expect

    it("should store new balance for totalStaked after second stake", async () => {
      const storedData = await StakingInstance.stakers(staker, {
        from: staker,
      });

      expect(new BN(storedData.totalStaked / 1e18)).to.be.bignumber.equal(
        new BN(20)
      );
    });

    it("should store last deposit or claim date for Staker", async () => {
      const storedData = await StakingInstance.stakers(staker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(dateOfLastStackForStaker)
      );
    });

    it("should store first time deposit for newStaker", async () => {
      const storedData = await StakingInstance.stakers(staker);
      expect(new BN(storedData.firstTimeDeposit)).to.be.bignumber.equal(
        new BN(dateOfFirstStackForStaker)
      );
    });

    it("should staker stored exist", async () => {
      const storedData = await StakingInstance.stakers(staker);
      expect(storedData.exists).to.be.true;
    });

    it("should newStaker is stocked in the array", async () => {
      const storedData = await StakingInstance.stakerList(1);
      expect(storedData).to.be.equal(staker);
    });

    it("should totalRewards staker are increase", async () => {
      await StakingInstance.stake({
        from: staker,
        value: web3.utils.toWei("10", "ether"),
        gas: 1000000,
      });
      const storedData = await StakingInstance.stakers(staker);
      expect(new BN(storedData.totalRewards)).to.be.bignumber.equal(
        new BN(951293759512)
      );
    });

    it("should poolBalance has been modified after staking", async () => {
      const storedData = await StakingInstance.poolBalance({
        from: staker,
      });
      expect(new BN(storedData / 1e18)).to.be.bignumber.equal(new BN(35));
    });

    //  ------------ OLD STAKER --------------- //

    // Expect

    it("should store new balance for totalStaked after unstake", async () => {
      const storedData = await StakingInstance.stakers(oldStaker, {
        from: oldStaker,
      });

      expect(new BN(storedData.totalStaked)).to.be.bignumber.equal(new BN(0));
    });

    it("should store last deposit or claim date", async () => {
      const storedData = await StakingInstance.stakers(oldStaker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(0)
      );
    });

    it("should store first time deposit for oldStaker", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(new BN(storedData.firstTimeDeposit)).to.be.bignumber.equal(
        new BN(dateOfFirstStackForOldStaker)
      );
    });

    it("should old staker stored exist", async () => {
      const storedData = await StakingInstance.stakers(oldStaker);
      expect(storedData.exists).to.be.true;
    });

    // ------------ Revert ---------- //

    it("should revert when transfering without msg.value", async () => {
      await expectRevert(
        StakingInstance.stake({
          from: newStaker,
          value: web3.utils.toWei("0", "ether"),
          gas: 1000000,
        }),
        "You have not sent any ETH"
      );
    });

    it("should revert when partialUnstake without msg.value", async () => {
      await expectRevert(
        StakingInstance.partialUnstake(new BN(0), {
          from: newStaker,
        }),
        "No amount entered"
      );
    });

    it("should staker can't unstake more than totalStaked", async () => {
      expectRevert(
        StakingInstance.partialUnstake(new BN(10000000), {
          from: owner,
        }),
        "You don't have enough funds"
      );
    });

    it("should nonStaker can't unstake partialy", async () => {
      expectRevert(
        StakingInstance.partialUnstake(new BN(10000000), {
          from: nonStaker,
        }),
        "You didn't participate in staking"
      );
    });

    it("should old staker can't partial unstake again", async () => {
      expectRevert(
        StakingInstance.partialUnstake(new BN(10000000), {
          from: oldStaker,
        }),
        "You have nothing to unstake"
      );
    });

    it("should nonStaker can't unstake", async () => {
      expectRevert(
        StakingInstance.unstake({
          from: nonStaker,
        }),
        "You didn't participate in staking"
      );
    });

    it("should old staker can't unstake again", async () => {
      expectRevert(
        StakingInstance.unstake({
          from: oldStaker,
          gas: 1000000,
        }),
        "You don't have enough funds"
      );
    });
  });
});
