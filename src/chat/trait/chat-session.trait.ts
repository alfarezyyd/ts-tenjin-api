export class ChatSessionTrait {
  sessionId: string;
  userUniqueId: string;
  email: string;
}

export class ChatSessionTraitBuilder {
  sessionId: string;
  userUniqueId: string;
  email: string;
  setSessionId(sessionId: string): ChatSessionTraitBuilder {
    this.sessionId = sessionId;
    return this;
  }
  setUserUniqueId(userUniqueId: string): ChatSessionTraitBuilder {
    this.userUniqueId = userUniqueId;
    return this;
  }
  setEmail(email: string): ChatSessionTraitBuilder {
    this.email = email;
    return this;
  }
}
