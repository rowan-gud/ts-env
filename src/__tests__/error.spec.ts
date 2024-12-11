import { EnvironmentError } from '../error';
import { EnvironmentErrorType, EnvironmentVariableType } from '../types';

describe('class EnvironmentError', () => {
  describe('withMessage()', () => {
    it('should set the message correctly', () => {
      const err = new EnvironmentError(
        EnvironmentErrorType.VariableNotFoundError,
        'key',
        { type: EnvironmentVariableType.String },
        'raw',
      ).withMessage('message');

      expect(err).toBeInstanceOf(Error);
      expect(err).toMatchObject({
        type: EnvironmentErrorType.VariableNotFoundError,
        key: 'key',
        config: {
          type: EnvironmentVariableType.String,
        },
        raw: 'raw',
        message: 'message',
      });
    });
  });
});