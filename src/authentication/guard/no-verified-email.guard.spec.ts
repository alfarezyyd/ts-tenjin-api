import { NoVerifiedEmailGuard } from './no-verified-email.guard';

describe('NoVerifiedEmailGuard', () => {
  it('should be defined', () => {
    expect(new NoVerifiedEmailGuard()).toBeDefined();
  });
});
