import readline from 'readline';

/**
 * Prompt the user for confirmation
 * @param question Question to ask the user
 * @param defaultAnswer Default answer if user just presses enter
 * @returns Promise that resolves to user's answer
 */
export async function promptConfirmation(
  question: string,
  defaultAnswer: boolean = false,
): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} `, (answer) => {
      rl.close();

      const normalizedAnswer = answer.toLowerCase().trim();

      if (normalizedAnswer === '') {
        resolve(defaultAnswer);
      } else if (normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
        resolve(true);
      } else if (normalizedAnswer === 'n' || normalizedAnswer === 'no') {
        resolve(false);
      } else {
        // Invalid input, ask again
        resolve(promptConfirmation(question, defaultAnswer));
      }
    });
  });
}

/**
 * Prompt the user with multiple choices
 * @param question Question to ask
 * @param choices Array of choices
 * @param defaultChoice Default choice index
 * @returns Promise that resolves to selected choice index
 */
export async function promptChoice(
  question: string,
  choices: string[],
  defaultChoice: number = 0,
): Promise<number> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const formattedChoices = choices
      .map((choice, index) => `${index + 1}. ${choice}`)
      .join('\n');

    const prompt = `${question}\n${formattedChoices}\nEnter choice (1-${choices.length}, default: ${defaultChoice + 1}): `;

    rl.question(prompt, (answer) => {
      rl.close();

      const normalizedAnswer = answer.trim();

      if (normalizedAnswer === '') {
        resolve(defaultChoice);
      } else {
        const choiceNumber = parseInt(normalizedAnswer, 10);
        if (choiceNumber >= 1 && choiceNumber <= choices.length) {
          resolve(choiceNumber - 1);
        } else {
          // Invalid input, ask again
          resolve(promptChoice(question, choices, defaultChoice));
        }
      }
    });
  });
}
