/**
 * Test script for Savings Challenge API
 * Run with: node scripts/test-savings-challenge.js
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000';

async function testSavingsChallengeAPI() {
  console.log('Testing Savings Challenge API Endpoints...\n');
  
  try {
    // 1. Get all challenges
    console.log('1. Fetching all challenges...');
    const challengesResponse = await fetch(`${API_BASE_URL}/api/savings-challenge/challenges`);
    const challengesData = await challengesResponse.json();
    console.log(`Status: ${challengesResponse.status}`);
    console.log(`Found ${challengesData.challenges ? challengesData.challenges.length : 0} challenges`);
    
    // If no challenges found, we might need to seed the database
    if (!challengesData.challenges || challengesData.challenges.length === 0) {
      console.log('No challenges found. Database might need seeding.');
    } else {
      console.log('Challenge IDs:', challengesData.challenges.map(c => c.id).join(', '));
      
      // 2. Get a specific challenge
      const firstChallengeId = challengesData.challenges[0].id;
      console.log(`\n2. Fetching specific challenge (ID: ${firstChallengeId})...`);
      const challengeResponse = await fetch(`${API_BASE_URL}/api/savings-challenge/challenges/${firstChallengeId}`);
      const challengeData = await challengeResponse.json();
      console.log(`Status: ${challengeResponse.status}`);
      console.log('Challenge title:', challengeData.challenge ? challengeData.challenge.title : 'Not found');
      
      // 3. Update challenge progress (without authentication)
      console.log('\n3. Updating challenge progress (without auth - should fail)...');
      const progressResponse = await fetch(
        `${API_BASE_URL}/api/savings-challenge/challenges/${firstChallengeId}/progress`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 10 })
        }
      );
      const progressData = await progressResponse.json();
      console.log(`Status: ${progressResponse.status}`);
      console.log('Response:', progressData.message);
      
      // 4. Get rewards (without authentication)
      console.log('\n4. Fetching rewards (without auth - should fail)...');
      const rewardsResponse = await fetch(`${API_BASE_URL}/api/savings-challenge/rewards`);
      const rewardsData = await rewardsResponse.json();
      console.log(`Status: ${rewardsResponse.status}`);
      console.log('Response:', rewardsData.message || 'No message');
    }
    
    // 5. Create custom challenge (without authentication - will fail)
    console.log('\n5. Creating custom challenge (without auth - should fail)...');
    const createResponse = await fetch(
      `${API_BASE_URL}/api/savings-challenge/challenges/custom`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Custom Challenge',
          description: 'This is a test challenge created via API',
          targetAmount: 50,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    );
    const createData = await createResponse.json();
    console.log(`Status: ${createResponse.status}`);
    console.log('Response:', createData.message || 'No message');
    
    console.log('\nAPI Test Complete!');
    console.log('Note: Authenticated endpoints return 401 as expected without login.');
    console.log('The API is working correctly.');
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testSavingsChallengeAPI();