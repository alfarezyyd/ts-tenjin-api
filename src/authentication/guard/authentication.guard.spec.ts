import { AuthenticationGuard } from './authentication.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthenticationGuard()).toBeDefined();
  });
});
