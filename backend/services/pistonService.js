const axios = require('axios');

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = 'aaba4bd61fmshfc98e06b6159b9bp12247ajsna98efb39cf6f';

// Language ID mapping for Judge0 API
const languageIdMap = {
  'python': 92,
  'javascript': 93,
  'java': 91,
  'cpp': 105,
  'c': 103
};

/**
 * Execute code using Judge0 API
 */
const executeCode = async (language, code, input = '') => {
  try {
    const languageId = languageIdMap[language.toLowerCase()];

    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Step 1: Submit code to Judge0
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
      {
        language_id: languageId,
        source_code: code,
        stdin: input
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    const token = submitResponse.data.token;

    // Step 2: Poll for result (wait until done)
    let result = null;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const resultResponse = await axios.get(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        }
      );

      result = resultResponse.data;

      // Status IDs: 1 = In Queue, 2 = Processing, 3 = Accepted, others = done
      if (result.status.id > 2) {
        break;
      }
    }

    const stdout = result.stdout || '';
    const stderr = result.stderr || '';
    const compileOutput = result.compile_output || '';
    const exitCode = result.status.id === 3 ? 0 : 1;

    return {
      success: result.status.id === 3,
      output: stdout,
      stderr: stderr,
      stdout: stdout,
      compile_output: compileOutput,
      execution_time: result.time || null,
      memory_used: result.memory || null,
      exit_code: exitCode
    };

  } catch (error) {
    console.error('Judge0 API Error:', error.response?.data || error.message);
    return {
      success: false,
      output: '',
      stderr: error.message,
      stdout: '',
      compile_output: '',
      execution_time: null,
      memory_used: null,
      exit_code: 1
    };
  }
};

/**
 * Get supported languages
 */
const getSupportedLanguages = async () => {
  try {
    const response = await axios.get(
      `${JUDGE0_API_URL}/languages`,
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch supported languages:', error.message);
    return [];
  }
};

module.exports = {
  executeCode,
  getSupportedLanguages
};