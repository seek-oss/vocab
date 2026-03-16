import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import readline from 'readline';
import { promptConfirmation, promptChoice } from './prompt-utils';

// Mock readline
vi.mock('readline', () => ({
  default: {
    createInterface: vi.fn(),
  },
}));

describe('prompt-utils', () => {
  let mockRl: any;
  let mockQuestion: any;
  let mockClose: any;

  beforeEach(() => {
    mockQuestion = vi.fn();
    mockClose = vi.fn();
    mockRl = {
      question: mockQuestion,
      close: mockClose,
    };

    vi.mocked(readline.createInterface).mockReturnValue(mockRl);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('promptConfirmation', () => {
    it('should return true for "y" input', async () => {
      // Simulate user typing "y"
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('y');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(true);
      expect(mockClose).toHaveBeenCalled();
    });

    it('should return true for "yes" input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('yes');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(true);
    });

    it('should return false for "n" input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('n');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(false);
    });

    it('should return false for "no" input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('no');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(false);
    });

    it('should return default value for empty input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('');
        },
      );

      const result = await promptConfirmation('Continue?', true);

      expect(result).toBe(true);
    });

    it('should return default value for whitespace input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('   ');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(false);
    });

    it('should be case insensitive', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('Y');
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(true);
    });

    it('should handle invalid input by asking again', async () => {
      let callCount = 0;
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callCount++;
          if (callCount === 1) {
            callback('invalid');
          } else {
            callback('y');
          }
        },
      );

      const result = await promptConfirmation('Continue?', false);

      expect(result).toBe(true);
      expect(mockQuestion).toHaveBeenCalledTimes(2);
    });
  });

  describe('promptChoice', () => {
    const choices = ['Option 1', 'Option 2', 'Option 3'];

    it('should return correct choice index for valid input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('2');
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(1); // 0-based index for choice 2
    });

    it('should return default choice for empty input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('');
        },
      );

      const result = await promptChoice('Select option:', choices, 1);

      expect(result).toBe(1);
    });

    it('should return default choice for whitespace input', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('  ');
        },
      );

      const result = await promptChoice('Select option:', choices, 2);

      expect(result).toBe(2);
    });

    it('should handle first choice correctly', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('1');
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(0);
    });

    it('should handle last choice correctly', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback('3');
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(2);
    });

    it('should handle invalid choice by asking again', async () => {
      let callCount = 0;
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callCount++;
          if (callCount === 1) {
            callback('4'); // Invalid choice
          } else {
            callback('1');
          }
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(0);
      expect(mockQuestion).toHaveBeenCalledTimes(2);
    });

    it('should handle zero input as invalid', async () => {
      let callCount = 0;
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callCount++;
          if (callCount === 1) {
            callback('0'); // Invalid choice (should be 1-based)
          } else {
            callback('1');
          }
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(0);
      expect(mockQuestion).toHaveBeenCalledTimes(2);
    });

    it('should handle non-numeric input as invalid', async () => {
      let callCount = 0;
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callCount++;
          if (callCount === 1) {
            callback('abc');
          } else {
            callback('2');
          }
        },
      );

      const result = await promptChoice('Select option:', choices, 0);

      expect(result).toBe(1);
      expect(mockQuestion).toHaveBeenCalledTimes(2);
    });

    it('should format the question correctly', async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          expect(question).toContain('Test question');
          expect(question).toContain('1. First');
          expect(question).toContain('2. Second');
          expect(question).toContain('Enter choice (1-2, default: 1):');
          callback('1');
        },
      );

      await promptChoice('Test question', ['First', 'Second'], 0);

      expect(mockQuestion).toHaveBeenCalledTimes(1);
    });
  });
});
