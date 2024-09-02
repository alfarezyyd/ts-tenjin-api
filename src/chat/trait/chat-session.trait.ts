class ChatSessionTrait {
  sessionId: string;
  userUniqueId: string;
  name: string;
}

export default class ChatSessionTraitBuilder {
  sessionId: string;
  userUniqueId: string;
  name: string;
  setSessionId(sessionId: string): ChatSessionTraitBuilder {
    this.sessionId = sessionId;
    return this;
  }
  setUserUniqueId(userUniqueId: string): ChatSessionTraitBuilder {
    this.userUniqueId = userUniqueId;
    return this;
  }
  setName(name: string): ChatSessionTraitBuilder {
    this.name = name;
    return this;
  }
}
