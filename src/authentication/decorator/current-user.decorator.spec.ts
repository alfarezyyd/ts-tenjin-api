import { CurrentUserDecorator } from './current-user.decorator';

describe('CurrentUserGuard', () => {
  it('should be defined', () => {
    expect(new CurrentUserDecorator()).toBeDefined();
  });
});
