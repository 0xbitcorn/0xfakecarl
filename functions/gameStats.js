async function gameStats(pgClient, selectedPuzzleId){
    try {
    
          // Query to get puzzle solves based on the selected puzzle ID
          const uniqueAnswersQuery = `
            SELECT user_id, solved_at, attempts, submission
            FROM oldman.puzzle_solves
            WHERE puzzle_id = $1`;
          const uniqueAnswersResult = await pgClient.query(uniqueAnswersQuery, [selectedPuzzleId]);
          const uniqueAnswers = uniqueAnswersResult.rows;

      // Reply to the interaction with the text file attached
        return uniqueAnswers;
    } catch (error) {
      console.error('Error executing SQL query:', error.message);
    }
  };

  module.exports = {
    gameStats
  }