// File: script.js
// FINAL CORRECTED VERSION - This now knows how to talk to your backend API.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('apology-form');
    const resultContainer = document.getElementById('result-container');
    const loader = document.getElementById('loader');
    const outputWrapper = document.getElementById('apology-output-wrapper');
    const apologyOutput = document.getElementById('apology-output');
    const copyBtn = document.getElementById('copy-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const recipient = document.getElementById('recipient').value.trim();
        const mistake = document.getElementById('mistake').value.trim();
        const tone = document.getElementById('tone').value;

        if (!recipient || !mistake) {
            alert('Please fill out all fields.');
            return;
        }

        resultContainer.classList.remove('hidden');
        loader.classList.remove('hidden');
        outputWrapper.classList.add('hidden');
        
        // --- CORRECTED API CALL SECTION ---

        const BACKEND_ENDPOINT = 'https://ai-backend.neurakit.workers.dev/tool2';

        // Construct a clear prompt, just like your previous project did.
        const prompt = `
            You are an expert AI apology writer. Please generate a ${tone} apology.
            The apology is for: "${recipient}".
            The mistake that was made is: "${mistake}".
            Generate only the apology text itself, without any extra commentary.
        `;

        try {
            const response = await fetch(BACKEND_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // The body now sends a 'prompt' key, which is what the backend expects.
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend API Response:", data); // Good for debugging!

            let generatedText;
            
            // --- THIS IS THE CRUCIAL FIX ---
            // We now check all the possible places for the answer, just like your working code.
            // This makes our code robust and prevents the 'undefined' error.
            if (data.response) {
                generatedText = data.response;
            } else if (data.choices && data.choices[0]?.message?.content) {
                generatedText = data.choices[0].message.content;
            } else if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                generatedText = data.candidates[0].content.parts[0].text;
            } else if (data.text) {
                generatedText = data.text;
            } else {
                // If we can't find the text anywhere, we throw an error.
                throw new Error('Could not find a valid response in the API data.');
            }
            
            // Now, `generatedText` will have a value, and .trim() will work correctly.
            apologyOutput.textContent = generatedText.trim();

        } catch (error) {
            console.error('Error generating apology:', error);
            apologyOutput.textContent = 'Sorry, we encountered an error. Please check the console for details and try again. Error: ' + error.message;
        } finally {
            loader.classList.add('hidden');
            outputWrapper.classList.remove('hidden');
        }
    });

    // Copy to clipboard functionality (this part is the same)
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(apologyOutput.textContent).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
});