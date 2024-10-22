class ExpenseCalculator {
    static calculateEqualSplit(totalAmount, numberOfPeople) {
      const amountPerPerson = totalAmount / numberOfPeople;
      return Number(amountPerPerson.toFixed(2));
    }
  
    static validateExactSplit(totalAmount, splits) {
      const sum = splits.reduce((acc, split) => acc + split.amount, 0);
      return Math.abs(sum - totalAmount) < 0.01;
    }
  
    static validatePercentageSplit(splits) {
      const sum = splits.reduce((acc, split) => acc + split.percentage, 0);
      return Math.abs(sum - 100) < 0.01;
    }
  
    static calculatePercentageSplit(totalAmount, percentage) {
      return Number((totalAmount * (percentage / 100)).toFixed(2));
    }
  }
  
  module.exports = ExpenseCalculator;