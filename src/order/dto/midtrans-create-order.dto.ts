import { Decimal } from '@prisma/client/runtime/library';

class MidtransCreateOrderDto {
  transaction_details: { order_id: string; gross_amount: Decimal };
  credit_card: { secure: boolean };
  customer_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  constructor(builder: MidtransCreateOrderDtoBuilder) {
    this.transaction_details = builder.transaction_details;
    this.credit_card = builder.credit_card;
    this.customer_details = builder.customer_details;
  }
}

export class MidtransCreateOrderDtoBuilder {
  transaction_details: { order_id: string; gross_amount: Decimal } = {
    order_id: '',
    gross_amount: new Decimal(0),
  };
  credit_card: { secure: boolean } = { secure: false };
  customer_details: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  } = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  };

  setTransactionDetails(
    order_id: string,
    gross_amount: Decimal,
  ): MidtransCreateOrderDtoBuilder {
    this.transaction_details = { order_id, gross_amount };
    return this;
  }

  setCreditCard(secure: boolean): MidtransCreateOrderDtoBuilder {
    this.credit_card = { secure };
    return this;
  }

  setCustomerDetails(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
  ): MidtransCreateOrderDtoBuilder {
    this.customer_details = { first_name, last_name, email, phone };
    return this;
  }

  build(): MidtransCreateOrderDto {
    return new MidtransCreateOrderDto(this);
  }
}
